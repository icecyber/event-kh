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

  const body = await req.json();
  const cleanQr = typeof body.qrCodeString === "string" ? body.qrCodeString.trim() : "";
  const cleanRegId = typeof body.registrationId === "string" ? body.registrationId.trim() : "";
  const lookupOnly = Boolean(body.lookupOnly);

  if (!cleanQr && !cleanRegId) {
    return Response.json({ error: "Missing QR code string or registration ID" }, { status: 400 });
  }

  // Find registration by exact ID or exact QR code string first
  let registration = null;

  if (cleanRegId) {
    registration = await prisma.registration.findFirst({
      where: { id: cleanRegId, eventId },
      include: {
        attendee: { select: { id: true, name: true, email: true } },
        ticketType: true,
      },
    });
  } else if (cleanQr) {
    // 1. Try exact QR code match
    registration = await prisma.registration.findFirst({
      where: { qrCodeString: cleanQr, eventId },
      include: {
        attendee: { select: { id: true, name: true, email: true } },
        ticketType: true,
      },
    });

    // 2. If scanned text is a confirmation URL, extract the registration ID
    if (!registration && cleanQr.includes("/confirmation/")) {
      const extractedId = cleanQr.split("/confirmation/")[1]?.split(/[\?\#\/]/)[0]?.trim();
      if (extractedId) {
        registration = await prisma.registration.findFirst({
          where: { id: extractedId, eventId },
          include: {
            attendee: { select: { id: true, name: true, email: true } },
            ticketType: true,
          },
        });
      }
    }

    // 3. If scanned text is from badge fallback (e.g. "Event Title|Attendee Name")
    if (!registration && cleanQr.includes("|")) {
      const parts = cleanQr.split("|");
      const namePart = parts[parts.length - 1]?.trim();
      if (namePart) {
        registration = await prisma.registration.findFirst({
          where: {
            eventId,
            OR: [
              { attendee: { name: namePart } },
              { guestName: namePart },
            ],
          },
          include: {
            attendee: { select: { id: true, name: true, email: true } },
            ticketType: true,
          },
        });
      }
    }

    // 4. Try direct ID match if cleanQr is a cuid/uuid
    if (!registration) {
      registration = await prisma.registration.findFirst({
        where: { id: cleanQr, eventId },
        include: {
          attendee: { select: { id: true, name: true, email: true } },
          ticketType: true,
        },
      });
    }

    // 5. If not found and this is a lookup/search, support searching by name, email, or phone
    if (!registration && lookupOnly) {
      registration = await prisma.registration.findFirst({
        where: {
          eventId,
          OR: [
            { attendee: { name: { contains: cleanQr } } },
            { attendee: { email: { contains: cleanQr } } },
            { guestName: { contains: cleanQr } },
            { guestEmail: { contains: cleanQr } },
            { guestPhone: { contains: cleanQr } },
          ],
        },
        include: {
          attendee: { select: { id: true, name: true, email: true } },
          ticketType: true,
        },
      });
    }
  }

  if (!registration) {
    return Response.json({ error: "Ticket or attendee not found" }, { status: 404 });
  }

  const attendee = registration.attendee || {
    id: null,
    name: registration.guestName,
    email: registration.guestEmail || registration.guestPhone,
  };

  if (lookupOnly) {
    return Response.json({
      ...registration,
      attendee,
    });
  }

  if (registration.checkedInAt) {
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
