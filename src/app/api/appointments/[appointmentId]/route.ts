import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

type Ctx = { params: Promise<{ appointmentId: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const { appointmentId } = await params;
    
    // Check session
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.email !== "admin@eventkh.com")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    if (status !== "APPROVED" && status !== "REJECTED" && status !== "PENDING") {
      return Response.json({ error: "Invalid status value" }, { status: 400 });
    }

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });

    return Response.json(appointment);
  } catch (error: any) {
    console.error("Error updating appointment:", error);
    return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
