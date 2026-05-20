import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

// GET /api/events — list all published events (public)
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") ?? "";

  const events = await prisma.event.findMany({
    where: {
      isPublished: true,
      title: search ? { contains: search } : undefined,
    },
    include: {
      organizer: { select: { name: true } },
      ticketTypes: true,
      _count: { select: { registrations: true } },
    },
    orderBy: { date: "asc" },
  });

  return Response.json(events);
}

// POST /api/events — create event (ORGANIZER only)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ORGANIZER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const {
    title,
    description,
    date,
    startTime,
    endTime,
    location,
    capacity,
    bannerImageURL,
    badgeBackgroundURL,
    ticketTypes,
    customFields,
  } = body;

  if (!title || !date) {
    return Response.json({ error: "title and date are required" }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      title,
      description,
      date: new Date(date),
      startTime,
      endTime,
      location,
      capacity: capacity ? Number(capacity) : null,
      bannerImageURL,
      badgeBackgroundURL,
      organizerId: session.user.id,
      ticketTypes: {
        create: (ticketTypes ?? [{ name: "General", price: 0 }]).map(
          (t: { name: string; price: number; quantityAvailable?: number }) => ({
            name: t.name,
            price: t.price ?? 0,
            quantityAvailable: t.quantityAvailable ?? null,
          })
        ),
      },
      customFields: {
        create: (customFields ?? []).map(
          (
            f: { label: string; fieldType: string; required?: boolean; options?: string[]; order?: number },
            idx: number
          ) => ({
            label: f.label,
            fieldType: f.fieldType,
            required: f.required ?? false,
            options: f.options ? JSON.stringify(f.options) : null,
            order: f.order ?? idx,
          })
        ),
      },
    },
    include: { ticketTypes: true, customFields: true },
  });

  return Response.json(event, { status: 201 });
}
