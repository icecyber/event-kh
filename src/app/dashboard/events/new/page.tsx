"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface TicketTypeInput { name: string; price: number; quantityAvailable: string; }
interface CustomFieldInput { label: string; fieldType: string; required: boolean; options: string; }

const STEPS = ["Basic Info", "Tickets", "Custom Fields", "Review"];
const FIELD_TYPES = [
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "Long Text" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox (Yes/No)" },
  { value: "number", label: "Number" },
];

const BADGE_SIZES = ["A3", "2*3", "3*4"];

// Reusable inline upload widget
function ImageUploadInput({
  label, hint, value, onChange,
}: { label: string; hint?: string; value: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadErr("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setUploadErr(data.error || "Upload failed"); return; }
      onChange(data.url);
    } catch {
      setUploadErr("Network error during upload.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "stretch" }}>
        <input
          type="url"
          className="form-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or upload below"
          style={{ flex: 1 }}
        />
        <label style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          padding: "0 1rem", borderRadius: "0.5rem", cursor: uploading ? "not-allowed" : "pointer",
          background: "var(--brand-600)", color: "#fff", fontSize: "0.85rem", fontWeight: 600,
          opacity: uploading ? 0.65 : 1, whiteSpace: "nowrap", flexShrink: 0,
        }}>
          {uploading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Uploading…</> : "📁 Upload"}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} disabled={uploading} />
        </label>
      </div>
      {uploadErr && <p style={{ fontSize: "0.8rem", color: "var(--rose-500)", marginTop: "0.25rem" }}>{uploadErr}</p>}
      {value && (
        <div style={{ marginTop: "0.5rem", borderRadius: "0.5rem", overflow: "hidden", maxHeight: 120, border: "1px solid var(--gray-200)" }}>
          <img src={value} alt="Preview" style={{ width: "100%", height: 120, objectFit: "cover" }} onError={(e) => (e.currentTarget.style.display = "none")} />
        </div>
      )}
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  );
}

export default function CreateEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Basic info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [bannerImageURL, setBannerImageURL] = useState("");
  const [badgeBackgroundURL, setBadgeBackgroundURL] = useState("");
  const [badgeEnabled, setBadgeEnabled] = useState(true);
  const [badgeSize, setBadgeSize] = useState("3*4");
  const [badgeOrientation, setBadgeOrientation] = useState<"horizontal" | "vertical">("vertical");
  const [eventType, setEventType] = useState("STANDARD");

  // Step 2: Tickets
  const [tickets, setTickets] = useState<TicketTypeInput[]>([
    { name: "General Admission", price: 0, quantityAvailable: "" },
  ]);

  // Step 3: Custom fields
  const [fields, setFields] = useState<CustomFieldInput[]>([]);

  const addTicket = () => setTickets([...tickets, { name: "", price: 0, quantityAvailable: "" }]);
  const removeTicket = (i: number) => setTickets(tickets.filter((_, idx) => idx !== i));
  const updateTicket = (i: number, key: keyof TicketTypeInput, val: string) => {
    const copy = [...tickets];
    copy[i] = { ...copy[i], [key]: key === "price" ? Number(val) : val };
    setTickets(copy);
  };

  const addField = () =>
    setFields([...fields, { label: "", fieldType: "text", required: false, options: "" }]);
  const removeField = (i: number) => setFields(fields.filter((_, idx) => idx !== i));
  const updateField = (i: number, key: keyof CustomFieldInput, val: any) => {
    const copy = [...fields];
    copy[i] = { ...copy[i], [key]: val };
    setFields(copy);
  };

  const canNext = () => {
    if (step === 0) return title.trim() && date;
    if (step === 1) return tickets.every((t) => t.name.trim());
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        title,
        description: description || undefined,
        date,
        endDate: endDate || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        location: location || undefined,
        capacity: capacity ? Number(capacity) : undefined,
        bannerImageURL: bannerImageURL || undefined,
        badgeBackgroundURL: badgeBackgroundURL || undefined,
        badgeEnabled,
        badgeSize,
        badgeOrientation,
        eventType,
        ticketTypes: tickets.map((t) => ({
          name: t.name,
          price: 0,
          quantityAvailable: t.quantityAvailable ? Number(t.quantityAvailable) : undefined,
        })),
        customFields: fields.map((f, idx) => ({
          label: f.label,
          fieldType: f.fieldType,
          required: f.required,
          options: f.fieldType === "select" && f.options
            ? f.options.split(",").map((o) => o.trim()).filter(Boolean)
            : undefined,
          order: idx,
        })),
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create event"); return; }

      router.push(`/dashboard/events/${data.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "0.5rem 1.25rem", borderRadius: "0.5rem", cursor: "pointer", fontWeight: 600,
    fontSize: "0.875rem", transition: "all 0.15s",
    background: active ? "var(--brand-600)" : "var(--gray-100)",
    color: active ? "#fff" : "var(--gray-600)",
    border: `2px solid ${active ? "var(--brand-600)" : "var(--gray-200)"}`,
  });

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar no-print">
        <div style={{ marginBottom: "2rem", padding: "0.5rem" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--gray-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Organizer</p>
        </div>
        <a href="/dashboard" className="dash-sidebar-link">📊 Overview</a>
        <a href="/dashboard/events" className="dash-sidebar-link">📅 My Events</a>
        <a href="/dashboard/events/new" className="dash-sidebar-link active">➕ Create Event</a>
      </aside>

      <main className="dash-main">
        <div className="page-header">
          <div>
            <h1 className="page-title">Create New Event</h1>
            <p className="page-subtitle">Fill in the details below to set up your event.</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="steps" style={{ marginBottom: "2.5rem" }}>
          {STEPS.map((label, idx) => (
            <div key={label} className="step-item">
              <div className="step-col">
                <div className={`step-circle ${idx < step ? "done" : idx === step ? "active" : ""}`}>
                  {idx < step ? "✓" : idx + 1}
                </div>
                <div className={`step-label ${idx === step ? "active" : ""}`}>{label}</div>
              </div>
              {idx < STEPS.length - 1 && <div className={`step-connector ${idx < step ? "done" : ""}`} />}
            </div>
          ))}
        </div>

        <div className="card card-body" style={{ maxWidth: 720 }}>
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Event Type */}
              <div className="form-group">
                <label className="form-label">Event Type <span className="req">*</span></label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <label style={{
                    display: "flex", flexDirection: "column", gap: "0.25rem", padding: "1rem",
                    border: `2px solid ${eventType === "STANDARD" ? "var(--brand-500)" : "var(--gray-200)"}`,
                    borderRadius: "0.75rem", cursor: "pointer", background: eventType === "STANDARD" ? "var(--brand-50)" : "#fff",
                    transition: "all 0.2s"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <input type="radio" name="eventType" value="STANDARD" checked={eventType === "STANDARD"} onChange={() => setEventType("STANDARD")} style={{ accentColor: "var(--brand-600)" }} />
                      <strong style={{ color: "var(--gray-800)" }}>📅 Standard Event</strong>
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginLeft: "1.5rem" }}>Requires attendees to provide name & email. Best for workshops, panels.</span>
                  </label>
                  <label style={{
                    display: "flex", flexDirection: "column", gap: "0.25rem", padding: "1rem",
                    border: `2px solid ${eventType === "EXHIBITION" ? "var(--brand-500)" : "var(--gray-200)"}`,
                    borderRadius: "0.75rem", cursor: "pointer", background: eventType === "EXHIBITION" ? "var(--brand-50)" : "#fff",
                    transition: "all 0.2s"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <input type="radio" name="eventType" value="EXHIBITION" checked={eventType === "EXHIBITION"} onChange={() => setEventType("EXHIBITION")} style={{ accentColor: "var(--brand-600)" }} />
                      <strong style={{ color: "var(--gray-800)" }}>🎪 Exhibition</strong>
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginLeft: "1.5rem" }}>Zero friction! Name + Phone only — no account needed.</span>
                  </label>
                </div>
              </div>

              {/* Title */}
              <div className="form-group">
                <label className="form-label">Event Title <span className="req">*</span></label>
                <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Tech Summit 2026" required />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this event about?" />
              </div>

              {/* Start & End Dates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Start Date <span className="req">*</span></label>
                  <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(Optional)</span></label>
                  <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={date || undefined} />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input type="time" className="form-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input type="time" className="form-input" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>

              {/* Location & Capacity */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Venue or Online" />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity</label>
                  <input type="number" className="form-input" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Unlimited" min={1} />
                </div>
              </div>

              {/* Banner Image */}
              <ImageUploadInput
                label="Banner Image"
                hint="Upload from your device or paste a public image URL."
                value={bannerImageURL}
                onChange={setBannerImageURL}
              />

              {/* Badge Configuration */}
              <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div>
                    <p style={{ fontWeight: 700, color: "var(--gray-800)", marginBottom: "0.2rem" }}>🎫 Attendee Badge</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>Customize the badge printed/downloaded at check-in.</p>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--gray-600)" }}>Enable Custom Background</span>
                    <div
                      onClick={() => setBadgeEnabled(!badgeEnabled)}
                      style={{
                        width: 44, height: 24, borderRadius: 12, cursor: "pointer", transition: "background 0.2s",
                        background: badgeEnabled ? "var(--brand-600)" : "var(--gray-300)",
                        position: "relative", flexShrink: 0,
                      }}
                    >
                      <div style={{
                        position: "absolute", top: 3, left: badgeEnabled ? 23 : 3,
                        width: 18, height: 18, borderRadius: "50%", background: "#fff",
                        transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
                      }} />
                    </div>
                  </label>
                </div>

                {badgeEnabled && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem", background: "var(--gray-50)", borderRadius: "0.75rem", border: "1px solid var(--gray-200)" }}>
                    <ImageUploadInput
                      label="Badge Background Image"
                      hint="Best results with a 800×560px image (horizontal) or 600×800px (vertical)."
                      value={badgeBackgroundURL}
                      onChange={setBadgeBackgroundURL}
                    />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Badge Size</label>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          {BADGE_SIZES.map((s) => (
                            <button key={s} type="button" style={toggleStyle(badgeSize === s)} onClick={() => setBadgeSize(s)}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Orientation</label>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button type="button" style={toggleStyle(badgeOrientation === "vertical")} onClick={() => setBadgeOrientation("vertical")}>
                            ▯ Vertical
                          </button>
                          <button type="button" style={toggleStyle(badgeOrientation === "horizontal")} onClick={() => setBadgeOrientation("horizontal")}>
                            ▭ Horizontal
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: "0.8rem", color: "var(--gray-500)", padding: "0.5rem 0.75rem", background: "#fff", borderRadius: "0.5rem", border: "1px solid var(--gray-200)" }}>
                      📐 Badge: <strong>{badgeSize}</strong> • <strong style={{ textTransform: "capitalize" }}>{badgeOrientation}</strong>
                      {" — "}
                      {badgeSize === "A3" && badgeOrientation === "horizontal" && "1189 × 841 px"}
                      {badgeSize === "A3" && badgeOrientation === "vertical" && "841 × 1189 px"}
                      {badgeSize === "2*3" && badgeOrientation === "horizontal" && "900 × 600 px"}
                      {badgeSize === "2*3" && badgeOrientation === "vertical" && "600 × 900 px"}
                      {badgeSize === "3*4" && badgeOrientation === "horizontal" && "800 × 600 px"}
                      {badgeSize === "3*4" && badgeOrientation === "vertical" && "600 × 800 px"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 1: Tickets */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>All tickets are free. You can add multiple ticket types (e.g., VIP, General, Speaker).</p>
              {tickets.map((t, i) => (
                <div key={i} style={{ border: "1.5px solid var(--gray-200)", borderRadius: "0.75rem", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ color: "var(--gray-700)", fontWeight: 600 }}>Ticket #{i + 1}</h4>
                    {tickets.length > 1 && (
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeTicket(i)}>Remove</button>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div className="form-group">
                      <label className="form-label">Ticket Name <span className="req">*</span></label>
                      <input className="form-input" value={t.name} onChange={(e) => updateTicket(i, "name", e.target.value)} placeholder="e.g. General Admission" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Quantity Available</label>
                      <input type="number" className="form-input" value={t.quantityAvailable} onChange={(e) => updateTicket(i, "quantityAvailable", e.target.value)} placeholder="Unlimited" min={1} />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={addTicket} style={{ alignSelf: "flex-start" }}>
                + Add Ticket Type
              </button>
            </div>
          )}

          {/* Step 2: Custom Fields */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>Add custom questions for attendees to answer when registering.</p>
              {fields.length === 0 && (
                <div className="alert alert-info">No custom fields yet. Click below to add one, or skip this step.</div>
              )}
              {fields.map((f, i) => (
                <div key={i} style={{ border: "1.5px solid var(--gray-200)", borderRadius: "0.75rem", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ color: "var(--gray-700)", fontWeight: 600 }}>Field #{i + 1}</h4>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeField(i)}>Remove</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem" }}>
                    <div className="form-group">
                      <label className="form-label">Label <span className="req">*</span></label>
                      <input className="form-input" value={f.label} onChange={(e) => updateField(i, "label", e.target.value)} placeholder="e.g. Dietary Requirements" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Type</label>
                      <select className="form-select" value={f.fieldType} onChange={(e) => updateField(i, "fieldType", e.target.value)}>
                        {FIELD_TYPES.map((ft) => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
                      </select>
                    </div>
                  </div>
                  {f.fieldType === "select" && (
                    <div className="form-group">
                      <label className="form-label">Options (comma-separated)</label>
                      <input className="form-input" value={f.options} onChange={(e) => updateField(i, "options", e.target.value)} placeholder="Option 1, Option 2, Option 3" />
                    </div>
                  )}
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem" }}>
                    <input type="checkbox" checked={f.required} onChange={(e) => updateField(i, "required", e.target.checked)} style={{ accentColor: "var(--brand-600)" }} />
                    <span style={{ color: "var(--gray-600)" }}>Required field</span>
                  </label>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={addField} style={{ alignSelf: "flex-start" }}>
                + Add Field
              </button>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="alert alert-info">Review your event details before creating. You can publish it later from the event management page.</div>
              <dl style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div><dt style={dtStyle}>Event Type</dt><dd style={{ fontWeight: 600, color: "var(--gray-900)" }}>{eventType === "EXHIBITION" ? "🎪 Exhibition (Phone + Name only)" : "📅 Standard Event (Name + Email)"}</dd></div>
                <div><dt style={dtStyle}>Title</dt><dd style={{ fontWeight: 600, color: "var(--gray-900)" }}>{title}</dd></div>
                {description && <div><dt style={dtStyle}>Description</dt><dd style={{ color: "var(--gray-600)", fontSize: "0.9rem" }}>{description}</dd></div>}
                <div>
                  <dt style={dtStyle}>Dates</dt>
                  <dd style={{ color: "var(--gray-700)" }}>
                    {date}{endDate && ` → ${endDate}`}
                    {startTime && ` · ${startTime}`}{endTime && ` – ${endTime}`}
                  </dd>
                </div>
                {location && <div><dt style={dtStyle}>Location</dt><dd style={{ color: "var(--gray-700)" }}>{location}</dd></div>}
                {capacity && <div><dt style={dtStyle}>Capacity</dt><dd style={{ color: "var(--gray-700)" }}>{capacity}</dd></div>}
                <div><dt style={dtStyle}>Ticket Types ({tickets.length})</dt><dd>{tickets.map((t) => <span key={t.name} className="badge badge-purple" style={{ marginRight: 6 }}>{t.name}</span>)}</dd></div>
                <div><dt style={dtStyle}>Custom Fields ({fields.length})</dt><dd>{fields.length === 0 ? <span style={{ color: "var(--gray-400)" }}>None</span> : fields.map((f) => <span key={f.label} className="badge badge-blue" style={{ marginRight: 6 }}>{f.label}</span>)}</dd></div>
                <div>
                  <dt style={dtStyle}>Badge</dt>
                  <dd style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
                    {badgeEnabled ? (
                      <>
                        <span className="badge badge-green">Custom BG</span>
                        <span className="badge badge-purple">{badgeSize}</span>
                        <span className="badge badge-blue" style={{ textTransform: "capitalize" }}>{badgeOrientation}</span>
                      </>
                    ) : (
                      <span className="badge badge-gray">Default gradient</span>
                    )}
                  </dd>
                </div>
              </dl>
              {error && <div className="alert alert-error">⚠️ {error}</div>}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--gray-100)" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => step === 0 ? router.push("/dashboard/events") : setStep(step - 1)}
            >
              {step === 0 ? "Cancel" : "← Back"}
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep(step + 1)}
                disabled={!canNext()}
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-success btn-lg"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? <><span className="spinner" /> Creating…</> : "🚀 Create Event"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const dtStyle: React.CSSProperties = {
  fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-400)",
  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem"
};
