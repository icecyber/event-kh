import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "My Events — EventKH" };

export default async function OrganizerEventsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ORGANIZER") redirect("/dashboard");

  const events = await prisma.event.findMany({
    where: { organizerId: session.user.id },
    include: { _count: { select: { registrations: true } }, ticketTypes: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar no-print">
        <div style={{ marginBottom: "2rem", padding: "0.5rem" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--gray-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Organizer</p>
          <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.925rem" }}>{session.user.name}</p>
        </div>
        <Link href="/dashboard" className="dash-sidebar-link">📊 Overview</Link>
        <Link href="/dashboard/events" className="dash-sidebar-link active">📅 My Events</Link>
        <Link href="/dashboard/events/new" className="dash-sidebar-link">➕ Create Event</Link>
      </aside>

      <main className="dash-main">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Events</h1>
            <p className="page-subtitle">{events.length} event{events.length !== 1 ? "s" : ""} total</p>
          </div>
          <Link href="/dashboard/events/new" className="btn btn-primary no-print">+ Create Event</Link>
        </div>

        {events.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon">📅</div>
            <h3>No events yet</h3>
            <p style={{ marginBottom: "1.5rem" }}>Create your first event and start accepting registrations.</p>
            <Link href="/dashboard/events/new" className="btn btn-primary">+ Create your first event</Link>
          </div>
        ) : (
          <div className="card">
            <div className="table-wrapper" style={{ border: "none" }}>
              <table>
                <thead>
                  <tr>
                    <th>Event Title</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Registrations</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => {
                    const pct = ev.capacity
                      ? Math.round((ev._count.registrations / ev.capacity) * 100)
                      : null;
                    return (
                      <tr key={ev.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: "var(--gray-900)" }}>{ev.title}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--gray-400)", marginTop: 2 }}>
                            {ev.ticketTypes.map((t) => t.name).join(", ")}
                          </div>
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {new Date(ev.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          {ev.startTime && <div style={{ fontSize: "0.78rem", color: "var(--gray-400)" }}>{ev.startTime}</div>}
                        </td>
                        <td style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>{ev.location || "—"}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{ev._count.registrations}</div>
                          {pct !== null && (
                            <div style={{ marginTop: 4, height: 4, width: 80, background: "var(--gray-100)", borderRadius: 999, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: pct >= 90 ? "var(--rose-500)" : "var(--brand-500)", borderRadius: 999 }} />
                            </div>
                          )}
                        </td>
                        <td style={{ color: "var(--gray-500)" }}>{ev.capacity ?? "Unlimited"}</td>
                        <td>
                          {ev.isPublished ? (
                            <span className="badge badge-green">Published</span>
                          ) : (
                            <span className="badge badge-gray">Draft</span>
                          )}
                        </td>
                        <td>
                          <Link href={`/dashboard/events/${ev.id}`} className="btn btn-ghost btn-sm">Manage →</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
