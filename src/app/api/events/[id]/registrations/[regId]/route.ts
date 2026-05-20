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

  // Only organizer or attendee themselves can view
  const isOwner = registration.attendeeId === session.user.id;
  const isOrganizer =
    session.user.role === "ORGANIZER" &&
    registration.event.organizerId === session.user.id;

  if (!isOwner && !isOrganizer) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return Response.json(registration);
}
