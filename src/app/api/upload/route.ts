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

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const ext = file.name.split(".").pop() ?? "png";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `upload-${timestamp}-${random}.${ext}`;

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Write the file
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    const url = `/uploads/${filename}`;
    return Response.json({ url }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
