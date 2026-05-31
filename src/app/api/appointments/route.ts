import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized. Please log in to request matching." }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, email, phone, exhibitorName, industry, preferredDate, preferredTime, purpose } = body;

    if (!fullName || !email || !phone || !preferredDate || !preferredTime || !purpose) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        exhibitorName: exhibitorName?.trim() || null,
        industry: industry?.trim() || null,
        preferredDate: new Date(preferredDate),
        preferredTime: preferredTime.trim(),
        purpose: purpose.trim(),
        status: "PENDING",
      },
    });

    // Create a platform-wide admin notification
    await prisma.notification.create({
      data: {
        title: "New Matchmaking Slot Requested 🤝",
        message: `${fullName.trim()} requested a global matchmaking appointment with ${exhibitorName ? exhibitorName.trim() : industry?.trim() || "N/A"} on ${preferredDate} (${preferredTime}).`,
        type: "APPOINTMENT",
      },
    });

    return Response.json(appointment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.email !== "admin@eventkh.com")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointments = await prisma.appointment.findMany({
      orderBy: { createdAt: "desc" },
    });

    return Response.json(appointments);
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
