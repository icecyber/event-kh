import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string; regId: string }> };

// GET /api/events/[id]/registrations/[regId] — get single registration
export async function GET(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: eventId, regId } = await params;

  const registration = await prisma.registration.findUnique({
    where: { id: regId },
    include: {
      event: true,
      attendee: { select: { id: true, name: true, email: true } },
      ticketType: true,
      customAnswers: { include: { customField: true } },
    },
  });

  if (!registration) return Response.json({ error: "Not found" }, { status: 404 });

  // Only organizer, attendee themselves or administrator can view
  const isAdmin = session.user.role === "ADMIN" || session.user.email === "admin@eventkh.com";
  const isOwner = registration.attendeeId === session.user.id;
  const isOrganizer =
    session.user.role === "ORGANIZER" &&
    registration.event.organizerId === session.user.id;

  if (!isOwner && !isOrganizer && !isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return Response.json(registration);
}

// PATCH /api/events/[id]/registrations/[regId] — undo check-in
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.email === "admin@eventkh.com";
  const isOrganizer = session.user.role === "ORGANIZER";

  if (!isOrganizer && !isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: eventId, regId } = await params;
  const body = await req.json();

  const registration = await prisma.registration.findUnique({
    where: { id: regId },
    include: { event: { select: { organizerId: true } } },
  });

  if (!registration) return Response.json({ error: "Not found" }, { status: 404 });
  if (registration.event.organizerId !== session.user.id && !isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Undo check-in
  if (body.action === "undo-checkin") {
    const updated = await prisma.registration.update({
      where: { id: regId },
      data: {
        checkedInAt: null,
        status: "PENDING",
      },
    });
    return Response.json(updated);
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}

// DELETE /api/events/[id]/registrations/[regId]
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.email === "admin@eventkh.com";
  const isOrganizer = session.user.role === "ORGANIZER";

  if (!isOrganizer && !isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: eventId, regId } = await params;

  const registration = await prisma.registration.findUnique({
    where: { id: regId },
    include: { event: { select: { organizerId: true } } },
  });

  if (!registration) return Response.json({ error: "Not found" }, { status: 404 });
  if (registration.event.organizerId !== session.user.id && !isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.registration.delete({ where: { id: regId } });
  return Response.json({ success: true });
}
