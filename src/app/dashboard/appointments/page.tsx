import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AppointmentsTab from "./AppointmentsTab";

export const metadata = {
  title: "Platform Matchmaking & Appointments — EventKH",
};

export default async function DashboardAppointmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Only admins can access appointments dashboard
  const isAdmin = session.user.role === "ADMIN" || session.user.email === "admin@eventkh.com";
  if (!isAdmin) redirect("/dashboard");

  return (
    <div className="dash-layout">
      {/* Reusable Sidebar */}
      <Sidebar
        userName={session.user.name}
        userEmail={session.user.email}
        role={session.user.role}
      />

      {/* Main dashboard content panel */}
      <main className="dash-main">
        <AppointmentsTab />
      </main>
    </div>
  );
}
