import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import AttendeeMatchmakingClient from "./AttendeeMatchmakingClient";

export const metadata = {
  title: "My Matchmaking & Appointments — EventKH",
};

export default async function AttendeeMatchmakingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Query appointments that match the logged-in user's email
  const appointments = await prisma.appointment.findMany({
    where: { email: session.user.email },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="dash-layout">
      {/* Sidebar for Attendee */}
      <Sidebar
        userName={session.user.name}
        userEmail={session.user.email}
        role={session.user.role}
      />

      {/* Main Content */}
      <main className="dash-main">
        <AttendeeMatchmakingClient
          initialAppointments={appointments.map((app) => ({
            id: app.id,
            fullName: app.fullName,
            email: app.email,
            phone: app.phone,
            exhibitorName: app.exhibitorName,
            industry: app.industry,
            preferredDate: app.preferredDate.toISOString().split("T")[0],
            preferredTime: app.preferredTime,
            purpose: app.purpose,
            status: app.status,
            createdAt: app.createdAt.toISOString(),
          }))}
        />
      </main>
    </div>
  );
}
