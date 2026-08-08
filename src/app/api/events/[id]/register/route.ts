import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createQRString } from "@/lib/qr";
import { NextRequest } from "next/server";
import crypto from "crypto";
import { getQuestionType, serializeAnswer, validateAnswer } from "@/lib/questions";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/events/[id]/register
export async function POST(req: NextRequest, { params }: Ctx) {
  const { id: eventId } = await params;

  // Fetch event with ticket types and custom fields
  const event = await prisma.event.findUnique({
    where: { id: eventId, isPublished: true },
    include: { ticketTypes: true, customFields: true },
  });
  if (!event) return Response.json({ error: "Event not found" }, { status: 404 });

  const session = await getServerSession(authOptions);
  const isExhibition = event.eventType === "EXHIBITION";
  // All event types support guest registration — no login required
  const isGuest = !session;

  // (No 401 block — open registration for all published events)

  const body = await req.json();
  const { ticketTypeId, answers, guestName, guestPhone, guestEmail } = body as {
    ticketTypeId: string;
    answers: { customFieldId: string; fieldName: string; answerValue: unknown }[];
    guestName?: string;
    guestPhone?: string;
    guestEmail?: string;
  };

  // Validate core attendee fields
  if (!guestName || !guestName.trim()) {
    return Response.json({ error: "Full Name is required." }, { status: 400 });
  }
  if (isExhibition) {
    if (!guestPhone || !guestPhone.trim()) {
      return Response.json({ error: "Phone Number is required for Exhibition registration." }, { status: 400 });
    }
  } else {
    // Standard event — email required
    if (!guestEmail || !guestEmail.trim()) {
      return Response.json({ error: "Email Address is required." }, { status: 400 });
    }
  }

  // Check duplicate registration
  if (session) {
    const existing = await prisma.registration.findFirst({
      where: { eventId, attendeeId: session.user.id },
    });
    if (existing) {
      return Response.json({ error: "Already registered", registrationId: existing.id }, { status: 409 });
    }
  } else if (isExhibition && guestPhone) {
    // Exhibition guests: deduplicate by phone
    const existing = await prisma.registration.findFirst({
      where: { eventId, guestPhone: guestPhone.trim() },
    });
    if (existing) {
      return Response.json({ error: "This phone number is already registered for this event.", registrationId: existing.id }, { status: 409 });
    }
  } else if (!isExhibition && guestEmail) {
    // Standard guests: deduplicate by email
    const existing = await prisma.registration.findFirst({
      where: { eventId, guestEmail: guestEmail.trim() },
    });
    if (existing) {
      return Response.json({ error: "This email address is already registered for this event.", registrationId: existing.id }, { status: 409 });
    }
  }

  // Check capacity
  if (event.capacity) {
    const count = await prisma.registration.count({ where: { eventId } });
    if (count >= event.capacity) {
      return Response.json({ error: "Event is full" }, { status: 409 });
    }
  }

  // Validate ticket type belongs to event
  const ticket = event.ticketTypes.find((t) => t.id === ticketTypeId);
  if (!ticket) {
    return Response.json({ error: "Invalid ticket type" }, { status: 400 });
  }

  // Validate custom field answers through the question registry, and build the
  // rows to persist. Layout/computed types are skipped: they carry no answer.
  const answerRows: { customFieldId: string; fieldName: string; answerValue: string }[] = [];

  for (const field of event.customFields) {
    const config = getQuestionType(field.fieldType);
    if (config?.noAnswer) continue;

    const submitted = answers?.find((a) => a.customFieldId === field.id);
    const rawValue = submitted?.answerValue;

    const error = validateAnswer(rawValue, field);
    if (error) {
      return Response.json({ error }, { status: 400 });
    }

    const serialized = serializeAnswer(rawValue, field.fieldType);
    // Don't store empty answers for optional questions.
    if (serialized === "" || serialized === "[]") continue;

    answerRows.push({
      customFieldId: field.id,
      fieldName: field.label,
      answerValue: serialized,
    });
  }

  // Unique key for guest vs logged in user
  const uniqueId = session ? session.user.id : `guest-${crypto.randomUUID()}`;
  const qrCodeString = createQRString(eventId + "-" + uniqueId);

  // Create registration — always store name, email, phone from form
  const registration = await prisma.registration.create({
    data: {
      eventId,
      attendeeId: session ? session.user.id : null,
      guestName: guestName.trim(),
      guestPhone: guestPhone?.trim() || null,
      guestEmail: guestEmail?.trim() || null,
      ticketTypeId,
      status: "CONFIRMED",
      qrCodeString,
      customAnswers: {
        create: answerRows,
      },
    },
    include: {
      event: true,
      ticketType: true,
      customAnswers: true,
    },
  });

  return Response.json(registration, { status: 201 });
}
