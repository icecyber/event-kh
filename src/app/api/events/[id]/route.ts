import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/events/[id]
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      ticketTypes: true,
      customFields: { orderBy: { order: "asc" } },
      _count: { select: { registrations: true } },
    },
  });

  if (!event) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(event);
}

// PATCH /api/events/[id]
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ORGANIZER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return Response.json({ error: "Not found" }, { status: 404 });
  if (event.organizerId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.event.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      date: body.date ? new Date(body.date) : undefined,
      endDate: body.endDate !== undefined ? (body.endDate ? new Date(body.endDate) : null) : undefined,
      startTime: body.startTime,
      endTime: body.endTime,
      location: body.location,
      capacity: body.capacity != null ? Number(body.capacity) : undefined,
      bannerImageURL: body.bannerImageURL,
      badgeBackgroundURL: body.badgeBackgroundURL,
      badgeEnabled: body.badgeEnabled !== undefined ? Boolean(body.badgeEnabled) : undefined,
      badgeSize: body.badgeSize,
      badgeOrientation: body.badgeOrientation,
    },
  });

  return Response.json(updated);
}

// DELETE /api/events/[id]
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ORGANIZER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return Response.json({ error: "Not found" }, { status: 404 });
  if (event.organizerId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.event.delete({ where: { id } });
  return Response.json({ success: true });
}
