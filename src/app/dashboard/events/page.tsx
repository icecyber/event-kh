import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

import Sidebar from "@/components/Sidebar";

export const metadata = { title: "My Events — EventKH" };

export default async function OrganizerEventsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const isAdmin = session.user.role === "ADMIN" || session.user.email === "admin@eventkh.com";
  const isOrganizer = session.user.role === "ORGANIZER";

  if (!isAdmin && !isOrganizer) redirect("/dashboard");

  const events = await prisma.event.findMany({
    where: isAdmin ? {} : { organizerId: session.user.id },
    include: { _count: { select: { registrations: true } }, ticketTypes: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="dash-layout">
      <Sidebar
        userName={session.user.name}
        userEmail={session.user.email}
        role={session.user.role}
      />

      <main className="dash-main">
        <div className="page-header" style={{ flexWrap: "nowrap", alignItems: "center" }}>
          <div>
            <h1 className="page-title" style={{ fontSize: "1.35rem" }}>{isAdmin ? "Platform Events" : "My Events"}</h1>
            <p className="page-subtitle">{events.length} event{events.length !== 1 ? "s" : ""} total</p>
          </div>
          <Link href="/dashboard/events/new" className="btn btn-primary btn-sm no-print" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
            + Create Event
          </Link>
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
            {/* Desktop Table View */}
            <div className="table-wrapper hide-mobile" style={{ border: "none" }}>
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
                          <div style={{ fontWeight: 600, color: "var(--gray-900)" }}>
                            <Link href={`/events/${ev.slug}`} target="_blank" rel="noopener noreferrer" className="hover-underline" style={{ color: "inherit", textDecoration: "none" }}>
                              {ev.title}
                            </Link>
                          </div>
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
                          <Link href={`/dashboard/events/${ev.slug}`} className="btn btn-ghost btn-sm">Manage →</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (no inner scrolling) */}
            <div className="dash-event-rows">
              {events.map((ev) => (
                <div key={ev.id} style={{ padding: "1rem", borderBottom: "1px solid var(--gray-100)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <div>
                      <Link href={`/events/${ev.slug}`} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: "var(--gray-900)", fontSize: "0.95rem", textDecoration: "none" }}>
                        {ev.title}
                      </Link>
                      {ev.location && (
                        <p style={{ fontSize: "0.75rem", color: "var(--gray-500)", marginTop: "0.2rem" }}>
                          📍 {ev.location}
                        </p>
                      )}
                    </div>
                    {ev.isPublished ? (
                      <span className="badge badge-green" style={{ flexShrink: 0 }}>Published</span>
                    ) : (
                      <span className="badge badge-gray" style={{ flexShrink: 0 }}>Draft</span>
                    )}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem", paddingTop: "0.5rem", borderTop: "1px dashed var(--gray-100)" }}>
                    <div style={{ fontSize: "0.78rem", color: "var(--gray-600)" }}>
                      <span>📅 {new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      <span style={{ marginLeft: "0.75rem", fontWeight: 600, color: "var(--gray-800)" }}>👥 {ev._count.registrations} {ev.capacity ? `/ ${ev.capacity}` : ""}</span>
                    </div>
                    <Link href={`/dashboard/events/${ev.slug}`} className="btn btn-ghost btn-sm">
                      Manage →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
