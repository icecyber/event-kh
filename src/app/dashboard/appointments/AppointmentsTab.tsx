"use client";

import { useState, useEffect } from "react";

interface Appointment {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  exhibitorName?: string | null;
  industry?: string | null;
  preferredDate: string;
  preferredTime: string;
  purpose: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function AppointmentsTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/appointments");
      if (!res.ok) {
        throw new Error("Failed to load global appointments.");
      }
      const data = await res.json();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while loading appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (appId: string, newStatus: "APPROVED" | "REJECTED") => {
    setUpdatingId(appId);
    try {
      const res = await fetch(`/api/appointments/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update appointment status.");
      }

      // Update local state
      setAppointments((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResetToPending = async (appId: string) => {
    setUpdatingId(appId);
    try {
      const res = await fetch(`/api/appointments/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PENDING" }),
      });

      if (!res.ok) {
        throw new Error("Failed to reset appointment status.");
      }

      setAppointments((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: "PENDING" } : app))
      );
    } catch (err: any) {
      alert(err.message || "Failed to reset status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const fmtDate = (dStr: string) => {
    return new Date(dStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="skeleton skeleton-heading" />
        <div className="skeleton skeleton-stat" style={{ height: "150px" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error" style={{ margin: "1rem 0" }}>
        ❌ {error}
        <button onClick={fetchAppointments} className="btn btn-sm btn-ghost" style={{ marginLeft: "1rem" }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", color: "var(--gray-900)", margin: 0, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            🤝 Global Matchmaking & Appointments
          </h2>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", margin: "0.25rem 0 0 0" }}>
            Review, approve, and organize site-wide business matchmaking requests globally.
          </p>
        </div>
        <button onClick={fetchAppointments} className="btn btn-secondary btn-sm">
          🔄 Refresh
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="card empty-state" style={{ padding: "4.5rem 2rem", background: "#fff", border: "1px solid var(--gray-200)", borderRadius: "1rem" }}>
          <div className="empty-state-icon" style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🤝</div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--gray-700)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            No appointments requested yet
          </h3>
          <p style={{ color: "var(--gray-400)", fontSize: "0.875rem", maxWidth: "420px", margin: "0.5rem auto 0 auto", lineHeight: 1.5 }}>
            As soon as users apply for global 1-on-1 scheduled appointments on the public matchmaking page, they will appear here.
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Target Partner</th>
                <th>Preferred Time Slot</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((app) => {
                const isExpanded = expandedId === app.id;
                const isUpdating = updatingId === app.id;

                return (
                  <tr key={app.id} style={{ transition: "background 0.15s" }}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 700, color: "var(--gray-900)" }}>{app.fullName}</span>
                        <span style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{app.email} · {app.phone}</span>
                      </div>
                    </td>
                    <td>
                      {app.exhibitorName ? (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span className="badge badge-purple" style={{ width: "fit-content" }}>🏢 Exhibitor</span>
                          <span style={{ fontWeight: 600, color: "var(--gray-800)", marginTop: "0.2rem" }}>
                            {app.exhibitorName}
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span className="badge badge-sky" style={{ width: "fit-content" }}>🌐 Industry</span>
                          <span style={{ fontWeight: 600, color: "var(--gray-800)", marginTop: "0.2rem" }}>
                            {app.industry}
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 600, color: "var(--gray-800)" }}>{fmtDate(app.preferredDate)}</span>
                        <span style={{ fontSize: "0.78rem", color: "var(--gray-500)", marginTop: "0.1rem" }}>
                          {app.preferredTime}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          app.status === "APPROVED"
                            ? "badge-green"
                            : app.status === "REJECTED"
                            ? "badge-red"
                            : "badge-yellow"
                        }`}
                        style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem" }}
                      >
                        {app.status === "APPROVED" && "✅ Approved"}
                        {app.status === "REJECTED" && "❌ Rejected"}
                        {app.status === "PENDING" && "⏳ Pending"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem" }}>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : app.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                        >
                          {isExpanded ? "👁️ Hide Details" : "👁️ View Purpose"}
                        </button>

                        {app.status === "PENDING" && (
                          <>
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(app.id, "APPROVED")}
                              className="btn btn-success btn-sm"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", background: "var(--emerald)", color: "#fff" }}
                            >
                              Approve
                            </button>
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(app.id, "REJECTED")}
                              className="btn btn-danger btn-sm"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", background: "var(--coral)", color: "#fff" }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {app.status !== "PENDING" && (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleResetToPending(app.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", color: "var(--gray-400)" }}
                          >
                            Reset to Pending
                          </button>
                        )}
                      </div>

                      {/* Expandable Purpose panel */}
                      {isExpanded && (
                        <div
                          style={{
                            gridColumn: "span 5",
                            marginTop: "0.75rem",
                            padding: "0.875rem 1.25rem",
                            background: "var(--gray-50)",
                            border: "1px solid var(--gray-200)",
                            borderRadius: "0.5rem",
                            fontSize: "0.875rem",
                            color: "var(--gray-700)",
                            textAlign: "left",
                            lineHeight: 1.5,
                            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
                          }}
                        >
                          <strong style={{ color: "var(--gray-900)" }}>Meeting Purpose & Objectives:</strong>
                          <p style={{ margin: "0.35rem 0 0 0", whiteSpace: "pre-wrap", color: "var(--gray-600)" }}>
                            {app.purpose}
                          </p>
                          <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "0.75rem" }}>
                            Requested on: {new Date(app.createdAt).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
