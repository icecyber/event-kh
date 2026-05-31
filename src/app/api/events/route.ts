import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";
import { generateUniqueSlug } from "@/lib/slug";

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
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user.role === "ADMIN" || session.user.email === "admin@eventkh.com";
    const isOrganizer = session.user.role === "ORGANIZER";

    if (!isOrganizer && !isAdmin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      date,
      endDate,
      startTime,
      endTime,
      location,
      capacity,
      bannerImageURL,
      badgeBackgroundURL,
      badgeEnabled,
      badgeSize,
      badgeOrientation,
      eventType,
      ticketTypes,
      customFields,
    } = body;

    if (!title || !date) {
      return Response.json({ error: "title and date are required" }, { status: 400 });
    }

    // Verify organizer user exists in database to prevent P2003 foreign key violation due to stale session cookies
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!userExists) {
      return Response.json({
        error: "Your session is invalid or your account no longer exists. Please sign out and sign back in to refresh your session."
      }, { status: 401 });
    }

    const slug = await generateUniqueSlug(title);

    const event = await prisma.event.create({
      data: {
        slug,
        title,
        description,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        startTime,
        endTime,
        location,
        capacity: capacity ? Number(capacity) : null,
        bannerImageURL,
        badgeBackgroundURL,
        badgeEnabled: badgeEnabled !== undefined ? Boolean(badgeEnabled) : true,
        badgeSize: badgeSize || "3*4",
        badgeOrientation: badgeOrientation || "vertical",
        eventType: eventType || "STANDARD",
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
  } catch (error: any) {
    console.error("Error creating event:", error);
    return Response.json({ error: error.message || "Failed to create event" }, { status: 500 });
  }
}
