import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// POST /api/upload — upload an image file and return a public URL
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ORGANIZER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      return Response.json({ error: "Invalid file type. Only JPEG, PNG, WebP, GIF, and SVG are allowed." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Validate file size (max 2MB to prevent large database payload overhead)
    if (file.size > 2 * 1024 * 1024) {
      return Response.json({ error: "File too large. Maximum background size is 2MB." }, { status: 400 });
    }

    const base64 = buffer.toString("base64");
    const url = `data:${file.type};base64,${base64}`;

    return Response.json({ url }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
