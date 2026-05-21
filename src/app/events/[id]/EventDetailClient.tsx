"use client";

import Link from "next/link";
import { useLang } from "@/components/LangProvider";

interface EventDetailProps {
  id: string;
  title: string;
  description?: string | null;
  dateDisplay: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  bannerImageURL?: string | null;
  eventType: string;
  organizerName: string;
  registrationCount: number;
  spotsLeft: number | null;
  ticketTypes: { id: string; name: string; price: number }[];
  customFields: { id: string; label: string; required: boolean }[];
  existingRegId?: string | null;
}

export default function EventDetailClient({ ev }: { ev: EventDetailProps }) {
  const { t } = useLang();
  const isExhibition = ev.eventType === "EXHIBITION";

  return (
    <main style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Banner */}
      <div style={{ height: 320, position: "relative", overflow: "hidden" }}>
        {ev.bannerImageURL ? (
          <img src={ev.bannerImageURL} alt={ev.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: `linear-gradient(135deg, hsl(${parseInt(ev.id, 36) % 360}, 60%, 30%), hsl(${(parseInt(ev.id, 36) + 120) % 360}, 60%, 20%))`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "6rem"
          }}>🎪</div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }} />
        <div style={{ position: "absolute", top: "1.25rem", right: "1.5rem" }}>
          <span style={{
            background: isExhibition ? "rgba(16,185,129,0.9)" : "rgba(99,102,241,0.85)",
            color: "#fff", fontWeight: 700, fontSize: "0.75rem", padding: "0.3rem 0.85rem",
            borderRadius: 999, backdropFilter: "blur(8px)", letterSpacing: "0.04em"
          }}>
            {isExhibition ? t("event.exhibition") : t("event.standard")}
          </span>
        </div>
        <div className="container" style={{ position: "absolute", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", color: "#fff" }}>
          <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}>{ev.title}</h1>
        </div>
      </div>

      <div className="container event-detail-grid" style={{ padding: "2.5rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>
        {/* Left: info */}
        <div>
          {ev.description && (
            <div className="card card-body" style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ marginBottom: "0.75rem", color: "var(--gray-900)" }}>{t("event.about")}</h3>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{ev.description}</p>
            </div>
          )}

          <div className="card card-body">
            <h3 style={{ marginBottom: "0.75rem", color: "var(--gray-900)" }}>
              📋 {t("event.registrationRequires")}
            </h3>
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.4rem", paddingLeft: "1.25rem", color: "var(--gray-600)" }}>
              <li>{t("reg.fullName")} *</li>
              {isExhibition
                ? <li>{t("reg.phoneNumber")} *</li>
                : <li>{t("reg.emailAddress")} *</li>
              }
              {isExhibition && <li style={{ color: "var(--gray-400)" }}>{t("reg.emailAddress")} {t("event.optional")}</li>}
              {!isExhibition && <li style={{ color: "var(--gray-400)" }}>{t("reg.phoneNumber")} {t("event.optional")}</li>}
              {ev.customFields.map((f) => (
                <li key={f.id}>{f.label}{f.required ? " *" : ` ${t("event.optional")}`}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: registration card */}
        <div className="card" style={{ position: "sticky", top: 80 }}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "var(--gray-600)", fontSize: "0.9rem" }}>
                <span style={{ flexShrink: 0, marginTop: "0.1rem" }}>📅</span>
                <span>
                  {ev.dateDisplay}
                  {ev.startTime && ` · ${ev.startTime}`}
                  {ev.endTime && ` – ${ev.endTime}`}
                </span>
              </div>
              {ev.location && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--gray-600)", fontSize: "0.9rem" }}>
                  <span>📍</span> {ev.location}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--gray-600)", fontSize: "0.9rem" }}>
                <span>👤</span> {t("event.organizedBy")} <strong>{ev.organizerName}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--brand-600)", fontSize: "0.9rem", fontWeight: 600 }}>
                <span>🎟️</span> {ev.registrationCount} {t("events.registered")}
                {ev.spotsLeft !== null && (
                  <span style={{ color: ev.spotsLeft <= 10 ? "var(--rose-500)" : "var(--gray-500)", fontWeight: 400 }}>
                    · {ev.spotsLeft} {t("event.spotsLeft")}
                  </span>
                )}
              </div>
            </div>

            {/* Ticket types */}
            <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: "1rem" }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--gray-500)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{t("event.tickets")}</p>
              {ev.ticketTypes.map((tk) => (
                <div key={tk.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--gray-100)", fontSize: "0.9rem" }}>
                  <span style={{ fontWeight: 500 }}>{tk.name}</span>
                  <span className="badge badge-green">{tk.price === 0 ? t("events.free") : `$${tk.price}`}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            {ev.existingRegId ? (
              <div>
                <div className="alert alert-success" style={{ marginBottom: "0.75rem" }}>{t("event.alreadyRegistered")}</div>
                <Link href={`/events/${ev.id}/confirmation/${ev.existingRegId}`} className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                  {t("event.viewTicket")}
                </Link>
              </div>
            ) : ev.spotsLeft === 0 ? (
              <div className="alert alert-error">{t("event.eventFull")}</div>
            ) : (
              <Link
                href={`/events/${ev.id}/register`}
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                id="register-btn"
              >
                {isExhibition ? t("event.registerNoLogin") : t("event.registerNow")}
              </Link>
            )}

            {!ev.existingRegId && ev.spotsLeft !== 0 && (
              <p style={{ fontSize: "0.78rem", color: "var(--gray-400)", textAlign: "center", marginTop: "-0.25rem" }}>
                {isExhibition ? t("event.noAccountPhone") : t("event.noAccountEmail")}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
