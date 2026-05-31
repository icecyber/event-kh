export default function EventDetailLoading() {
  return (
    <main style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Banner skeleton */}
      <div className="skeleton" style={{ height: 320, borderRadius: 0 }} />

      {/* Content skeleton */}
      <div className="container event-detail-grid" style={{ padding: "2.5rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>
        <div>
          <div className="card card-body" style={{ marginBottom: "1.5rem" }}>
            <div className="skeleton skeleton-heading" />
            <div className="skeleton skeleton-text w-full" />
            <div className="skeleton skeleton-text w-80" />
            <div className="skeleton skeleton-text w-60" />
            <div className="skeleton skeleton-text w-full" />
          </div>
          <div className="card card-body">
            <div className="skeleton skeleton-heading" style={{ width: "60%" }} />
            <div className="skeleton skeleton-text w-40" />
            <div className="skeleton skeleton-text w-60" />
          </div>
        </div>
        <div className="card card-body">
          <div className="skeleton skeleton-text w-60" />
          <div className="skeleton skeleton-text w-80" />
          <div className="skeleton skeleton-text w-40" />
          <div style={{ height: "1rem" }} />
          <div className="skeleton" style={{ height: 48, borderRadius: "0.625rem" }} />
        </div>
      </div>
    </main>
  );
}
