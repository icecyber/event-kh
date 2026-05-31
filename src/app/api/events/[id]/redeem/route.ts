import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/events/[id]/redeem — mark registration as checked in
export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.email === "admin@eventkh.com";
  const isOrganizer = session.user.role === "ORGANIZER";

  if (!isOrganizer && !isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: eventId } = await params;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return Response.json({ error: "Event not found" }, { status: 404 });
  if (event.organizerId !== session.user.id && !isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { qrCodeString, registrationId, lookupOnly } = await req.json();

  // Find registration by QR string or by ID
  const where = qrCodeString
    ? { qrCodeString, eventId }
    : { id: registrationId, eventId };

  const registration = await prisma.registration.findFirst({
    where,
    include: {
      attendee: { select: { id: true, name: true, email: true } },
      ticketType: true,
    },
  });

  if (!registration) {
    return Response.json({ error: "Registration not found" }, { status: 404 });
  }

  if (lookupOnly) {
    const attendee = registration.attendee || {
      id: null,
      name: registration.guestName,
      email: registration.guestEmail || registration.guestPhone,
    };
    return Response.json({
      ...registration,
      attendee,
    });
  }

  if (registration.checkedInAt) {
    const attendee = registration.attendee || {
      id: null,
      name: registration.guestName,
      email: registration.guestEmail || registration.guestPhone,
    };
    return Response.json(
      {
        error: "Already checked in",
        checkedInAt: registration.checkedInAt,
        attendee,
      },
      { status: 409 }
    );
  }

  const updated = await prisma.registration.update({
    where: { id: registration.id },
    data: {
      checkedInAt: new Date(),
      status: "CHECKED_IN",
    },
    include: {
      attendee: { select: { id: true, name: true, email: true } },
      ticketType: true,
    },
  });

  const responseData = {
    ...updated,
    attendee: updated.attendee || {
      id: null,
      name: updated.guestName,
      email: updated.guestEmail || updated.guestPhone,
    },
  };

  return Response.json(responseData);
}
