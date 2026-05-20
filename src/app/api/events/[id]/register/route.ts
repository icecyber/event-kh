import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createQRString } from "@/lib/qr";
import { NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/events/[id]/register
export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await params;

  // Fetch event with ticket types and custom fields
  const event = await prisma.event.findUnique({
    where: { id: eventId, isPublished: true },
    include: { ticketTypes: true, customFields: true },
  });
  if (!event) return Response.json({ error: "Event not found" }, { status: 404 });

  // Check duplicate registration
  const existing = await prisma.registration.findFirst({
    where: { eventId, attendeeId: session.user.id },
  });
  if (existing) {
    return Response.json({ error: "Already registered", registrationId: existing.id }, { status: 409 });
  }

  // Check capacity
  if (event.capacity) {
    const count = await prisma.registration.count({ where: { eventId } });
    if (count >= event.capacity) {
      return Response.json({ error: "Event is full" }, { status: 409 });
    }
  }

  const body = await req.json();
  const { ticketTypeId, answers } = body as {
    ticketTypeId: string;
    answers: { customFieldId: string; fieldName: string; answerValue: string }[];
  };

  // Validate ticket type belongs to event
  const ticket = event.ticketTypes.find((t) => t.id === ticketTypeId);
  if (!ticket) {
    return Response.json({ error: "Invalid ticket type" }, { status: 400 });
  }

  // Validate required custom fields
  for (const field of event.customFields) {
    if (field.required) {
      const answer = answers?.find((a) => a.customFieldId === field.id);
      if (!answer || !answer.answerValue.trim()) {
        return Response.json(
          { error: `Field "${field.label}" is required` },
          { status: 400 }
        );
      }
    }
  }

  // Create registration
  const registration = await prisma.registration.create({
    data: {
      eventId,
      attendeeId: session.user.id,
      ticketTypeId,
      status: "CONFIRMED",
      qrCodeString: createQRString(eventId + "-" + session.user.id),
      customAnswers: {
        create: (answers ?? []).map((a) => ({
          customFieldId: a.customFieldId,
          fieldName: a.fieldName,
          answerValue: a.answerValue,
        })),
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
