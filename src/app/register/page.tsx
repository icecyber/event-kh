"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";

const BRAND_POINTS = [
  { icon: "✅", text: "Free to create your first event" },
  { icon: "🌏", text: "Built for Cambodia, used across SE Asia" },
  { icon: "⚡", text: "Set up in under 3 minutes" },
  { icon: "🔒", text: "Secure QR tickets & attendee data" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ATTENDEE");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.text();
        setError(data || "Registration failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* ── BRAND PANEL (left) ── */}
      <div className="auth-panel-brand">
        <div className="auth-panel-brand-content">
          <div style={{ marginBottom: "2rem" }}>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "2rem", fontWeight: 900,
              letterSpacing: "-0.04em",
              background: "linear-gradient(135deg, #fff, #bae6fd)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              ⚡ EventKH
            </span>
          </div>

          <h1 style={{ fontSize: "2rem", marginBottom: "0.875rem" }}>
            Start managing events like a pro
          </h1>
          <p style={{ marginBottom: "2.5rem" }}>
            Create an account as an organizer or attendee and join thousands of event creators in Cambodia.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {BRAND_POINTS.map((f) => (
              <div key={f.text} style={{
                display: "flex", alignItems: "center", gap: "0.875rem",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "0.875rem", padding: "0.75rem 1rem",
                backdropFilter: "blur(8px)",
              }}>
                <span style={{ fontSize: "1.2rem" }}>{f.icon}</span>
                <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FORM PANEL (right) ── */}
      <div className="auth-panel-form">
        <div className="auth-form-box">
          <h2>{t("auth.createAccountTitle")}</h2>
          <p className="subtitle">
            {t("auth.alreadyHaveAccount")}{" "}
            <Link href="/login" style={{ color: "var(--ocean-600)", fontWeight: 600, textDecoration: "none" }}>
              {t("auth.signIn")}
            </Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
            {error && (
              <div className="alert alert-error">{error}</div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="name">{t("auth.fullNamePlaceholder")}</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Dara Sok"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">{t("auth.emailPlaceholder")}</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">{t("auth.passwordPlaceholder")}</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role">{t("auth.iAmA")}</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {[
                  { value: "ATTENDEE", label: t("auth.attendee"), icon: "🎟️" },
                  { value: "ORGANIZER", label: t("auth.organizer"), icon: "🎪" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      gap: "0.35rem", padding: "0.875rem",
                      borderRadius: "0.875rem", cursor: "pointer",
                      border: role === opt.value
                        ? "2px solid var(--ocean-500)"
                        : "1.5px solid var(--gray-200)",
                      background: role === opt.value ? "var(--ocean-50)" : "#fff",
                      color: role === opt.value ? "var(--ocean-700)" : "var(--gray-600)",
                      fontWeight: 600, fontSize: "0.85rem",
                      transition: "all 0.2s",
                      boxShadow: role === opt.value ? "0 0 0 3px rgba(14,165,233,0.15)" : "none",
                    }}
                  >
                    <span style={{ fontSize: "1.4rem" }}>{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center", marginTop: "0.25rem", fontSize: "0.95rem" }}
            >
              {loading
                ? <><span className="spinner" /> {t("auth.registering")}</>
                : t("auth.registerBtn")}
            </button>
          </form>

          <p style={{ marginTop: "1.5rem", fontSize: "0.78rem", color: "var(--gray-300)", textAlign: "center", lineHeight: 1.6 }}>
            By registering you agree to our{" "}
            <span style={{ color: "var(--ocean-600)" }}>Terms of Service</span> and{" "}
            <span style={{ color: "var(--ocean-600)" }}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
