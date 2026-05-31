"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Appointment {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  exhibitorName: string | null;
  industry: string | null;
  preferredDate: string;
  preferredTime: string;
  purpose: string;
  status: string;
  createdAt: string;
}

interface AttendeeMatchmakingClientProps {
  initialAppointments: Appointment[];
}

export default function AttendeeMatchmakingClient({
  initialAppointments,
}: AttendeeMatchmakingClientProps) {
  const [appointments] = useState<Appointment[]>(initialAppointments);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Notification states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [browserAlerts, setBrowserAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  // Load persisted states from localStorage
  useEffect(() => {
    const email = localStorage.getItem("match_notif_email");
    const browser = localStorage.getItem("match_notif_browser");
    const sms = localStorage.getItem("match_notif_sms");
    const digest = localStorage.getItem("match_notif_digest");

    if (email !== null) setEmailAlerts(email === "true");
    if (browser !== null) setBrowserAlerts(browser === "true");
    if (sms !== null) setSmsAlerts(sms === "true");
    if (digest !== null) setWeeklyDigest(digest === "true");
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleToggle = (key: string, value: boolean, setter: (v: boolean) => void, label: string) => {
    setter(value);
    localStorage.setItem(key, String(value));
    triggerToast(`${label} ${value ? "enabled" : "disabled"} successfully!`);
  };

  return (
    <div>
      {/* Toast Alert */}
      {showToast && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "#09090b",
          color: "#fff",
          padding: "0.85rem 1.5rem",
          borderRadius: "0.75rem",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          zIndex: 9999,
          fontSize: "0.85rem",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          animation: "slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <span>🔔</span> {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 className="page-title">🤝 Matchmaking & Appointments</h1>
          <p className="page-subtitle">
            View your global 1-on-1 requested meetings and customize status notifications.
          </p>
        </div>
        <Link href="/matchmaking" className="btn btn-primary no-print">
          + Request Appointment
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
        {/* Responsive Grid for Large Screens */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "2rem",
          alignItems: "start"
        }}>
          
          {/* COLUMN 1: Appointments List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--gray-900)", fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              My Requests ({appointments.length})
            </h3>
            
            {appointments.length === 0 ? (
              <div className="empty-state card card-body" style={{ padding: "3rem 2rem", textAlign: "center" }}>
                <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>🤝</span>
                <h3>No appointments booked</h3>
                <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                  Schedule 1-on-1 business matches with specific exhibitors or companies today.
                </p>
                <Link href="/matchmaking" className="btn btn-primary btn-sm" style={{ display: "inline-flex" }}>
                  Book an Appointment
                </Link>
              </div>
            ) : (
              appointments.map((app) => {
                const statusColor =
                  app.status === "APPROVED"
                    ? { bg: "#ecfdf5", text: "#047857", border: "rgba(16, 185, 129, 0.2)" }
                    : app.status === "REJECTED"
                    ? { bg: "#fff1f2", text: "#be123c", border: "rgba(244, 63, 94, 0.2)" }
                    : { bg: "#fef3c7", text: "#b45309", border: "rgba(245, 158, 11, 0.2)" };

                return (
                  <div
                    key={app.id}
                    className="card"
                    style={{
                      border: `1.5px solid ${statusColor.border}`,
                      borderRadius: "0.875rem",
                      overflow: "hidden",
                      transition: "transform 0.2s, box-shadow 0.2s"
                    }}
                  >
                    <div style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "0.75rem" }}>
                        <div>
                          <p style={{ fontSize: "0.78rem", color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                            Target Match
                          </p>
                          <h4 style={{ margin: "0.2rem 0 0 0", color: "var(--gray-900)", fontWeight: 800, fontSize: "1.1rem" }}>
                            {app.exhibitorName ? `Exhibitor: ${app.exhibitorName}` : `Industry: ${app.industry}`}
                          </h4>
                        </div>
                        <span
                          className="badge"
                          style={{
                            background: statusColor.bg,
                            color: statusColor.text,
                            border: `1px solid ${statusColor.border}`,
                            padding: "0.3rem 0.75rem",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            borderRadius: "9999px",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em"
                          }}
                        >
                          {app.status === "APPROVED" ? "✓ Approved" : app.status === "REJECTED" ? "✕ Rejected" : "⏳ Pending"}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: "1.25rem", margin: "1rem 0", padding: "0.85rem", background: "var(--gray-50)", borderRadius: "0.75rem", border: "1px solid var(--gray-100)", fontSize: "0.85rem" }}>
                        <div>
                          <span style={{ display: "block", fontSize: "0.7rem", color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase" }}>Preferred Date</span>
                          <strong style={{ color: "var(--gray-800)" }}>{new Date(app.preferredDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong>
                        </div>
                        <div style={{ width: "1px", background: "var(--gray-200)" }} />
                        <div>
                          <span style={{ display: "block", fontSize: "0.7rem", color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase" }}>Time Slot</span>
                          <strong style={{ color: "var(--gray-800)" }}>{app.preferredTime}</strong>
                        </div>
                      </div>

                      <div style={{ fontSize: "0.825rem", color: "var(--gray-600)", lineHeight: 1.5 }}>
                        <span style={{ fontWeight: 700, color: "var(--gray-800)", display: "block", marginBottom: "0.25rem" }}>Discussion Topic:</span>
                        {app.purpose}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* COLUMN 2: Notification Preferences */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--gray-900)", fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Preferences Settings
            </h3>

            <div className="card" style={{ padding: "1.75rem 2rem", border: "1.5px solid var(--gray-200)", borderRadius: "1rem", background: "#fff" }}>
              <div style={{ borderBottom: "1px solid var(--gray-100)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                <h4 style={{ margin: 0, color: "var(--gray-900)", fontWeight: 800, fontSize: "1.1rem" }}>
                  🔔 Alert Channels
                </h4>
                <p style={{ margin: "0.25rem 0 0 0", color: "var(--gray-400)", fontSize: "0.78rem" }}>
                  Choose how you want to be notified when booking statuses change.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                
                {/* 1. Email Updates */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontWeight: 700, color: "var(--gray-800)", fontSize: "0.875rem", cursor: "pointer" }} htmlFor="opt-email">
                      Email Notifications
                    </label>
                    <span style={{ display: "block", color: "var(--gray-400)", fontSize: "0.75rem", lineHeight: 1.4, marginTop: "0.2rem" }}>
                      Receive email alerts as soon as platform administrators approve or adjust your timeslots.
                    </span>
                  </div>
                  <label className="switch" style={{ position: "relative", display: "inline-block", width: "42px", height: "24px" }}>
                    <input
                      id="opt-email"
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => handleToggle("match_notif_email", e.target.checked, setEmailAlerts, "Email notifications")}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: emailAlerts ? "var(--brand-500)" : "var(--gray-200)",
                      borderRadius: "24px", transition: "0.3s",
                      boxShadow: emailAlerts ? "0 0 8px rgba(225, 29, 72, 0.2)" : "none"
                    }}>
                      <span style={{
                        position: "absolute", content: "''", height: "18px", width: "18px", left: emailAlerts ? "20px" : "3px", bottom: "3px",
                        backgroundColor: "white", borderRadius: "50%", transition: "0.3s"
                      }} />
                    </span>
                  </label>
                </div>

                {/* 2. Browser Notifications */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontWeight: 700, color: "var(--gray-800)", fontSize: "0.875rem", cursor: "pointer" }} htmlFor="opt-browser">
                      Browser In-App Alerts
                    </label>
                    <span style={{ display: "block", color: "var(--gray-400)", fontSize: "0.75rem", lineHeight: 1.4, marginTop: "0.2rem" }}>
                      Show real-time alert dots and counts inside your navigation bell drawer.
                    </span>
                  </div>
                  <label className="switch" style={{ position: "relative", display: "inline-block", width: "42px", height: "24px" }}>
                    <input
                      id="opt-browser"
                      type="checkbox"
                      checked={browserAlerts}
                      onChange={(e) => handleToggle("match_notif_browser", e.target.checked, setBrowserAlerts, "In-app alerts")}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: browserAlerts ? "var(--brand-500)" : "var(--gray-200)",
                      borderRadius: "24px", transition: "0.3s",
                      boxShadow: browserAlerts ? "0 0 8px rgba(225, 29, 72, 0.2)" : "none"
                    }}>
                      <span style={{
                        position: "absolute", content: "''", height: "18px", width: "18px", left: browserAlerts ? "20px" : "3px", bottom: "3px",
                        backgroundColor: "white", borderRadius: "50%", transition: "0.3s"
                      }} />
                    </span>
                  </label>
                </div>

                {/* 3. SMS Reminders */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontWeight: 700, color: "var(--gray-800)", fontSize: "0.875rem", cursor: "pointer" }} htmlFor="opt-sms">
                      SMS Reminders
                    </label>
                    <span style={{ display: "block", color: "var(--gray-400)", fontSize: "0.75rem", lineHeight: 1.4, marginTop: "0.2rem" }}>
                      Receive standard text message reminders on your phone number 1 hour before slots begin.
                    </span>
                  </div>
                  <label className="switch" style={{ position: "relative", display: "inline-block", width: "42px", height: "24px" }}>
                    <input
                      id="opt-sms"
                      type="checkbox"
                      checked={smsAlerts}
                      onChange={(e) => handleToggle("match_notif_sms", e.target.checked, setSmsAlerts, "SMS reminders")}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: smsAlerts ? "var(--brand-500)" : "var(--gray-200)",
                      borderRadius: "24px", transition: "0.3s",
                      boxShadow: smsAlerts ? "0 0 8px rgba(225, 29, 72, 0.2)" : "none"
                    }}>
                      <span style={{
                        position: "absolute", content: "''", height: "18px", width: "18px", left: smsAlerts ? "20px" : "3px", bottom: "3px",
                        backgroundColor: "white", borderRadius: "50%", transition: "0.3s"
                      }} />
                    </span>
                  </label>
                </div>

                {/* 4. Weekly Digest */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontWeight: 700, color: "var(--gray-800)", fontSize: "0.875rem", cursor: "pointer" }} htmlFor="opt-digest">
                      Weekly Recommendation Digest
                    </label>
                    <span style={{ display: "block", color: "var(--gray-400)", fontSize: "0.75rem", lineHeight: 1.4, marginTop: "0.2rem" }}>
                      Get a weekly email of trending exhibitors and matches matching your chosen industries.
                    </span>
                  </div>
                  <label className="switch" style={{ position: "relative", display: "inline-block", width: "42px", height: "24px" }}>
                    <input
                      id="opt-digest"
                      type="checkbox"
                      checked={weeklyDigest}
                      onChange={(e) => handleToggle("match_notif_digest", e.target.checked, setWeeklyDigest, "Recommendation digest")}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: weeklyDigest ? "var(--brand-500)" : "var(--gray-200)",
                      borderRadius: "24px", transition: "0.3s",
                      boxShadow: weeklyDigest ? "0 0 8px rgba(225, 29, 72, 0.2)" : "none"
                    }}>
                      <span style={{
                        position: "absolute", content: "''", height: "18px", width: "18px", left: weeklyDigest ? "20px" : "3px", bottom: "3px",
                        backgroundColor: "white", borderRadius: "50%", transition: "0.3s"
                      }} />
                    </span>
                  </label>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Dynamic Keyframes injected safely */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideIn {
          from { transform: translateY(1rem); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
}
