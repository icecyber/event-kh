import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  return {
    title: event ? `${event.title} — EventKH` : "Event — EventKH",
    description: event?.description ?? undefined,
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const event = await prisma.event.findUnique({
    where: { id, isPublished: true },
    include: {
      organizer: { select: { name: true } },
      ticketTypes: true,
      customFields: { orderBy: { order: "asc" } },
      _count: { select: { registrations: true } },
    },
  });

  if (!event) notFound();

  // Check if current user is already registered
  let existingReg = null;
  if (session) {
    existingReg = await prisma.registration.findFirst({
      where: { eventId: id, attendeeId: session.user.id },
    });
  }

  const dateStr = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const spotsLeft = event.capacity
    ? event.capacity - event._count.registrations
    : null;

  return (
    <main style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Banner */}
      <div style={{ height: 320, position: "relative", overflow: "hidden" }}>
        {event.bannerImageURL ? (
          <img src={event.bannerImageURL} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: `linear-gradient(135deg, hsl(${parseInt(id, 36) % 360}, 60%, 30%), hsl(${(parseInt(id, 36) + 120) % 360}, 60%, 20%))`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "6rem"
          }}>🎪</div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }} />
        <div className="container" style={{ position: "absolute", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", color: "#fff" }}>
          <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}>{event.title}</h1>
        </div>
      </div>

      <div className="container" style={{ padding: "2.5rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>
        {/* Left: event info */}
        <div>
          {event.description && (
            <div className="card card-body" style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ marginBottom: "0.75rem", color: "var(--gray-900)" }}>About this event</h3>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{event.description}</p>
            </div>
          )}

          {/* Custom fields preview */}
          {event.customFields.length > 0 && (
            <div className="card card-body">
              <h3 style={{ marginBottom: "0.75rem", color: "var(--gray-900)" }}>Registration requires</h3>
              <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingLeft: "1.25rem", color: "var(--gray-600)" }}>
                {event.customFields.map((f) => (
                  <li key={f.id}>{f.label}{f.required ? " *" : ""}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right: registration card */}
        <div className="card" style={{ position: "sticky", top: 80 }}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--gray-600)", fontSize: "0.9rem" }}>
                <span>📅</span> {dateStr}
                {event.startTime && ` · ${event.startTime}`}
                {event.endTime && ` – ${event.endTime}`}
              </div>
              {event.location && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--gray-600)", fontSize: "0.9rem" }}>
                  <span>📍</span> {event.location}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--gray-600)", fontSize: "0.9rem" }}>
                <span>👤</span> Organized by <strong>{event.organizer.name}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--brand-600)", fontSize: "0.9rem", fontWeight: 600 }}>
                <span>🎟️</span> {event._count.registrations} registered
                {spotsLeft !== null && (
                  <span style={{ color: spotsLeft <= 10 ? "var(--rose-500)" : "var(--gray-500)", fontWeight: 400 }}>
                    · {spotsLeft} spots left
                  </span>
                )}
              </div>
            </div>

            {/* Ticket types */}
            <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: "1rem" }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--gray-500)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Tickets</p>
              {event.ticketTypes.map((t) => (
                <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--gray-100)", fontSize: "0.9rem" }}>
                  <span style={{ fontWeight: 500 }}>{t.name}</span>
                  <span className="badge badge-green">{t.price === 0 ? "Free" : `$${t.price}`}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            {existingReg ? (
              <div>
                <div className="alert alert-success" style={{ marginBottom: "0.75rem" }}>
                  ✅ You are already registered!
                </div>
                <Link href={`/events/${id}/confirmation/${existingReg.id}`} className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                  View My Ticket →
                </Link>
              </div>
            ) : spotsLeft === 0 ? (
              <div className="alert alert-error">🚫 This event is full.</div>
            ) : session ? (
              <Link href={`/events/${id}/register`} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} id="register-btn">
                Register Now →
              </Link>
            ) : (
              <div>
                <p style={{ fontSize: "0.85rem", color: "var(--gray-500)", marginBottom: "0.75rem", textAlign: "center" }}>Sign in to register for this event.</p>
                <Link href={`/login?callbackUrl=/events/${id}/register`} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  Sign in to Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
