"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <main style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="error-state">
        <span className="error-state-icon">⚠️</span>
        <h2>Something went wrong</h2>
        <p>
          An unexpected error occurred. Please try again, or contact support if the problem persists.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => reset()} className="btn btn-primary">
            Try Again
          </button>
          <a href="/" className="btn btn-secondary">Go Home</a>
        </div>
        {error.digest && (
          <p style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "1.5rem" }}>
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
