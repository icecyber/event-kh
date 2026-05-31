import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

type Ctx = { params: Promise<{ notifId: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const { notifId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "ADMIN" && session.user.email !== "admin@eventkh.com")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { read } = body;

    const notification = await prisma.notification.update({
      where: { id: notifId },
      data: { read: !!read },
    });

    return Response.json(notification);
  } catch (error: any) {
    console.error("Error updating notification:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
