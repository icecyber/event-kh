"use client";

import { useLang } from "@/components/LangProvider";

export function RegisterPageHeader({
  eventTitle, dateStr, startTime, location, userName,
}: {
  eventTitle: string; dateStr: string; startTime?: string | null; location?: string | null; userName?: string | null;
}) {
  const { t } = useLang();

  return (
    <div className="card card-body" style={{ marginBottom: "1.5rem", background: "linear-gradient(135deg, var(--brand-900), #4c1d95)", color: "#fff" }}>
      <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.55)", marginBottom: "0.5rem" }}>
        {t("reg.title")}
      </p>
      <h2 style={{ fontSize: "1.35rem", marginBottom: "0.75rem" }}>{eventTitle}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>
        <span>📅 {dateStr}{startTime ? ` · ${startTime}` : ""}</span>
        {location && <span>📍 {location}</span>}
        <span>👤 {t("reg.registeringAs")} <strong style={{ color: "#fff" }}>{userName || t("reg.guestAttendee")}</strong></span>
      </div>
    </div>
  );
}

export function RegisterFormTitle() {
  const { t } = useLang();
  return <h3 style={{ marginBottom: "1.5rem", color: "var(--gray-900)" }}>{t("reg.completeRegistration")}</h3>;
}
