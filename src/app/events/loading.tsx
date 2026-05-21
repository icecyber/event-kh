export default function EventsLoading() {
  return (
    <main style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Header skeleton */}
      <div style={{ background: "linear-gradient(135deg, var(--gray-900), var(--brand-900))", padding: "3rem 1.5rem 2.5rem" }}>
        <div className="container">
          <div className="skeleton skeleton-heading" style={{ background: "rgba(255,255,255,0.1)", width: "220px" }} />
          <div className="skeleton skeleton-text w-60" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
        <div className="grid-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-card" style={{ background: "#fff" }}>
              <div className="skeleton skeleton-banner" style={{ borderRadius: 0 }} />
              <div style={{ padding: "1.25rem" }}>
                <div className="skeleton skeleton-text w-80" />
                <div className="skeleton skeleton-text w-60" />
                <div className="skeleton skeleton-text w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
