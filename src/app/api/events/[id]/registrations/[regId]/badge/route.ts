import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateBadgePNG } from "@/lib/badge";
import { NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string; regId: string }> };

// GET /api/events/[id]/registrations/[regId]/badge
export async function GET(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id: eventId, regId } = await params;

  const registration = await prisma.registration.findUnique({
    where: { id: regId },
    include: {
      event: true,
      attendee: { select: { id: true, name: true, email: true } },
      ticketType: true,
    },
  });

  if (!registration) return new Response("Not found", { status: 404 });

  // Only attendee themselves or organizer can download
  const isOwner = registration.attendeeId === session.user.id;
  const isOrganizer =
    session.user.role === "ORGANIZER" &&
    registration.event.organizerId === session.user.id;

  if (!isOwner && !isOrganizer) {
    return new Response("Forbidden", { status: 403 });
  }

  const event = registration.event;
  const dateStr = new Date(event.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const png = await generateBadgePNG({
    eventTitle: event.title,
    attendeeName: registration.attendee.name,
    ticketType: registration.ticketType.name,
    eventDate: event.startTime ? `${dateStr} · ${event.startTime}` : dateStr,
    eventLocation: event.location ?? undefined,
    backgroundImageURL: event.badgeBackgroundURL ?? undefined,
  });

  // Mark badge as issued
  await prisma.registration.update({
    where: { id: regId },
    data: { badgeIssuedAt: new Date() },
  });

  const safeName = registration.attendee.name.replace(/[^a-z0-9]/gi, "_");
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="badge-${safeName}.png"`,
      "Cache-Control": "no-store",
    },
  });
}
