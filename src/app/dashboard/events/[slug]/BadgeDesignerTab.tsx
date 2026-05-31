"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface EventData {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  date: string;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  capacity?: number | null;
  bannerImageURL?: string | null;
  badgeBackgroundURL?: string | null;
  badgeEnabled: boolean;
  badgeSize: string;
  badgeOrientation: string;
  eventType: string;
  ticketTypes: { id: string; name: string; price: number }[];
}

export default function BadgeDesignerTab({ event }: { event: EventData }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Badge configuration states
  const [badgeEnabled, setBadgeEnabled] = useState(event.badgeEnabled);
  const [badgeSize, setBadgeSize] = useState(event.badgeSize || "3*4");
  const [badgeOrientation, setBadgeOrientation] = useState(event.badgeOrientation || "vertical");
  const [badgeBackgroundURL, setBadgeBackgroundURL] = useState(event.badgeBackgroundURL || "");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        throw new Error("Failed to upload background image");
      }
      const data = await res.json();
      setBadgeBackgroundURL(data.url);
    } catch (err: any) {
      setError(err.message || "Upload error");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          badgeEnabled,
          badgeSize,
          badgeOrientation,
          badgeBackgroundURL: badgeBackgroundURL || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save badge configuration");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  // Preview sizing calculations
  const getAspect = (size: string, orient: string) => {
    if (orient === "vertical") {
      if (size === "A3") return 1189 / 841; // ~1.414
      if (size === "2*3") return 900 / 600; // 1.5
      return 800 / 600; // 1.333
    } else {
      if (size === "A3") return 841 / 1189; // ~0.707
      if (size === "2*3") return 600 / 900; // 0.667
      return 600 / 800; // 0.75
    }
  };

  const isVertical = badgeOrientation === "vertical";
  const previewWidth = isVertical ? 290 : 400;
  const previewHeight = previewWidth * getAspect(badgeSize, badgeOrientation);

  // Formatting date display for mock preview
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", {
    weekday: "short", year: "numeric", month: "short", day: "numeric", timeZone: "UTC"
  });
  const mockDate = fmtDate(event.date);

  const mockTicketType = event.ticketTypes?.[0]?.name || "VIP PASS";

  // Simulator style options
  const defaultBgGradient = "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)";
  const simulatorBg = badgeEnabled && badgeBackgroundURL
    ? `linear-gradient(rgba(15, 10, 60, 0.58), rgba(15, 10, 60, 0.58)), url("${badgeBackgroundURL}")`
    : defaultBgGradient;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start", marginTop: "0.5rem" }}>
      {/* Configuration column */}
      <div className="card card-body" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div>
          <h3 style={{ color: "var(--gray-900)", marginBottom: "0.25rem" }}>🎨 Custom Badge Designer</h3>
          <p style={{ color: "var(--gray-500)", fontSize: "0.85rem" }}>
            Design high-quality branded event badges for physical printing or PDF downloads.
          </p>
        </div>

        {/* Toggle Custom Background */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontWeight: 600, color: "var(--gray-800)" }}>
            <input
              type="checkbox"
              checked={badgeEnabled}
              onChange={(e) => setBadgeEnabled(e.target.checked)}
              style={{ accentColor: "var(--brand-600)", width: 18, height: 18 }}
            />
            Enable Custom Background Image
          </label>
          <span style={{ fontSize: "0.78rem", color: "var(--gray-400)", marginLeft: "1.7rem" }}>
            When disabled, a premium EventKH dark-ocean linear gradient is used instead.
          </span>
        </div>

        {badgeEnabled && (
          <div style={{ padding: "1.1rem", border: "1.5px dashed var(--gray-200)", borderRadius: "0.75rem", background: "var(--gray-50)" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.5rem" }}>
              Upload Background
            </span>
            {badgeBackgroundURL && (
              <div style={{ marginBottom: "0.75rem", borderRadius: "0.5rem", overflow: "hidden", border: "1px solid var(--gray-200)", maxHeight: 110, display: "inline-block" }}>
                <img src={badgeBackgroundURL} alt="Badge BG" style={{ height: 110, objectFit: "contain", background: "#000" }} />
              </div>
            )}
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
                {uploading ? <><span className="spinner spinner-dark" /> Uploading…</> : "📤 Choose Image File"}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                  disabled={uploading}
                />
              </label>
              {badgeBackgroundURL && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setBadgeBackgroundURL("")}>
                  Remove Image
                </button>
              )}
            </div>
          </div>
        )}

        {/* Layout Dimensions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.35rem" }}>
              Badge Size
            </span>
            <select className="form-select" value={badgeSize} onChange={(e) => setBadgeSize(e.target.value)}>
              <option value="3*4">3 × 4 (Standard Card)</option>
              <option value="2*3">2 × 3 (Compact Wallet)</option>
              <option value="A3">A3 (Large Signage)</option>
            </select>
          </div>

          <div className="form-group">
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.35rem" }}>
              Orientation
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                className={`btn btn-sm ${isVertical ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => setBadgeOrientation("vertical")}
              >
                Vertical
              </button>
              <button
                type="button"
                className={`btn btn-sm ${!isVertical ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => setBadgeOrientation("horizontal")}
              >
                Horizontal
              </button>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ Badge configuration saved successfully!</div>}

        {/* Action Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem", borderTop: "1px solid var(--gray-100)", paddingTop: "1.25rem" }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", fontSize: "0.95rem", padding: "0.75rem 1rem" }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <><span className="spinner" /> Saving…</> : "💾 Save Layout Design"}
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Link
              href={`/dashboard/events/${event.slug}/print-badges`}
              className="btn btn-secondary"
              target="_blank"
              style={{ justifyContent: "center", textDecoration: "none" }}
            >
              🖨️ Print All Badges
            </Link>
            <a
              href={`/api/events/${event.id}/badge-preview?enabled=${badgeEnabled}&size=${badgeSize}&orientation=${badgeOrientation}&bg=${encodeURIComponent(badgeBackgroundURL)}`}
              download={`mock-badge-${event.id}.png`}
              className="btn btn-ghost"
              style={{ justifyContent: "center", textDecoration: "none" }}
            >
              📥 Download Sample PNG
            </a>
          </div>
        </div>
      </div>

      {/* Simulator Column */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          High-Fidelity Badge Preview
        </span>

        {/* Live CSS Simulator */}
        <div
          style={{
            width: previewWidth,
            height: previewHeight,
            backgroundImage: simulatorBg,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "1rem",
            padding: isVertical ? "1.5rem" : "1.75rem",
            color: "#fff",
            display: "flex",
            flexDirection: isVertical ? "column" : "row",
            position: "relative",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            overflow: "hidden",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Decorative circles representing server-rendered background details */}
          {!badgeBackgroundURL && (
            <>
              <div style={{
                position: "absolute", top: "-15%", right: "-15%", width: "45%", height: "45%",
                borderRadius: "50%", background: "rgba(99, 102, 241, 0.18)", filter: "blur(20px)", pointerEvents: "none"
              }} />
              <div style={{
                position: "absolute", bottom: "-15%", left: "-15%", width: "50%", height: "50%",
                borderRadius: "50%", background: "rgba(139, 92, 246, 0.13)", filter: "blur(25px)", pointerEvents: "none"
              }} />
            </>
          )}

          {isVertical ? (
            /* Vertical simulated layout */
            <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
              {/* Brand logo capsule */}
              <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "0.25rem", padding: "0.3rem 0.65rem", background: "rgba(255, 255, 255, 0.12)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "0.5rem", backdropFilter: "blur(8px)", fontSize: "0.72rem", fontWeight: 700, color: "#a5f3fc", letterSpacing: "0.03em" }}>
                <span>⚡</span> EventKH
              </div>

              {/* Ticket Type Tag */}
              <div style={{ marginTop: "1rem", alignSelf: "flex-start", background: "#6366f1", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: "0.68rem", fontWeight: 800, padding: "0.25rem 0.5rem", borderRadius: "0.37rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {mockTicketType}
              </div>

              {/* Attendee Name */}
              <div style={{ marginTop: "auto", marginBottom: "0.5rem", fontSize: "1.8rem", fontWeight: 800, lineHeight: 1.15, wordBreak: "break-word" }}>
                John Doe
              </div>

              {/* Divider */}
              <div style={{ borderTop: "1.5px solid rgba(165, 243, 252, 0.3)", margin: "0.75rem 0 0.5rem 0" }} />

              {/* Event details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.85rem" }}>
                <div style={{ fontWeight: 700, color: "#e0e7ff", wordBreak: "break-word", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.25 }}>
                  {event.title}
                </div>
                <div style={{ color: "#a5b4fc", fontSize: "0.75rem", marginTop: "0.1rem" }}>
                  📅 &nbsp;{mockDate}{event.startTime ? ` · ${event.startTime}` : ""}
                </div>
                {event.location && (
                  <div style={{ color: "#a5b4fc", fontSize: "0.75rem", display: "flex", alignItems: "center" }}>
                    📍 &nbsp;<span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "90%" }}>{event.location}</span>
                  </div>
                )}
              </div>

              {/* QR Code container */}
              <div style={{ marginTop: "auto", background: "rgba(255, 255, 255, 0.95)", padding: "0.75rem", borderRadius: "0.75rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                {/* SVG mock QR pattern */}
                <svg width="60" height="60" viewBox="0 0 100 100" style={{ fill: "#000" }}>
                  <rect x="0" y="0" width="30" height="30" />
                  <rect x="5" y="5" width="20" height="20" fill="#fff" />
                  <rect x="10" y="10" width="10" height="10" />

                  <rect x="70" y="0" width="30" height="30" />
                  <rect x="75" y="5" width="20" height="20" fill="#fff" />
                  <rect x="80" y="10" width="10" height="10" />

                  <rect x="0" y="70" width="30" height="30" />
                  <rect x="5" y="75" width="20" height="20" fill="#fff" />
                  <rect x="10" y="80" width="10" height="10" />

                  <rect x="40" y="40" width="20" height="20" />
                  <rect x="45" y="10" width="15" height="15" />
                  <rect x="80" y="45" width="15" height="15" />
                  <rect x="15" y="45" width="10" height="15" />
                  <rect x="45" y="75" width="20" height="10" />
                  <rect x="75" y="75" width="10" height="15" />
                </svg>
                <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#4f46e5", letterSpacing: "0.08em" }}>SCAN TO VERIFY</span>
              </div>

              {/* Watermark */}
              <div style={{ fontSize: "0.58rem", color: "rgba(165, 180, 252, 0.45)", textAlign: "center", marginTop: "1rem" }}>
                Powered by EventKH • events.kh
              </div>
            </div>
          ) : (
            /* Horizontal simulated layout */
            <div style={{ display: "flex", width: "100%", height: "100%", gap: "1.5rem" }}>
              {/* Left text column */}
              <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                {/* Brand logo capsule */}
                <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "0.25rem", padding: "0.3rem 0.65rem", background: "rgba(255, 255, 255, 0.12)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "0.5rem", backdropFilter: "blur(8px)", fontSize: "0.72rem", fontWeight: 700, color: "#a5f3fc", letterSpacing: "0.03em" }}>
                  <span>⚡</span> EventKH
                </div>

                {/* Ticket Type Tag */}
                <div style={{ marginTop: "0.75rem", alignSelf: "flex-start", background: "#6366f1", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: "0.68rem", fontWeight: 800, padding: "0.25rem 0.5rem", borderRadius: "0.37rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {mockTicketType}
                </div>

                {/* Attendee Name */}
                <div style={{ marginTop: "auto", marginBottom: "0.25rem", fontSize: "1.6rem", fontWeight: 800, lineHeight: 1.15, wordBreak: "break-word" }}>
                  John Doe
                </div>

                {/* Divider */}
                <div style={{ borderTop: "1.5px solid rgba(165, 243, 252, 0.3)", margin: "0.5rem 0" }} />

                {/* Event details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", fontSize: "0.82rem" }}>
                  <div style={{ fontWeight: 700, color: "#e0e7ff", wordBreak: "break-word", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.25 }}>
                    {event.title}
                  </div>
                  <div style={{ color: "#a5b4fc", fontSize: "0.72rem", marginTop: "0.1rem" }}>
                    📅 &nbsp;{mockDate}{event.startTime ? ` · ${event.startTime}` : ""}
                  </div>
                  {event.location && (
                    <div style={{ color: "#a5b4fc", fontSize: "0.72rem", display: "flex", alignItems: "center" }}>
                      📍 &nbsp;<span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "90%" }}>{event.location}</span>
                    </div>
                  )}
                </div>

                {/* Watermark */}
                <div style={{ fontSize: "0.55rem", color: "rgba(165, 180, 252, 0.45)", marginTop: "auto" }}>
                  Powered by EventKH • events.kh
                </div>
              </div>

              {/* Right QR Column */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <div style={{ background: "rgba(255, 255, 255, 0.95)", padding: "0.75rem", borderRadius: "0.75rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                  {/* SVG mock QR pattern */}
                  <svg width="70" height="70" viewBox="0 0 100 100" style={{ fill: "#000" }}>
                    <rect x="0" y="0" width="30" height="30" />
                    <rect x="5" y="5" width="20" height="20" fill="#fff" />
                    <rect x="10" y="10" width="10" height="10" />

                    <rect x="70" y="0" width="30" height="30" />
                    <rect x="75" y="5" width="20" height="20" fill="#fff" />
                    <rect x="80" y="10" width="10" height="10" />

                    <rect x="0" y="70" width="30" height="30" />
                    <rect x="5" y="75" width="20" height="20" fill="#fff" />
                    <rect x="10" y="80" width="10" height="10" />

                    <rect x="40" y="40" width="20" height="20" />
                    <rect x="45" y="10" width="15" height="15" />
                    <rect x="80" y="45" width="15" height="15" />
                    <rect x="15" y="45" width="10" height="15" />
                    <rect x="45" y="75" width="20" height="10" />
                    <rect x="75" y="75" width="10" height="15" />
                  </svg>
                  <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#4f46e5", letterSpacing: "0.08em" }}>SCAN TO VERIFY</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
