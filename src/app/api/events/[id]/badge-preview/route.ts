import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateBadgePNG } from "@/lib/badge";
import { NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/events/[id]/badge-preview
export async function GET(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.email === "admin@eventkh.com";
  const isOrganizer = session.user.role === "ORGANIZER";

  if (!isOrganizer && !isAdmin) {
    return new Response("Forbidden", { status: 403 });
  }

  const { id: eventId } = await params;
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { ticketTypes: true },
  });

  if (!event) return new Response("Not found", { status: 404 });
  if (event.organizerId !== session.user.id && !isAdmin) {
    return new Response("Forbidden", { status: 403 });
  }

  // Parse draft configurations from query parameters
  const { searchParams } = new URL(req.url);
  const enabled = searchParams.get("enabled") === "true";
  const size = searchParams.get("size") || "3*4";
  const orientation = searchParams.get("orientation") || "vertical";
  const bg = searchParams.get("bg") || "";
  const qrX = searchParams.get("qrX") ? parseInt(searchParams.get("qrX")!) : undefined;
  const qrY = searchParams.get("qrY") ? parseInt(searchParams.get("qrY")!) : undefined;
  const qrSize = searchParams.get("qrSize") ? parseInt(searchParams.get("qrSize")!) : undefined;

  const dateStr = new Date(event.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const ticketType = event.ticketTypes?.[0]?.name || "VIP PASS";

  const png = await generateBadgePNG({
    eventTitle: event.title,
    attendeeName: "John Doe",
    ticketType,
    eventDate: event.startTime ? `${dateStr} · ${event.startTime}` : dateStr,
    eventLocation: event.location ?? undefined,
    backgroundImageURL: bg || undefined,
    badgeEnabled: enabled,
    badgeSize: size,
    badgeOrientation: orientation,
    badgeQrPositionX: qrX,
    badgeQrPositionY: qrY,
    badgeQrSize: qrSize,
  });

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'attachment; filename="mock-badge-preview.png"',
      "Cache-Control": "no-store",
    },
  });
}
