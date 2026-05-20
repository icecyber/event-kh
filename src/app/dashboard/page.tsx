import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Dashboard — EventKH" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const isOrganizer = session.user.role === "ORGANIZER";

  let stats = { events: 0, registrations: 0, checkedIn: 0 };
  let recentEvents: any[] = [];
  let myRegistrations: any[] = [];

  if (isOrganizer) {
    const [events, allRegs, checkedIn] = await Promise.all([
      prisma.event.count({ where: { organizerId: session.user.id } }),
      prisma.registration.count({ where: { event: { organizerId: session.user.id } } }),
      prisma.registration.count({ where: { event: { organizerId: session.user.id }, status: "CHECKED_IN" } }),
    ]);
    stats = { events, registrations: allRegs, checkedIn };
    recentEvents = await prisma.event.findMany({
      where: { organizerId: session.user.id },
      include: { _count: { select: { registrations: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  } else {
    myRegistrations = await prisma.registration.findMany({
      where: { attendeeId: session.user.id },
      include: { event: true, ticketType: true },
      orderBy: { registrationDate: "desc" },
      take: 10,
    });
  }

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className="dash-sidebar no-print">
        <div style={{ marginBottom: "2rem", padding: "0.5rem" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--gray-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
            {isOrganizer ? "Organizer" : "Attendee"}
          </p>
          <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.925rem" }}>{session.user.name}</p>
          <p style={{ color: "var(--gray-400)", fontSize: "0.8rem" }}>{session.user.email}</p>
        </div>

        {isOrganizer ? (
          <>
            <Link href="/dashboard" className="dash-sidebar-link active">📊 Overview</Link>
            <Link href="/dashboard/events" className="dash-sidebar-link">📅 My Events</Link>
            <Link href="/dashboard/events/new" className="dash-sidebar-link">➕ Create Event</Link>
          </>
        ) : (
          <>
            <Link href="/dashboard" className="dash-sidebar-link active">🎟️ My Tickets</Link>
            <Link href="/events" className="dash-sidebar-link">🔍 Browse Events</Link>
          </>
        )}

        <div style={{ marginTop: "auto", paddingTop: "2rem" }}>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="dash-sidebar-link" style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", color: "var(--gray-400)", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 0.85rem", borderRadius: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>
              🚪 Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-main">
        <div className="page-header">
          <div>
            <h1 className="page-title">Welcome back, {session.user.name?.split(" ")[0]}! 👋</h1>
            <p className="page-subtitle">
              {isOrganizer ? "Manage your events and track registrations" : "View your upcoming events and tickets"}
            </p>
          </div>
          {isOrganizer && (
            <Link href="/dashboard/events/new" className="btn btn-primary no-print">
              + Create Event
            </Link>
          )}
        </div>

        {isOrganizer ? (
          <>
            {/* Stats */}
            <div className="grid-3" style={{ marginBottom: "2rem" }}>
              <div className="stat-card">
                <div className="stat-icon stat-icon-blue">📅</div>
                <div className="stat-value">{stats.events}</div>
                <div className="stat-label">Total Events</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-green">👥</div>
                <div className="stat-value">{stats.registrations}</div>
                <div className="stat-label">Total Registrations</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-purple">✅</div>
                <div className="stat-value">{stats.checkedIn}</div>
                <div className="stat-label">Checked In</div>
              </div>
            </div>

            {/* Recent events */}
            <div className="card" style={{ marginBottom: "1.5rem" }}>
              <div className="card-body" style={{ borderBottom: "1px solid var(--gray-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ color: "var(--gray-900)" }}>Recent Events</h3>
                <Link href="/dashboard/events" className="btn btn-ghost btn-sm">View all →</Link>
              </div>
              {recentEvents.length === 0 ? (
                <div className="empty-state" style={{ padding: "2.5rem" }}>
                  <div className="empty-state-icon">📅</div>
                  <h3>No events yet</h3>
                  <p style={{ marginBottom: "1rem" }}>Create your first event to get started.</p>
                  <Link href="/dashboard/events/new" className="btn btn-primary btn-sm">+ Create Event</Link>
                </div>
              ) : (
                <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Date</th>
                        <th>Registrations</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEvents.map((ev) => (
                        <tr key={ev.id}>
                          <td style={{ fontWeight: 600, color: "var(--gray-900)" }}>{ev.title}</td>
                          <td>{new Date(ev.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
                          <td>{ev._count.registrations}</td>
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Attendee: my registrations */
          <div className="card">
            <div className="card-body" style={{ borderBottom: "1px solid var(--gray-100)" }}>
              <h3 style={{ color: "var(--gray-900)" }}>My Registrations</h3>
            </div>
            {myRegistrations.length === 0 ? (
              <div className="empty-state" style={{ padding: "2.5rem" }}>
                <div className="empty-state-icon">🎟️</div>
                <h3>No registrations yet</h3>
                <p style={{ marginBottom: "1rem" }}>Browse events and register for one you like!</p>
                <Link href="/events" className="btn btn-primary btn-sm">Browse Events</Link>
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Date</th>
                      <th>Ticket</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRegistrations.map((reg) => (
                      <tr key={reg.id}>
                        <td style={{ fontWeight: 600, color: "var(--gray-900)" }}>{reg.event.title}</td>
                        <td>{new Date(reg.event.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
                        <td><span className="badge badge-purple">{reg.ticketType.name}</span></td>
                        <td>
                          {reg.checkedInAt ? (
                            <span className="badge badge-green">✅ Checked In</span>
                          ) : (
                            <span className="badge badge-blue">🎟️ Confirmed</span>
                          )}
                        </td>
                        <td>
                          <Link href={`/events/${reg.eventId}/confirmation/${reg.id}`} className="btn btn-ghost btn-sm">View Ticket →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
