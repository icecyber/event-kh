export default function DashboardLoading() {
  return (
    <div className="dash-layout">
      {/* Sidebar skeleton */}
      <div className="dash-sidebar" style={{ gap: "0.5rem" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton" style={{ height: 40, background: "rgba(255,255,255,0.06)", borderRadius: "0.5rem" }} />
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="dash-main">
        <div className="page-header">
          <div>
            <div className="skeleton skeleton-heading" />
            <div className="skeleton skeleton-text w-60" />
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton skeleton-stat" />
          ))}
        </div>

        {/* Table skeleton */}
        <div className="card card-body">
          <div className="skeleton skeleton-heading" style={{ width: "30%" }} />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton skeleton-text w-full" style={{ height: "2.5rem", marginBottom: "0.5rem" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
