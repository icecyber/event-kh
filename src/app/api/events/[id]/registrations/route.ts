import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/events/[id]/registrations — list participants (organizer only)
export async function GET(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ORGANIZER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: eventId } = await params;

  // Verify organizer owns this event
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return Response.json({ error: "Not found" }, { status: 404 });
  if (event.organizerId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "50");

  const where = {
    eventId,
    OR: search
      ? [
          { attendee: { name: { contains: search } } },
          { attendee: { email: { contains: search } } },
        ]
      : undefined,
  };

  const [registrations, total] = await Promise.all([
    prisma.registration.findMany({
      where,
      include: {
        attendee: { select: { id: true, name: true, email: true } },
        ticketType: true,
        customAnswers: { include: { customField: true } },
      },
      orderBy: { registrationDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.registration.count({ where }),
  ]);

  return Response.json({ registrations, total, page, pageSize });
}
