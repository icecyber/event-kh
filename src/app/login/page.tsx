"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";

const BRAND_FEATURES = [
  { icon: "🎟️", text: "Issue QR tickets in minutes" },
  { icon: "📊", text: "Real-time attendee dashboard" },
  { icon: "🎫", text: "Branded badge generation" },
  { icon: "📲", text: "Instant QR check-in scanning" },
];

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", { redirect: false, email, password });

    if (res?.error) {
      setError(t("auth.invalidCredentials"));
      setLoading(false);
    } else {
      router.push("/dashboard");
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
            Welcome back to Cambodia's event platform
          </h1>
          <p style={{ marginBottom: "2.5rem" }}>
            Sign in to manage your events, view participants, and scan QR check-ins.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {BRAND_FEATURES.map((f) => (
              <div key={f.text} style={{
                display: "flex", alignItems: "center", gap: "0.875rem",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "0.875rem", padding: "0.75rem 1rem",
                backdropFilter: "blur(8px)",
              }}>
                <span style={{ fontSize: "1.3rem" }}>{f.icon}</span>
                <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FORM PANEL (right) ── */}
      <div className="auth-panel-form">
        <div className="auth-form-box">
          <h2>{t("auth.signInTitle")}</h2>
          <p className="subtitle">
            {t("auth.orCreateAccount")}{" "}
            <Link href="/register" style={{ color: "var(--ocean-600)", fontWeight: 600, textDecoration: "none" }}>
              {t("auth.createNewAccount")}
            </Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {error && (
              <div className="alert alert-error">{error}</div>
            )}

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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem", fontSize: "0.95rem" }}
            >
              {loading ? <><span className="spinner" /> {t("auth.signingIn")}</> : t("auth.signInBtn")}
            </button>
          </form>

          <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.85rem", color: "var(--gray-400)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "var(--ocean-600)", fontWeight: 600, textDecoration: "none" }}>
              Sign up free →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
