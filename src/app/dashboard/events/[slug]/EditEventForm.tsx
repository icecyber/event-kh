"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EditableEvent {
  id: string;
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
}

export default function EditEventForm({ event, onSaved }: { event: EditableEvent; onSaved?: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description ?? "");
  const [date, setDate] = useState(event.date.split("T")[0]);
  const [endDate, setEndDate] = useState(event.endDate?.split("T")[0] ?? "");
  const [startTime, setStartTime] = useState(event.startTime ?? "");
  const [endTime, setEndTime] = useState(event.endTime ?? "");
  const [location, setLocation] = useState(event.location ?? "");
  const [capacity, setCapacity] = useState(event.capacity?.toString() ?? "");
  const [bannerImageURL, setBannerImageURL] = useState(event.bannerImageURL ?? "");
  const [badgeEnabled, setBadgeEnabled] = useState(event.badgeEnabled);
  const [badgeSize, setBadgeSize] = useState(event.badgeSize);
  const [badgeOrientation, setBadgeOrientation] = useState(event.badgeOrientation);
  const [badgeBackgroundURL, setBadgeBackgroundURL] = useState(event.badgeBackgroundURL ?? "");

  // Banner upload
  const [uploading, setUploading] = useState(false);
  const handleBannerUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setBannerImageURL(data.url);
      }
    } finally {
      setUploading(false);
    }
  };

  // Badge BG upload
  const [uploadingBg, setUploadingBg] = useState(false);
  const handleBadgeBgUpload = async (file: File) => {
    setUploadingBg(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setBadgeBackgroundURL(data.url);
      }
    } finally {
      setUploadingBg(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          date: new Date(date).toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : null,
          startTime: startTime || null,
          endTime: endTime || null,
          location: location.trim() || null,
          capacity: capacity ? parseInt(capacity) : null,
          bannerImageURL: bannerImageURL || null,
          badgeEnabled,
          badgeSize,
          badgeOrientation,
          badgeBackgroundURL: badgeBackgroundURL || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save changes");
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
      onSaved?.();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const sectionStyle: React.CSSProperties = {
    padding: "1.25rem",
    border: "1px solid var(--gray-200)",
    borderRadius: "0.75rem",
    background: "var(--gray-50)",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.8rem", fontWeight: 700, color: "var(--gray-500)",
    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Core Details */}
      <div style={sectionStyle}>
        <h4 style={{ marginBottom: "1rem", color: "var(--gray-900)" }}>📝 Event Details</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label" style={labelStyle}>Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={labelStyle}>Description</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label" style={labelStyle}>Start Date</label>
              <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" style={labelStyle}>End Date</label>
              <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label" style={labelStyle}>Start Time</label>
              <input type="text" className="form-input" placeholder="e.g. 09:00 AM" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" style={labelStyle}>End Time</label>
              <input type="text" className="form-input" placeholder="e.g. 05:00 PM" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label" style={labelStyle}>Location</label>
              <input type="text" className="form-input" placeholder="e.g. Phnom Penh, Cambodia" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" style={labelStyle}>Capacity</label>
              <input type="number" className="form-input" placeholder="Unlimited" value={capacity} onChange={(e) => setCapacity(e.target.value)} min={0} />
            </div>
          </div>
        </div>
      </div>

      {/* Banner Image */}
      <div style={sectionStyle}>
        <h4 style={{ marginBottom: "1rem", color: "var(--gray-900)" }}>🖼️ Banner Image</h4>
        {bannerImageURL && (
          <div style={{ marginBottom: "0.75rem", borderRadius: "0.5rem", overflow: "hidden", maxHeight: 160 }}>
            <img src={bannerImageURL} alt="Banner preview" style={{ width: "100%", height: 160, objectFit: "cover" }} />
          </div>
        )}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
            {uploading ? <><span className="spinner spinner-dark" /> Uploading…</> : "📤 Upload Image"}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => e.target.files?.[0] && handleBannerUpload(e.target.files[0])}
            />
          </label>
          {bannerImageURL && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setBannerImageURL("")}>Remove</button>
          )}
        </div>
      </div>

      {/* Badge Config */}
      <div style={sectionStyle}>
        <h4 style={{ marginBottom: "1rem", color: "var(--gray-900)" }}>🎫 Badge Configuration</h4>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={badgeEnabled}
              onChange={(e) => setBadgeEnabled(e.target.checked)}
              style={{ accentColor: "var(--brand-600)", width: 18, height: 18 }}
            />
            <span style={{ fontWeight: 600, color: "var(--gray-700)" }}>Enable custom badge background</span>
          </label>
        </div>

        {badgeEnabled && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" style={labelStyle}>Badge Size</label>
                <select className="form-select" value={badgeSize} onChange={(e) => setBadgeSize(e.target.value)}>
                  <option value="A3">A3</option>
                  <option value="2*3">2×3</option>
                  <option value="3*4">3×4</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={labelStyle}>Orientation</label>
                <select className="form-select" value={badgeOrientation} onChange={(e) => setBadgeOrientation(e.target.value)}>
                  <option value="vertical">Vertical</option>
                  <option value="horizontal">Horizontal</option>
                </select>
              </div>
            </div>
            <div>
              <label className="form-label" style={labelStyle}>Background Image</label>
              {badgeBackgroundURL && (
                <div style={{ marginBottom: "0.5rem", borderRadius: "0.5rem", overflow: "hidden", maxHeight: 100, display: "inline-block" }}>
                  <img src={badgeBackgroundURL} alt="Badge BG preview" style={{ height: 100, objectFit: "contain" }} />
                </div>
              )}
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
                  {uploadingBg ? <><span className="spinner spinner-dark" /> Uploading…</> : "📤 Upload Badge BG"}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => e.target.files?.[0] && handleBadgeBgUpload(e.target.files[0])}
                  />
                </label>
                {badgeBackgroundURL && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setBadgeBackgroundURL("")}>Remove</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status messages */}
      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ Changes saved successfully!</div>}

      {/* Save button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ minWidth: 180, justifyContent: "center" }}>
          {saving ? <><span className="spinner" /> Saving…</> : "💾 Save Changes"}
        </button>
      </div>
    </form>
  );
}
