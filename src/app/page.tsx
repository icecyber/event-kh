"use client";

import Link from "next/link";
import { useLang } from "@/components/LangProvider";

export default function Home() {
  const { t } = useLang();

  const features = [
    { icon: "📅", iconClass: "stat-icon-blue", title: t("feat.createEvents"), desc: t("feat.createEventsDesc") },
    { icon: "📝", iconClass: "stat-icon-purple", title: t("feat.customForms"), desc: t("feat.customFormsDesc") },
    { icon: "📲", iconClass: "stat-icon-green", title: t("feat.qrTickets"), desc: t("feat.qrTicketsDesc") },
    { icon: "🎫", iconClass: "stat-icon-amber", title: t("feat.pngBadges"), desc: t("feat.pngBadgesDesc") },
    { icon: "🔍", iconClass: "stat-icon-blue", title: t("feat.searchFilter"), desc: t("feat.searchFilterDesc") },
    { icon: "📊", iconClass: "stat-icon-green", title: t("feat.exportCsv"), desc: t("feat.exportCsvDesc") },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div style={{ marginBottom: "1rem" }}>
            <span className="badge badge-purple" style={{ fontSize: "0.85rem", padding: "0.35rem 1rem" }}>
              {t("home.badge")}
            </span>
          </div>
          <h1>
            {t("home.heroTitle1")}
            <span style={{ background: "linear-gradient(135deg, #a5b4fc, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {t("home.heroTitle2")}
            </span>
          </h1>
          <p>{t("home.heroDesc")}</p>
          <div className="hero-actions">
            <Link href="/register" className="btn btn-primary btn-xl">
              {t("home.getStarted")}
            </Link>
            <Link href="/events" className="btn btn-xl" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
              {t("home.browseEvents")}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "5rem 1.5rem", background: "#fff" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ color: "var(--gray-900)", marginBottom: "0.75rem" }}>{t("home.featuresTitle")}</h2>
            <p style={{ color: "var(--gray-500)", maxWidth: 540, margin: "0 auto" }}>
              {t("home.featuresDesc")}
            </p>
          </div>
          <div className="grid-3">
            {features.map((f) => (
              <div key={f.title} className="card card-body" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div className={`stat-icon ${f.iconClass}`}>{f.icon}</div>
                <h4 style={{ color: "var(--gray-900)" }}>{f.title}</h4>
                <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "5rem 1.5rem", background: "var(--gray-50)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ marginBottom: "1rem" }}>{t("home.ctaTitle")}</h2>
          <p style={{ color: "var(--gray-500)", marginBottom: "2rem" }}>{t("home.ctaDesc")}</p>
          <Link href="/register" className="btn btn-primary btn-xl">{t("home.createEvent")}</Link>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--gray-200)", padding: "2rem 1.5rem", textAlign: "center", color: "var(--gray-400)", fontSize: "0.875rem" }}>
        © {new Date().getFullYear()} EventKH. {t("home.footer")}
      </footer>
    </main>
  );
}
