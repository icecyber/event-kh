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
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.email === "admin@eventkh.com";
  const isOrganizer = session.user.role === "ORGANIZER";

  if (!isOrganizer && !isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return Response.json({ error: "Not found" }, { status: 404 });
  if (event.organizerId !== session.user.id && !isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description || null;
  if (body.date !== undefined) data.date = new Date(body.date);
  if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;
  if (body.startTime !== undefined) data.startTime = body.startTime || null;
  if (body.endTime !== undefined) data.endTime = body.endTime || null;
  if (body.location !== undefined) data.location = body.location || null;
  if (body.capacity !== undefined) data.capacity = body.capacity != null ? Number(body.capacity) : null;
  if (body.bannerImageURL !== undefined) data.bannerImageURL = body.bannerImageURL || null;
  if (body.badgeBackgroundURL !== undefined) data.badgeBackgroundURL = body.badgeBackgroundURL || null;
  if (body.badgeEnabled !== undefined) data.badgeEnabled = Boolean(body.badgeEnabled);
  if (body.badgeSize !== undefined) data.badgeSize = body.badgeSize;
  if (body.badgeOrientation !== undefined) data.badgeOrientation = body.badgeOrientation;

  const updated = await prisma.event.update({
    where: { id },
    data,
  });

  return Response.json(updated);
}

// DELETE /api/events/[id]
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.email === "admin@eventkh.com";
  const isOrganizer = session.user.role === "ORGANIZER";

  if (!isOrganizer && !isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return Response.json({ error: "Not found" }, { status: 404 });
  if (event.organizerId !== session.user.id && !isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.event.delete({ where: { id } });
  return Response.json({ success: true });
}
