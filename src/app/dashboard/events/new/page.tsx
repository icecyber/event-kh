"use client";

import { useState } from "react";
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

export default function CreateEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Basic info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [bannerImageURL, setBannerImageURL] = useState("");
  const [badgeBackgroundURL, setBadgeBackgroundURL] = useState("");

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
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        location: location || undefined,
        capacity: capacity ? Number(capacity) : undefined,
        bannerImageURL: bannerImageURL || undefined,
        badgeBackgroundURL: badgeBackgroundURL || undefined,
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

        <div className="card card-body" style={{ maxWidth: 680 }}>
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label">Event Title <span className="req">*</span></label>
                <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Tech Summit 2026" required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this event about?" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Date <span className="req">*</span></label>
                  <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Venue or Online" />
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
              <div className="form-group">
                <label className="form-label">Capacity</label>
                <input type="number" className="form-input" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Leave blank for unlimited" min={1} />
              </div>
              <div className="form-group">
                <label className="form-label">Banner Image URL</label>
                <input type="url" className="form-input" value={bannerImageURL} onChange={(e) => setBannerImageURL(e.target.value)} placeholder="https://…" />
                <span className="form-hint">Paste a public image URL for the event banner.</span>
              </div>
              <div className="form-group">
                <label className="form-label">Badge Background Image URL</label>
                <input type="url" className="form-input" value={badgeBackgroundURL} onChange={(e) => setBadgeBackgroundURL(e.target.value)} placeholder="https://… (optional)" />
                <span className="form-hint">Custom background for attendee badges. Leave blank for the default gradient.</span>
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
                <div><dt style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase" }}>Title</dt><dd style={{ fontWeight: 600, color: "var(--gray-900)" }}>{title}</dd></div>
                {description && <div><dt style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase" }}>Description</dt><dd style={{ color: "var(--gray-600)", fontSize: "0.9rem" }}>{description}</dd></div>}
                <div><dt style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase" }}>Date</dt><dd style={{ color: "var(--gray-700)" }}>{date}{startTime && ` · ${startTime}`}{endTime && ` – ${endTime}`}</dd></div>
                {location && <div><dt style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase" }}>Location</dt><dd style={{ color: "var(--gray-700)" }}>{location}</dd></div>}
                {capacity && <div><dt style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase" }}>Capacity</dt><dd style={{ color: "var(--gray-700)" }}>{capacity}</dd></div>}
                <div><dt style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase" }}>Ticket Types ({tickets.length})</dt><dd>{tickets.map((t) => <span key={t.name} className="badge badge-purple" style={{ marginRight: 6 }}>{t.name}</span>)}</dd></div>
                <div><dt style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase" }}>Custom Fields ({fields.length})</dt><dd>{fields.length === 0 ? <span style={{ color: "var(--gray-400)" }}>None</span> : fields.map((f) => <span key={f.label} className="badge badge-blue" style={{ marginRight: 6 }}>{f.label}</span>)}</dd></div>
                {badgeBackgroundURL && <div><dt style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase" }}>Badge Background</dt><dd style={{ color: "var(--gray-700)", fontSize: "0.85rem" }}>Custom image set</dd></div>}
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
