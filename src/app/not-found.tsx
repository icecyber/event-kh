import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="error-state">
        <span className="error-state-icon">🔍</span>
        <h2>Page Not Found</h2>
        <p>
          Sorry, we couldn't find the page you're looking for. It may have been moved, deleted, or the URL might be incorrect.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-primary">Go Home</Link>
          <Link href="/events" className="btn btn-secondary">Browse Events</Link>
        </div>
      </div>
    </main>
  );
}
