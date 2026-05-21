export default function RegisterLoading() {
  return (
    <main style={{ minHeight: "calc(100vh - 64px)", background: "var(--gray-50)", padding: "2.5rem 1.5rem" }}>
      <div className="container-sm">
        {/* Breadcrumb skeleton */}
        <div className="skeleton skeleton-text w-40" style={{ marginBottom: "1.5rem" }} />

        {/* Header card skeleton */}
        <div className="card card-body" style={{ marginBottom: "1.5rem", background: "linear-gradient(135deg, var(--brand-900), #4c1d95)" }}>
          <div className="skeleton" style={{ height: "0.75rem", width: "30%", background: "rgba(255,255,255,0.1)", marginBottom: "0.5rem" }} />
          <div className="skeleton" style={{ height: "1.5rem", width: "60%", background: "rgba(255,255,255,0.12)", marginBottom: "0.75rem" }} />
          <div className="skeleton" style={{ height: "0.85rem", width: "40%", background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Form skeleton */}
        <div className="card card-body">
          <div className="skeleton skeleton-heading" style={{ width: "55%" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1rem" }}>
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="skeleton skeleton-text w-40" style={{ marginBottom: "0.35rem" }} />
                <div className="skeleton" style={{ height: 44, borderRadius: "0.625rem" }} />
              </div>
            ))}
            <div className="skeleton" style={{ height: 48, borderRadius: "0.625rem", marginTop: "0.5rem" }} />
          </div>
        </div>
      </div>
    </main>
  );
}
