"use client";

import { useLang } from "@/components/LangProvider";

export default function EventsHeader() {
  const { t } = useLang();
  return (
    <div style={{ background: "linear-gradient(135deg, var(--gray-900), var(--brand-900))", color: "#fff", padding: "3rem 1.5rem 2.5rem" }}>
      <div className="container">
        <h1 style={{ marginBottom: "0.5rem" }}>{t("events.title")}</h1>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1rem" }}>{t("events.subtitle")}</p>
      </div>
    </div>
  );
}
