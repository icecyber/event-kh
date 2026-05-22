import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateBadgePNG } from "@/lib/badge";
import { NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/events/[id]/badge-preview
export async function GET(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ORGANIZER") {
    return new Response("Forbidden", { status: 403 });
  }

  const { id: eventId } = await params;
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { ticketTypes: true },
  });

  if (!event) return new Response("Not found", { status: 404 });
  if (event.organizerId !== session.user.id) {
    return new Response("Forbidden", { status: 403 });
  }

  // Parse draft configurations from query parameters
  const { searchParams } = new URL(req.url);
  const enabled = searchParams.get("enabled") === "true";
  const size = searchParams.get("size") || "3*4";
  const orientation = searchParams.get("orientation") || "vertical";
  const bg = searchParams.get("bg") || "";

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
  });

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'attachment; filename="mock-badge-preview.png"',
      "Cache-Control": "no-store",
    },
  });
}
