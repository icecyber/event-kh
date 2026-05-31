import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/events/[id]/publish — toggle publish (organizer only)
export async function POST(_req: NextRequest, { params }: Ctx) {
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

  const updated = await prisma.event.update({
    where: { id },
    data: { isPublished: !event.isPublished },
  });

  return Response.json({ isPublished: updated.isPublished });
}
