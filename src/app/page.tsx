"use client";

import Link from "next/link";
import { useLang } from "@/components/LangProvider";

export default function Home() {
  const { t } = useLang();

  const features = [
    {
      icon: "📅", iconClass: "icon-circle-blue",
      badge: "Core", badgeClass: "badge-blue",
      title: t("feat.createEvents"), desc: t("feat.createEventsDesc"),
    },
    {
      icon: "📝", iconClass: "icon-circle-purple",
      badge: "Forms", badgeClass: "badge-purple",
      title: t("feat.customForms"), desc: t("feat.customFormsDesc"),
    },
    {
      icon: "📲", iconClass: "icon-circle-green",
      badge: "Tickets", badgeClass: "badge-green",
      title: t("feat.qrTickets"), desc: t("feat.qrTicketsDesc"),
    },
    {
      icon: "🎫", iconClass: "icon-circle-amber",
      badge: "Badges", badgeClass: "badge-yellow",
      title: t("feat.pngBadges"), desc: t("feat.pngBadgesDesc"),
    },
    {
      icon: "🔍", iconClass: "icon-circle-sky",
      badge: "Search", badgeClass: "badge-sky",
      title: t("feat.searchFilter"), desc: t("feat.searchFilterDesc"),
    },
    {
      icon: "📊", iconClass: "icon-circle-coral",
      badge: "Export", badgeClass: "badge-red",
      title: t("feat.exportCsv"), desc: t("feat.exportCsvDesc"),
    },
  ];

  const stats = [
    { icon: "🎪", iconClass: "icon-circle-blue", value: "10K+", label: "Events Created", detail: "Across Cambodia & SE Asia" },
    { icon: "👥", iconClass: "icon-circle-green", value: "250K+", label: "Attendees Managed", detail: "From small meetups to exhibitions" },
    { icon: "⚡", iconClass: "icon-circle-amber", value: "3 min", label: "To Create Event", detail: "Average setup time" },
    { icon: "✅", iconClass: "icon-circle-purple", value: "99.9%", label: "Uptime", detail: "Reliable when you need it" },
  ];

  const howItWorks = [
    {
      number: "01", icon: "🎯",
      title: "Create Your Event",
      desc: "Set up your event with title, date, location, banner image, ticket types and custom registration fields in minutes.",
    },
    {
      number: "02", icon: "📢",
      title: "Share & Register",
      desc: "Publish your event page. Attendees register via phone or email — no account required for exhibition events.",
    },
    {
      number: "03", icon: "✅",
      title: "Check In with QR",
      desc: "On event day, scan attendee QR codes instantly. Undo check-ins, print badges, and export participant data.",
    },
  ];

  const trustedBy = [
    { name: "Tech Conferences", icon: "💻" },
    { name: "Exhibitions & Expos", icon: "🎪" },
    { name: "Government Events", icon: "🏛️" },
    { name: "Corporate Summits", icon: "🤝" },
    { name: "Education Events", icon: "🎓" },
    { name: "Cultural Festivals", icon: "🎭" },
  ];

  return (
    <main>
      {/* Custom localized style block for interactive button states in the neutral bright hero */}
      <style>{`
        .hero-btn-primary {
          background: #e11d48 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 20px rgba(225, 29, 72, 0.22) !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .hero-btn-primary:hover {
          background: #be123c !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 24px rgba(225, 29, 72, 0.32) !important;
        }
        .hero-btn-primary:active {
          transform: translateY(0) !important;
        }
        .hero-btn-secondary {
          background: #ffffff !important;
          color: #27272a !important;
          border: 1.5px solid #d4d4d8 !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .hero-btn-secondary:hover {
          background: #fafafa !important;
          border-color: #a1a1aa !important;
          color: #09090b !important;
          transform: translateY(-2px) !important;
        }
        .hero-btn-secondary:active {
          transform: translateY(0) !important;
        }
      `}</style>

      {/* ══ HERO ═══════════════════════════════════════════════════ */}
      <section className="hero" style={{ position: "relative", overflow: "hidden", minHeight: "55vh", display: "flex", alignItems: "center", justifyContent: "flex-start", padding: "3.5rem 0", background: "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)", borderBottom: "1px solid #e4e4e7" }}>
        {/* Subtle, clearer background YouTube Video on a bright background */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
          opacity: 0.12, /* Very soft and light moving texture */
        }}>
          <iframe
            src="https://www.youtube.com/embed/Vs_Fmf7Bzt8?autoplay=1&mute=1&loop=1&playlist=Vs_Fmf7Bzt8&start=4&controls=0&showinfo=0&rel=0&iv_load_policy=3&playsinline=1&enablejsapi=1&modestbranding=1&fs=0&disablekb=1"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            style={{
              width: "100vw",
              height: "56.25vw", /* Aspect ratio 16:9 */
              minHeight: "100vh",
              minWidth: "177.77vh", /* Aspect ratio 16:9 */
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          />
          {/* Fading bright overlay: clean soft white contrast on the left, fully clear on the right */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, rgba(255, 255, 255, 0.97) 0%, rgba(255, 255, 255, 0.88) 45%, rgba(255, 255, 255, 0.3) 80%, rgba(255, 255, 255, 0) 100%)",
            zIndex: 1,
            pointerEvents: "none",
          }} />
        </div>

        <div className="hero-content" style={{ position: "relative", zIndex: 2, width: "100%" }}>
        <div className="hero-inner-content" style={{ maxWidth: 840, marginRight: "auto", marginLeft: 0, textAlign: "left", display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "0 1.5rem 0 4.5rem" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <span className="badge" style={{ padding: "0.4rem 1.1rem", fontSize: "0.85rem", backdropFilter: "blur(4px)", background: "rgba(225, 29, 72, 0.08)", color: "#dc2626", border: "1px solid rgba(225, 29, 72, 0.2)", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <img src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f1f0-1f1ed.png" alt="🇰🇭" style={{ width: "1.25em", height: "1.25em", objectFit: "contain" }} />
                EventKH
              </span>
            </div>

            <h1 className="hero-heading" style={{ fontSize: "clamp(1.75rem, 4.5vw, 3.5rem)", lineHeight: 1.15, fontWeight: 800, color: "#09090b", marginBottom: "1.25rem", letterSpacing: "-0.03em" }}>
              The smartest way to manage{" "}
              <span className="hero-highlight" style={{ background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-flex", alignItems: "center", flexWrap: "wrap", gap: "0.3rem" }}>
                events in Cambodia
                <img src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f1f0-1f1ed.png" alt="🇰🇭" style={{ width: "0.9em", height: "0.9em", objectFit: "contain", verticalAlign: "middle" }} />
              </span>
            </h1>

            <p style={{ fontSize: "1.2rem", color: "#27272a", marginBottom: "2.5rem", maxWidth: 620, lineHeight: 1.6 }}>
              {t("home.heroDesc")}
            </p>

            <div className="hero-actions" style={{ justifyContent: "flex-start" }}>
              <Link href="/register" className="btn btn-xl hero-btn-primary">
                🚀 {t("home.getStarted")}
              </Link>
              <Link href="/events" className="btn btn-xl hero-btn-secondary">
                📅 {t("home.browseEvents")}
              </Link>
            </div>

            {/* Social proof */}
            <div className="hero-social-proof" style={{
              marginTop: "3.5rem", display: "flex", alignItems: "center", gap: "0.875rem",
              padding: "0.875rem 1.25rem",
              background: "rgba(24, 24, 27, 0.04)",
              border: "1px solid rgba(24, 24, 27, 0.08)",
              borderRadius: "0.875rem", backdropFilter: "blur(8px)",
              width: "fit-content",
              marginRight: "auto",
              marginLeft: 0,
            }}>
              <div style={{ display: "flex" }}>
                {["🧑‍💼", "👩‍💻", "👨‍🎓", "👩‍🏫"].map((e, i) => (
                  <span key={i} style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: `hsl(${20 + i * 30}, 80%, 50%)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1rem", marginLeft: i > 0 ? "-8px" : 0,
                    border: "2px solid #fff",
                  }}>{e}</span>
                ))}
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ color: "#18181b", fontWeight: 700, fontSize: "0.9rem", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  10,000+ organizers trust EventKH
                  <img src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f1f0-1f1ed.png" alt="🇰🇭" style={{ width: "1.1em", height: "1.1em", objectFit: "contain" }} />
                </div>
                <div style={{ color: "#52525b", fontSize: "0.78rem" }}>
                  ⭐⭐⭐⭐⭐ &nbsp;Rated #1 in Cambodia
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ INFO STRIP ════════════════════════════════════════════ */}
      <div className="info-strip">
        <div className="info-strip-grid">
          {stats.map((s) => (
            <div key={s.label} className="info-strip-item">
              <div className={`icon-circle ${s.iconClass}`} style={{ width: 48, height: 48, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--gray-900)", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontWeight: 600, color: "var(--gray-700)", fontSize: "0.875rem", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.label}</div>
                <div style={{ color: "var(--gray-400)", fontSize: "0.78rem", marginTop: "0.1rem" }}>{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ FEATURES ═══════════════════════════════════════════════ */}
      <section style={{ padding: "6rem 1.5rem", background: "var(--surface-raised)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span className="badge badge-blue" style={{ marginBottom: "1rem", padding: "0.35rem 1rem", fontSize: "0.8rem" }}>
              ✦ Platform Features
            </span>
            <h2 style={{ marginBottom: "0.75rem", fontSize: "2.25rem" }}>
              {t("home.featuresTitle")}
            </h2>
            <p style={{ color: "var(--gray-500)", maxWidth: 520, margin: "0 auto", lineHeight: 1.75 }}>
              {t("home.featuresDesc")}
            </p>
          </div>

          <div className="grid-3">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div className={`icon-circle ${f.iconClass}`}>{f.icon}</div>
                  <span className={`badge ${f.badgeClass}`}>{f.badge}</span>
                </div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
                <div style={{ marginTop: "auto", paddingTop: "0.75rem", borderTop: "1px solid var(--gray-100)" }}>
                  <span style={{ color: "var(--blue-600)", fontSize: "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    Learn more →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════ */}
      <section style={{ padding: "6rem 1.5rem", background: "#fff" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span className="badge badge-green" style={{ marginBottom: "1rem", padding: "0.35rem 1rem", fontSize: "0.8rem" }}>
              🔧 How It Works
            </span>
            <h2 style={{ marginBottom: "0.75rem" }}>Up and running in 3 simple steps</h2>
            <p style={{ color: "var(--gray-500)", maxWidth: 480, margin: "0 auto" }}>
              From zero to published event in under 5 minutes — no technical knowledge required.
            </p>
          </div>

          <div className="how-it-works-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {howItWorks.map((step, i) => (
              <div key={step.number} className="how-step" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <div className="how-step-number">{step.number}</div>
                  <span style={{ fontSize: "1.75rem" }}>{step.icon}</span>
                </div>
                <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: "0.5rem" }}>{step.title}</h4>
                <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", lineHeight: 1.7 }}>{step.desc}</p>
                {i < howItWorks.length - 1 && (
                  <div style={{
                    marginTop: "1rem", alignSelf: "flex-end",
                    color: "var(--blue-300)", fontSize: "1.5rem",
                  }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TRUSTED BY ════════════════════════════════════════════ */}
      <section style={{ padding: "4rem 1.5rem", background: "var(--surface-raised)", borderTop: "1px solid var(--gray-200)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <p style={{ color: "var(--gray-400)", fontWeight: 600, fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Trusted by event organizers across
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
            {trustedBy.map((item) => (
              <div key={item.name} style={{
                display: "flex", alignItems: "center", gap: "0.625rem",
                background: "#fff", border: "1px solid var(--gray-200)",
                borderRadius: "999px", padding: "0.6rem 1.25rem",
                fontSize: "0.9rem", fontWeight: 600, color: "var(--gray-600)",
                boxShadow: "var(--shadow-xs)",
              }}>
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════════════ */}
      <section style={{
        background: "linear-gradient(150deg, #0a1628 0%, #003380 40%, #0052cc 75%, #0ea5e9 100%)",
        padding: "6rem 1.5rem", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 30% 50%, rgba(14,165,233,0.25) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />
        <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <span className="badge badge-sky" style={{
            marginBottom: "1.5rem", padding: "0.4rem 1.1rem",
            background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}>
            🚀 Get started today — it&apos;s free
          </span>
          <h2 style={{ color: "#fff", marginBottom: "1rem", fontSize: "2.5rem", letterSpacing: "-0.03em" }}>
            {t("home.ctaTitle")}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "2.5rem", maxWidth: 480, margin: "0 auto 2.5rem", lineHeight: 1.75 }}>
            {t("home.ctaDesc")}
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn btn-xl" style={{
              background: "#fff", color: "var(--blue-700)", fontWeight: 700,
              boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
            }}>
              🎉 {t("home.createEvent")}
            </Link>
            <Link href="/events" className="btn btn-xl" style={{
              background: "rgba(255,255,255,0.1)", color: "#fff",
              border: "1.5px solid rgba(255,255,255,0.25)",
            }}>
              📅 {t("home.browseEvents")}
            </Link>
          </div>

          {/* Trust badges */}
          <div style={{ marginTop: "3rem", display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
            {["🔒 Secure & Private", "⚡ No Credit Card", "🌏 Khmer, English, 中文"].map((item) => (
              <span key={item} style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", fontWeight: 500 }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════ */}
      <footer style={{ background: "#fff", borderTop: "1px solid var(--gray-200)", padding: "2.5rem 1.5rem" }}>
        <div className="container">
          <div className="footer-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <div style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800,
                fontSize: "1.3rem", letterSpacing: "-0.03em", color: "var(--blue-700)",
                marginBottom: "0.35rem",
              }}>
                ⚡ EventKH
              </div>
              <div style={{ color: "var(--gray-400)", fontSize: "0.85rem" }}>
                Cambodia&apos;s #1 Event Management Platform
              </div>
            </div>

            <div className="footer-links" style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
              {[
                { label: "Browse Events", href: "/events" },
                { label: "Sign In", href: "/login" },
                { label: "Create Account", href: "/register" },
              ].map((link) => (
                <Link key={link.label} href={link.href} style={{
                  color: "var(--gray-500)", textDecoration: "none",
                  fontSize: "0.875rem", fontWeight: 500,
                  transition: "color 0.15s",
                }}>
                  {link.label}
                </Link>
              ))}
            </div>

            <div style={{ color: "var(--gray-400)", fontSize: "0.82rem" }}>
              © {new Date().getFullYear()} EventKH. {t("home.footer")}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
