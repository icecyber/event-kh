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
    if (body.badgeQrPositionX !== undefined) data.badgeQrPositionX = Number(body.badgeQrPositionX);
    if (body.badgeQrPositionY !== undefined) data.badgeQrPositionY = Number(body.badgeQrPositionY);
    if (body.badgeQrSize !== undefined) data.badgeQrSize = Number(body.badgeQrSize);

    let updated;
    if (body.customFields !== undefined) {
      const incomingFields = body.customFields || [];

      // Get existing custom fields
      const existingFields = await prisma.customField.findMany({
        where: { eventId: id },
      });
      const existingIds = existingFields.map((f) => f.id);

      // Identify fields to delete (exist in DB but not in payload)
      const incomingIds = incomingFields
        .map((f: { id?: string }) => f.id)
        .filter(Boolean) as string[];
      const toDeleteIds = existingIds.filter((eid) => !incomingIds.includes(eid));

      updated = await prisma.$transaction(async (tx) => {
        // 1. Delete answers for fields being deleted
        if (toDeleteIds.length > 0) {
          await tx.customFieldAnswer.deleteMany({
            where: { customFieldId: { in: toDeleteIds } },
          });
          // 2. Delete fields
          await tx.customField.deleteMany({
            where: { id: { in: toDeleteIds } },
          });
        }

        // 3. Update or create fields
        for (const field of incomingFields) {
          const fieldData = {
            label: field.label,
            fieldType: field.fieldType,
            required: Boolean(field.required),
            options: field.fieldType === "select" && field.options
              ? JSON.stringify(field.options)
              : null,
            order: Number(field.order) || 0,
          };

          if (field.id) {
            await tx.customField.update({
              where: { id: field.id },
              data: fieldData,
            });
          } else {
            await tx.customField.create({
              data: {
                ...fieldData,
                eventId: id,
              },
            });
          }
        }

        // 4. Update the event basic info
        return await tx.event.update({
          where: { id },
          data,
        });
      });
    } else {
      updated = await prisma.event.update({
        where: { id },
        data,
      });
    }

    return Response.json(updated);
  } catch (err: any) {
    console.error("PATCH Event Error:", err);
    return Response.json({ error: err.message || "Failed to update event" }, { status: 500 });
  }
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
