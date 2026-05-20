import Link from "next/link";

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div style={{ marginBottom: "1rem" }}>
            <span className="badge badge-purple" style={{ fontSize: "0.85rem", padding: "0.35rem 1rem" }}>
              🎉 Free to use
            </span>
          </div>
          <h1>
            The easiest way to manage{" "}
            <span style={{ background: "linear-gradient(135deg, #a5b4fc, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              events in Cambodia
            </span>
          </h1>
          <p>
            Create events, build custom registration forms, issue QR tickets, redeem check-ins, and export participant data — all in one place.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="btn btn-primary btn-xl">
              Get Started Free →
            </Link>
            <Link href="/events" className="btn btn-xl" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
              Browse Events
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "5rem 1.5rem", background: "#fff" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ color: "var(--gray-900)", marginBottom: "0.75rem" }}>Everything you need to run great events</h2>
            <p style={{ color: "var(--gray-500)", maxWidth: 540, margin: "0 auto" }}>
              From registration to check-in, EventKH has you covered end-to-end.
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
          <h2 style={{ marginBottom: "1rem" }}>Ready to host your next event?</h2>
          <p style={{ color: "var(--gray-500)", marginBottom: "2rem" }}>Sign up as an organizer and create your first event in minutes.</p>
          <Link href="/register" className="btn btn-primary btn-xl">Create your event →</Link>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--gray-200)", padding: "2rem 1.5rem", textAlign: "center", color: "var(--gray-400)", fontSize: "0.875rem" }}>
        © {new Date().getFullYear()} EventKH. All rights reserved.
      </footer>
    </main>
  );
}

const features = [
  { icon: "📅", iconClass: "stat-icon-blue", title: "Create Events", desc: "Set up events with title, description, date, location, capacity, and banner image in minutes." },
  { icon: "📝", iconClass: "stat-icon-purple", title: "Custom Forms", desc: "Build tailored registration forms with text, select, checkbox, and number fields." },
  { icon: "📲", iconClass: "stat-icon-green", title: "QR Code Tickets", desc: "Every attendee gets a unique QR code for seamless check-in at the door." },
  { icon: "🎫", iconClass: "stat-icon-amber", title: "PNG Badges", desc: "Issue beautiful branded badges with a custom background — ready to download instantly." },
  { icon: "🔍", iconClass: "stat-icon-blue", title: "Search & Filter", desc: "Find any participant by name or email across all your events in real time." },
  { icon: "📊", iconClass: "stat-icon-green", title: "Export CSV", desc: "Download all participant data including custom field answers to a spreadsheet." },
];
