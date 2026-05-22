"use client";

import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import TranslateText from "@/components/TranslateText";

interface EventItem {
  id: string;
  title: string;
  date: string;
  startTime?: string | null;
  location?: string | null;
  bannerImageURL?: string | null;
  capacity?: number | null;
  organizerName: string;
  registrationCount: number;
  hasFreeTicket: boolean;
}

export default function EventsList({ events }: { events: EventItem[] }) {
  const { t } = useLang();

  if (events.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🎪</div>
        <h3>{t("events.noEvents")}</h3>
        <p>{t("events.checkBackSoon")}</p>
      </div>
    );
  }

  return (
    <div className="grid-2">
      {events.map((event) => {
        const dateStr = new Date(event.date).toLocaleDateString("en-US", {
          weekday: "short", year: "numeric", month: "long", day: "numeric",
        });
        const isFull = event.capacity
          ? event.registrationCount >= event.capacity
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
                    <span className="badge badge-red">{t("events.full")}</span>
                  </div>
                )}
              </div>
              <div className="event-card-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <h3 className="event-card-title">
                    <TranslateText text={event.title} />
                  </h3>
                  {event.hasFreeTicket && (
                    <span className="badge badge-green" style={{ flexShrink: 0 }}>{t("events.free")}</span>
                  )}
                </div>
                <div className="event-card-meta">
                  <span>📅 {dateStr}{event.startTime ? ` · ${event.startTime}` : ""}</span>
                  {event.location && (
                    <span>
                      📍 <TranslateText text={event.location} />
                    </span>
                  )}
                  <span>👤 {t("events.by")} {event.organizerName}</span>
                  <span style={{ color: "var(--brand-600)", fontWeight: 600 }}>
                    {event.registrationCount} {t("events.registered")}
                    {event.capacity ? ` / ${event.capacity} ${t("events.capacity")}` : ""}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
