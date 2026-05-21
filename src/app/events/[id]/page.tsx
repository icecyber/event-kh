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

  // Build date display — supports multi-day events
  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
    });

  const startDateStr = fmtDate(event.date);
  const endDateStr = event.endDate ? fmtDate(event.endDate) : null;
  const dateDisplay = endDateStr && endDateStr !== startDateStr
    ? `${startDateStr} – ${endDateStr}`
    : startDateStr;

  const spotsLeft = event.capacity
    ? event.capacity - event._count.registrations
    : null;

  const isExhibition = event.eventType === "EXHIBITION";

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
        {/* Event type pill */}
        <div style={{ position: "absolute", top: "1.25rem", right: "1.5rem" }}>
          {isExhibition ? (
            <span style={{
              background: "rgba(16,185,129,0.9)", color: "#fff", fontWeight: 700,
              fontSize: "0.75rem", padding: "0.3rem 0.85rem", borderRadius: 999,
              backdropFilter: "blur(8px)", letterSpacing: "0.04em"
            }}>🎪 Exhibition</span>
          ) : (
            <span style={{
              background: "rgba(99,102,241,0.85)", color: "#fff", fontWeight: 700,
              fontSize: "0.75rem", padding: "0.3rem 0.85rem", borderRadius: 999,
              backdropFilter: "blur(8px)", letterSpacing: "0.04em"
            }}>📅 Standard</span>
          )}
        </div>
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

          {/* Registration required fields preview */}
          <div className="card card-body">
            <h3 style={{ marginBottom: "0.75rem", color: "var(--gray-900)" }}>
              {isExhibition ? "📋 Registration requires" : "📋 What you need to register"}
            </h3>
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.4rem", paddingLeft: "1.25rem", color: "var(--gray-600)" }}>
              <li>Full Name *</li>
              {isExhibition
                ? <li>Phone Number *</li>
                : <li>Email Address *</li>
              }
              {isExhibition && <li style={{ color: "var(--gray-400)" }}>Email Address (optional)</li>}
              {!isExhibition && <li style={{ color: "var(--gray-400)" }}>Phone Number (optional)</li>}
              {event.customFields.map((f) => (
                <li key={f.id}>{f.label}{f.required ? " *" : " (optional)"}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: registration card */}
        <div className="card" style={{ position: "sticky", top: 80 }}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {/* Date(s) */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "var(--gray-600)", fontSize: "0.9rem" }}>
                <span style={{ flexShrink: 0, marginTop: "0.1rem" }}>📅</span>
                <span>
                  {dateDisplay}
                  {event.startTime && ` · ${event.startTime}`}
                  {event.endTime && ` – ${event.endTime}`}
                </span>
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
            ) : (
              // Both Standard and Exhibition events show Register Now — Standard just requires login to complete
              <Link
                href={isExhibition ? `/events/${id}/register` : (session ? `/events/${id}/register` : `/login?callbackUrl=/events/${id}/register`)}
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                id="register-btn"
              >
                {isExhibition
                  ? "Register Now — No Login Required →"
                  : session
                    ? "Register Now →"
                    : "Sign in to Register →"
                }
              </Link>
            )}

            {/* Exhibition friction-free note */}
            {isExhibition && !existingReg && spotsLeft !== 0 && (
              <p style={{ fontSize: "0.78rem", color: "var(--gray-400)", textAlign: "center", marginTop: "-0.25rem" }}>
                ✨ No account needed — just your name & phone number
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
