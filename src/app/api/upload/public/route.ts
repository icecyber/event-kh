import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/upload/public — unauthenticated upload for registration answers.
 *
 * The organizer-only /api/upload endpoint cannot be used here because public
 * attendees have no session. Access is therefore gated on the target event
 * being published and still open, and limits are deliberately tighter.
 */

const MAX_BYTES = 2 * 1024 * 1024; // 2MB

const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const eventId = formData.get("eventId");

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Only accept uploads aimed at an event that is actually taking registrations.
    if (typeof eventId === "string" && eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { isPublished: true },
      });
      if (!event?.isPublished) {
        return Response.json({ error: "Event is not open for registration" }, { status: 403 });
      }
    }

    if (!ALLOWED.includes(file.type)) {
      return Response.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, PDF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return Response.json({ error: "File too large. Maximum size is 2MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = `data:${file.type};base64,${buffer.toString("base64")}`;

    return Response.json({ url }, { status: 201 });
  } catch (err) {
    console.error("Public upload error:", err);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
