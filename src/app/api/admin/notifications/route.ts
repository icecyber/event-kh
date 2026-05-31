import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Allow site admins to query system-wide notifications
    if (!session || (session.user.role !== "ADMIN" && session.user.email !== "admin@eventkh.com")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50, // limit to recent 50
    });

    return Response.json(notifications);
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.email !== "admin@eventkh.com")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Error marking all read:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
