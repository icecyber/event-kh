"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import ParticipantsTab from "./ParticipantsTab";
import RedeemTab from "./RedeemTab";
import EditEventForm from "./EditEventForm";
import BadgeDesignerTab from "./BadgeDesignerTab";
import QuestionsTab from "./QuestionsTab";
import { getQuestionType } from "@/lib/questions";

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
  badgeQrPositionX: number;
  badgeQrPositionY: number;
  badgeQrSize: number;
  eventType: string;
  showRegistrationCount: boolean;
  isPublished: boolean;
  totalRegistrations: number;
  checkedIn: number;
  ticketTypes: { id: string; name: string; price: number; quantityAvailable?: number | null }[];
  customFields: {
    id: string;
    label: string;
    fieldType: string;
    required: boolean;
    options?: string | null;
    placeholder?: string | null;
    helpText?: string | null;
    minLength?: number | null;
    maxLength?: number | null;
    regex?: string | null;
    minValue?: number | null;
    maxValue?: number | null;
    scale?: number | null;
    rateType?: string | null;
    maxFiles?: number | null;
    maxFileSize?: number | null;
    acceptedTypes?: string | null;
  }[];
}

type Tab = "Overview" | "Participants" | "Redeem" | "Badge Designer" | "Questions" | "Settings";

const TAB_ICONS: Record<string, string> = {
  Overview: "📋 ",
  Participants: "👥 ",
  Redeem: "📲 ",
  "Badge Designer": "🎨 ",
  Questions: "❓ ",
  Settings: "⚙️ ",
};

export default function EventManagementClient({ event }: { event: EventData }) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [isPublished, setIsPublished] = useState(event.isPublished);
  const [publishing, setPublishing] = useState(false);
  const [shareUrl, setShareUrl] = useState(`/events/${event.slug}/register`);

  const tabsList = ["Overview", "Participants", "Redeem", "Badge Designer", "Questions", "Settings"];

  useEffect(() => {
    setShareUrl(`${window.location.origin}/events/${event.slug}/register`);
  }, [event.slug]);

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

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC"
  });
  const startDateStr = fmtDate(event.date);
  const endDateStr = event.endDate ? fmtDate(event.endDate) : null;
  const dateDisplay = endDateStr && endDateStr !== startDateStr
    ? `${startDateStr} – ${endDateStr}`
    : startDateStr;

  return (
    <div className="dash-layout">
      <Sidebar
        userName={session?.user?.name}
        userEmail={session?.user?.email}
        role={session?.user?.role || "ORGANIZER"}
        currentEventTitle={event.title}
      />

      <main className="dash-main">
        {/* Page header */}
        <div className="page-header" style={{ marginBottom: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
              <Link href="/dashboard/events" style={{ color: "var(--brand-600)", textDecoration: "none", fontSize: "0.875rem" }}>← Back</Link>
            </div>
            <h1 className="page-title" style={{ fontSize: "1.4rem" }}>{event.title}</h1>
            <p className="page-subtitle" style={{ fontSize: "0.85rem", color: "var(--gray-500)" }}>
              📅 {dateDisplay} {event.location ? `· 📍 ${event.location}` : ""}
            </p>
          </div>
        </div>

        {/* Tab Selector (Static Grid, No Scroll) */}
        <div className="dash-tab-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {tabsList.map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm ${activeTab === tab ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab(tab as Tab)}
              style={{ fontSize: "0.75rem", padding: "0.65rem 0.25rem", borderRadius: "0.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.25rem", minHeight: "3.5rem" }}
            >
              {TAB_ICONS[tab]}{tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "Overview" && (
          <div className="card card-body">
            <dl style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {event.description && (
                <div><dt style={dtStyle}>Description</dt><dd style={{ color: "var(--gray-600)", fontSize: "0.85rem" }}>{event.description}</dd></div>
              )}
              <div><dt style={dtStyle}>Type</dt><dd><span className={`badge ${event.eventType === "EXHIBITION" ? "badge-green" : "badge-blue"}`}>{event.eventType === "EXHIBITION" ? "🎪 Exhibition" : "📅 Standard"}</span></dd></div>
              <div><dt style={dtStyle}>Date</dt><dd style={{ fontSize: "0.875rem" }}>{dateDisplay}</dd></div>
              {event.startTime && <div><dt style={dtStyle}>Time</dt><dd style={{ fontSize: "0.875rem" }}>{event.startTime}{event.endTime ? ` – ${event.endTime}` : ""}</dd></div>}
              {event.location && <div><dt style={dtStyle}>Location</dt><dd style={{ fontSize: "0.875rem" }}>{event.location}</dd></div>}
              <div><dt style={dtStyle}>Capacity</dt><dd style={{ fontSize: "0.875rem" }}>{event.capacity ?? "Unlimited"}</dd></div>
              <div>
                <dt style={dtStyle}>Tickets</dt>
                <dd style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                  {event.ticketTypes.map((t) => (
                    <span key={t.id} className="badge badge-purple">{t.name}</span>
                  ))}
                </dd>
              </div>
              <div>
                <dt style={dtStyle}>Badge</dt>
                <dd style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", alignItems: "center" }}>
                  {event.badgeEnabled
                    ? <><span className="badge badge-green">Custom BG</span><span className="badge badge-purple">{event.badgeSize}</span><span className="badge badge-blue" style={{ textTransform: "capitalize" }}>{event.badgeOrientation}</span></>
                    : <span className="badge badge-gray">Default gradient</span>
                  }
                </dd>
              </div>
            </dl>
          </div>
        )}

        {activeTab === "Participants" && <ParticipantsTab eventId={event.id} eventSlug={event.slug} />}

        {activeTab === "Redeem" && <RedeemTab eventId={event.id} />}

        {activeTab === "Badge Designer" && <BadgeDesignerTab event={event} />}

        {activeTab === "Questions" && <QuestionsTab event={event} />}

        {activeTab === "Settings" && (
          <div style={{ maxWidth: 680 }}>
            <h3 style={{ marginBottom: "1.5rem", color: "var(--gray-900)" }}>⚙️ Edit Event</h3>

            <div
              className="alert alert-info"
              style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}
            >
              <span>📋 Registration questions are managed in the Questions tab.</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab("Questions")}
                style={{ whiteSpace: "nowrap", flexShrink: 0 }}
              >
                Go to Questions →
              </button>
            </div>

            {/* Questions are managed in the Questions tab; passing
                showQuestions={false} also omits customFields from the PATCH
                payload so saving Settings cannot delete them. */}
            <EditEventForm event={event} showQuestions={false} />

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem" }}>
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
