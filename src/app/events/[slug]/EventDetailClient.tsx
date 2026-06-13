"use client";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import TranslateText from "@/components/TranslateText";
import RegistrationForm from "./register/RegistrationForm";

interface EventDetailProps {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  dateDisplay: string;
  dateISO: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  bannerImageURL?: string | null;
  eventType: string;
  organizerName: string;
  registrationCount: number;
  spotsLeft: number | null;
  ticketTypes: { id: string; name: string; price: number }[];
  customFields: {
    id: string;
    label: string;
    fieldType: string;
    required: boolean;
    options?: string | null;
    order: number;
  }[];
  existingRegId?: string | null;
}

export default function EventDetailClient({ ev }: { ev: EventDetailProps }) {
  const { t } = useLang();
  const isExhibition = ev.eventType === "EXHIBITION";

  return (
    <main style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Banner */}
      <div style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        aspectRatio: "16 / 5",
        minHeight: 180,
        maxHeight: 400,
      }}>
        {ev.bannerImageURL ? (
          <img
            src={ev.bannerImageURL}
            alt={ev.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
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
        <div style={{ position: "absolute", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", color: "#fff", width: "100%", padding: "0 1.5rem" }}>
          <h1 style={{ fontSize: "clamp(1.25rem, 4vw, 2.5rem)", margin: 0, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            <TranslateText text={ev.title} />
          </h1>
        </div>
      </div>

      <div className="container event-detail-grid" style={{ padding: "2.5rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>
        {/* Left: info */}
        <div>
          {ev.existingRegId ? (
            <div className="card card-body" style={{ marginBottom: "1.5rem" }}>
              <div className="alert alert-success" style={{ marginBottom: "1rem" }}>
                {t("event.alreadyRegistered")}
              </div>
              <Link href={`/events/${ev.slug}/confirmation/${ev.existingRegId}`} className="btn btn-primary" style={{ display: "inline-flex", justifyContent: "center" }}>
                {t("event.viewTicket")}
              </Link>
            </div>
          ) : ev.spotsLeft === 0 ? (
            <div className="card card-body" style={{ marginBottom: "1.5rem" }}>
              <div className="alert alert-error" style={{ margin: 0 }}>
                {t("event.eventFull")}
              </div>
            </div>
          ) : (
            <div id="registration-section" className="card card-body">
              <h3 style={{ marginBottom: "1.5rem", color: "var(--gray-900)" }}>
                🎫 {t("reg.completeRegistration")}
              </h3>
              <RegistrationForm
                eventData={{
                  id: ev.id,
                  slug: ev.slug,
                  title: ev.title,
                  date: ev.dateISO,
                  location: ev.location ?? undefined,
                  startTime: ev.startTime ?? undefined,
                  eventType: ev.eventType,
                  ticketTypes: ev.ticketTypes,
                  customFields: ev.customFields,
                }}
              />
            </div>
          )}
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
                  <span>📍</span> <TranslateText text={ev.location} />
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

            {ev.description && (
              <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: "1rem" }}>
                <h4 style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--gray-500)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {t("event.about")}
                </h4>
                <TranslateText
                  text={ev.description}
                  showLabel={true}
                  as="p"
                  style={{ color: "var(--gray-600)", fontSize: "0.9rem", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
