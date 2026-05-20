import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Browse Events — EventKH",
  description: "Discover and register for upcoming events.",
};

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    include: {
      organizer: { select: { name: true } },
      ticketTypes: true,
      _count: { select: { registrations: true } },
    },
    orderBy: { date: "asc" },
  });

  return (
    <main style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Page header */}
      <div style={{ background: "linear-gradient(135deg, var(--gray-900), var(--brand-900))", color: "#fff", padding: "3rem 1.5rem 2.5rem" }}>
        <div className="container">
          <h1 style={{ marginBottom: "0.5rem" }}>Browse Events</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1rem" }}>Discover and register for upcoming events near you.</p>
        </div>
      </div>

      <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
        {events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎪</div>
            <h3>No events yet</h3>
            <p>Check back soon — new events are being added all the time.</p>
          </div>
        ) : (
          <div className="grid-2">
            {events.map((event) => {
              const dateStr = new Date(event.date).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              const isFull = event.capacity
                ? event._count.registrations >= event.capacity
                : false;

              return (
                <Link key={event.id} href={`/events/${event.id}`} style={{ textDecoration: "none" }}>
                  <div className="event-card">
                    <div className="event-card-banner">
                      {event.bannerImageURL ? (
                        <img src={event.bannerImageURL} alt={event.title} />
                      ) : (
                        <div style={{
                          width: "100%", height: "100%",
                          background: `linear-gradient(135deg, hsl(${parseInt(event.id, 36) % 360}, 65%, 35%), hsl(${(parseInt(event.id, 36) + 120) % 360}, 65%, 25%))`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "3.5rem"
                        }}>
                          🎪
                        </div>
                      )}
                      {isFull && (
                        <div style={{ position: "absolute", top: 12, right: 12 }}>
                          <span className="badge badge-red">FULL</span>
                        </div>
                      )}
                    </div>
                    <div className="event-card-body">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                        <h3 className="event-card-title">{event.title}</h3>
                        {event.ticketTypes.some((t) => t.price === 0) && (
                          <span className="badge badge-green" style={{ flexShrink: 0 }}>Free</span>
                        )}
                      </div>
                      <div className="event-card-meta">
                        <span>📅 {dateStr}{event.startTime ? ` · ${event.startTime}` : ""}</span>
                        {event.location && <span>📍 {event.location}</span>}
                        <span>👤 By {event.organizer.name}</span>
                        <span style={{ color: "var(--brand-600)", fontWeight: 600 }}>
                          {event._count.registrations} registered
                          {event.capacity ? ` / ${event.capacity} capacity` : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
