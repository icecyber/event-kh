"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ParticipantsTab from "./ParticipantsTab";
import RedeemTab from "./RedeemTab";

interface EventData {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  capacity?: number | null;
  bannerImageURL?: string | null;
  badgeBackgroundURL?: string | null;
  isPublished: boolean;
  totalRegistrations: number;
  checkedIn: number;
  ticketTypes: { id: string; name: string; price: number; quantityAvailable?: number | null }[];
  customFields: { id: string; label: string; fieldType: string; required: boolean; options?: string | null }[];
}

const TABS = ["Overview", "Participants", "Redeem", "Settings"] as const;
type Tab = (typeof TABS)[number];

export default function EventManagementClient({ event }: { event: EventData }) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [isPublished, setIsPublished] = useState(event.isPublished);
  const [publishing, setPublishing] = useState(false);
  const [shareUrl, setShareUrl] = useState(`/events/${event.id}/register`);

  useEffect(() => {
    setShareUrl(`${window.location.origin}/events/${event.id}/register`);
  }, [event.id]);

  const togglePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`/api/events/${event.id}/publish`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setIsPublished(data.isPublished);
    } finally {
      setPublishing(false);
    }
  };

  const dateStr = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC"
  });

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar no-print">
        <div style={{ marginBottom: "2rem", padding: "0.5rem" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--gray-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Organizer</p>
        </div>
        <Link href="/dashboard" className="dash-sidebar-link">📊 Overview</Link>
        <Link href="/dashboard/events" className="dash-sidebar-link">📅 My Events</Link>
        <Link href="/dashboard/events/new" className="dash-sidebar-link">➕ Create Event</Link>
        <div style={{ marginTop: "1.5rem", padding: "0.5rem" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--gray-500)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Current Event</p>
          <p style={{ color: "var(--gray-300)", fontSize: "0.82rem", lineHeight: 1.4 }}>{event.title}</p>
        </div>
      </aside>

      <main className="dash-main">
        {/* Page header */}
        <div className="page-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
              <Link href="/dashboard/events" style={{ color: "var(--brand-600)", textDecoration: "none", fontSize: "0.875rem" }}>← My Events</Link>
              {isPublished ? (
                <span className="badge badge-green">Published</span>
              ) : (
                <span className="badge badge-gray">Draft</span>
              )}
            </div>
            <h1 className="page-title" style={{ fontSize: "1.5rem" }}>{event.title}</h1>
            <p className="page-subtitle">
              📅 {dateStr}{event.startTime ? ` · ${event.startTime}` : ""}
              {event.location ? ` · 📍 ${event.location}` : ""}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }} className="no-print">
            <button
              className={`btn ${isPublished ? "btn-secondary" : "btn-primary"}`}
              onClick={togglePublish}
              disabled={publishing}
            >
              {publishing ? <span className="spinner spinner-dark" /> : isPublished ? "📴 Unpublish" : "🚀 Publish"}
            </button>
            <Link
              href={`/events/${event.id}`}
              className="btn btn-ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              🔗 View Public Page
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">👥</div>
            <div className="stat-value">{event.totalRegistrations}</div>
            <div className="stat-label">Registrations</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-green">✅</div>
            <div className="stat-value">{event.checkedIn}</div>
            <div className="stat-label">Checked In</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-amber">🎟️</div>
            <div className="stat-value">{event.totalRegistrations - event.checkedIn}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-purple">📊</div>
            <div className="stat-value">
              {event.capacity
                ? `${Math.round((event.totalRegistrations / event.capacity) * 100)}%`
                : "—"}
            </div>
            <div className="stat-label">Capacity Used</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs no-print">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
              id={`tab-${tab.toLowerCase()}`}
            >
              {tab === "Overview" ? "📋 " : tab === "Participants" ? "👥 " : tab === "Redeem" ? "📲 " : "⚙️ "}
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "Overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div className="card card-body">
              <h3 style={{ marginBottom: "1rem", color: "var(--gray-900)" }}>Event Details</h3>
              <dl style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {event.description && (
                  <div><dt style={dtStyle}>Description</dt><dd style={{ color: "var(--gray-600)", fontSize: "0.9rem" }}>{event.description}</dd></div>
                )}
                <div><dt style={dtStyle}>Date</dt><dd>{dateStr}</dd></div>
                {event.startTime && <div><dt style={dtStyle}>Time</dt><dd>{event.startTime}{event.endTime ? ` – ${event.endTime}` : ""}</dd></div>}
                {event.location && <div><dt style={dtStyle}>Location</dt><dd>{event.location}</dd></div>}
                <div><dt style={dtStyle}>Capacity</dt><dd>{event.capacity ?? "Unlimited"}</dd></div>
                <div>
                  <dt style={dtStyle}>Ticket Types</dt>
                  <dd style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {event.ticketTypes.map((t) => (
                      <span key={t.id} className="badge badge-purple">{t.name}</span>
                    ))}
                  </dd>
                </div>
                {event.badgeBackgroundURL && (
                  <div><dt style={dtStyle}>Badge Background</dt><dd><span className="badge badge-green">Custom image set</span></dd></div>
                )}
              </dl>
            </div>

            <div className="card card-body">
              <h3 style={{ marginBottom: "1rem", color: "var(--gray-900)" }}>Custom Form Fields</h3>
              {event.customFields.length === 0 ? (
                <p style={{ color: "var(--gray-400)", fontSize: "0.875rem" }}>No custom fields — attendees only need to select a ticket type.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {event.customFields.map((f, i) => (
                    <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0", borderBottom: "1px solid var(--gray-100)" }}>
                      <span style={{ color: "var(--gray-400)", fontSize: "0.85rem", minWidth: 24 }}>#{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600, color: "var(--gray-800)" }}>{f.label}</span>
                        {f.required && <span style={{ color: "var(--rose-500)", fontSize: "0.8rem", marginLeft: 4 }}>*</span>}
                      </div>
                      <span className="badge badge-blue">{f.fieldType}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: "1.5rem" }}>
                <h4 style={{ marginBottom: "0.75rem", color: "var(--gray-700)" }}>Registration Link</h4>
                <div style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: "0.5rem", padding: "0.75rem", fontFamily: "monospace", fontSize: "0.8rem", color: "var(--gray-600)", wordBreak: "break-all" }}>
                  {shareUrl}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Participants" && <ParticipantsTab eventId={event.id} />}

        {activeTab === "Redeem" && <RedeemTab eventId={event.id} />}

        {activeTab === "Settings" && (
          <div className="card card-body" style={{ maxWidth: 560 }}>
            <h3 style={{ marginBottom: "1.5rem", color: "var(--gray-900)" }}>Event Settings</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", border: "1.5px solid var(--gray-200)", borderRadius: "0.75rem" }}>
                <div>
                  <p style={{ fontWeight: 600, color: "var(--gray-800)" }}>
                    {isPublished ? "Unpublish Event" : "Publish Event"}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "var(--gray-500)" }}>
                    {isPublished ? "Hide this event from the public listing." : "Make this event visible to attendees."}
                  </p>
                </div>
                <button
                  className={`btn ${isPublished ? "btn-secondary" : "btn-primary"} btn-sm`}
                  onClick={togglePublish}
                  disabled={publishing}
                >
                  {publishing ? <span className="spinner spinner-dark" /> : isPublished ? "Unpublish" : "Publish"}
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", border: "1.5px solid #fda4af", borderRadius: "0.75rem", background: "#fff5f5" }}>
                <div>
                  <p style={{ fontWeight: 600, color: "var(--rose-500)" }}>Danger Zone</p>
                  <p style={{ fontSize: "0.85rem", color: "var(--gray-500)" }}>Delete this event and all its registrations permanently.</p>
                </div>
                <DeleteEventButton eventId={event.id} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const dtStyle: React.CSSProperties = {
  fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-400)",
  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem"
};

function DeleteEventButton({ eventId }: { eventId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    if (res.ok) window.location.href = "/dashboard/events";
    else { alert("Delete failed"); setDeleting(false); setConfirming(false); }
  };

  if (confirming) {
    return (
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setConfirming(false)} disabled={deleting}>Cancel</button>
        <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
          {deleting ? <span className="spinner" /> : "Confirm Delete"}
        </button>
      </div>
    );
  }
  return (
    <button className="btn btn-danger btn-sm" onClick={() => setConfirming(true)}>
      🗑️ Delete
    </button>
  );
}
