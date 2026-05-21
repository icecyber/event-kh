"use client";

import { useState, useEffect, useCallback } from "react";

interface Participant {
  id: string;
  status: string;
  registrationDate: string;
  checkedInAt?: string | null;
  badgeIssuedAt?: string | null;
  qrCodeString?: string | null;
  attendee?: { id: string; name: string; email: string } | null;
  guestName?: string | null;
  guestPhone?: string | null;
  guestEmail?: string | null;
  ticketType: { name: string };
  customAnswers: { fieldName: string; answerValue: string }[];
}

export default function ParticipantsTab({
  eventId,
}: {
  eventId: string;
}) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [undoingId, setUndoingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [printingId, setPrintingId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/events/${eventId}/registrations?search=${encodeURIComponent(debouncedSearch)}`;
      const res = await fetch(url);
      const data = await res.json();
      setParticipants(data.registrations ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [eventId, debouncedSearch]);

  useEffect(() => { fetchParticipants(); }, [fetchParticipants]);

  const handleRedeem = async (reg: Participant) => {
    if (!reg.qrCodeString) return;
    setRedeemingId(reg.id);
    try {
      await fetch(`/api/events/${eventId}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCodeString: reg.qrCodeString }),
      });
      await fetchParticipants();
    } finally {
      setRedeemingId(null);
    }
  };

  const handleUndoCheckin = async (reg: Participant) => {
    if (!confirm(`Undo check-in for ${reg.attendee?.name || reg.guestName || "this participant"}?`)) return;
    setUndoingId(reg.id);
    try {
      const res = await fetch(`/api/events/${eventId}/registrations/${reg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "undo-checkin" }),
      });
      if (!res.ok) { alert("Undo failed"); return; }
      await fetchParticipants();
    } finally {
      setUndoingId(null);
    }
  };

  const handleDownloadBadge = async (reg: Participant) => {
    const res = await fetch(`/api/events/${eventId}/registrations/${reg.id}/badge`);
    if (!res.ok) { alert("Failed to generate badge"); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const name = reg.attendee?.name || reg.guestName || "Guest";
    a.download = `badge-${name.replace(/[^a-z0-9]/gi, "_")}.png`;
    a.click();
    URL.revokeObjectURL(url);
    await fetchParticipants();
  };

  const handlePrintBadge = async (reg: Participant) => {
    setPrintingId(reg.id);
    try {
      const res = await fetch(`/api/events/${eventId}/registrations/${reg.id}/badge`);
      if (!res.ok) { alert("Failed to generate badge"); return; }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const name = reg.attendee?.name || reg.guestName || "Guest";

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Badge - ${name}</title>
              <style>
                @page { size: auto; margin: 0; }
                body {
                  margin: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  background: white;
                }
                img {
                  max-width: 100%;
                  max-height: 100%;
                  object-fit: contain;
                }
              </style>
            </head>
            <body>
              <img src="${blobUrl}" onload="window.print(); window.close();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } finally {
      setPrintingId(null);
    }
  };

  const handleDelete = async (reg: Participant) => {
    if (!confirm(`Remove ${reg.attendee?.name || reg.guestName || "this participant"}? This cannot be undone.`)) return;
    setDeletingId(reg.id);
    try {
      const res = await fetch(`/api/events/${eventId}/registrations/${reg.id}`, { method: "DELETE" });
      if (!res.ok) { alert("Delete failed"); return; }
      await fetchParticipants();
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    window.open(`/api/events/${eventId}/export`, "_blank");
  };

  const handlePrintList = () => window.print();

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }} className="no-print">
        <div className="search-bar" style={{ flex: 1, minWidth: 220 }}>
          <span style={{ color: "var(--gray-400)" }}>🔍</span>
          <input
            id="participant-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
          />
        </div>
        <button id="export-csv-btn" className="btn btn-secondary" onClick={handleExportCSV}>⬇️ Export CSV</button>
        <button id="print-participants-btn" className="btn btn-secondary" onClick={handlePrintList}>🖨️ Print List</button>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <span className="badge badge-blue" style={{ fontSize: "0.875rem", padding: "0.35rem 0.85rem" }}>
          {total} total
        </span>
        <span className="badge badge-green" style={{ fontSize: "0.875rem", padding: "0.35rem 0.85rem" }}>
          {participants.filter((p) => p.checkedInAt).length} checked in
        </span>
        <span className="badge badge-gray" style={{ fontSize: "0.875rem", padding: "0.35rem 0.85rem" }}>
          {participants.filter((p) => !p.checkedInAt).length} pending
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--gray-400)" }}>
          <span className="spinner spinner-dark" style={{ width: 28, height: 28 }} />
        </div>
      ) : participants.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">{debouncedSearch ? "🔍" : "👥"}</div>
          <h3>{debouncedSearch ? "No results found" : "No participants yet"}</h3>
          <p>{debouncedSearch ? "Try a different search term." : "Share the event link to start receiving registrations."}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table id="participants-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email / Phone</th>
                <th>Ticket</th>
                <th>Registered</th>
                <th>Status</th>
                <th className="no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p, idx) => {
                const name = p.attendee?.name || p.guestName || "Guest Attendee";
                const contact = p.attendee?.email || p.guestEmail || (p.guestPhone ? `📞 ${p.guestPhone}` : "-");

                return (
                  <tr key={p.id}>
                    <td style={{ color: "var(--gray-400)", fontWeight: 500 }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: "var(--gray-900)" }}>{name}</td>
                    <td style={{ color: "var(--gray-500)" }}>{contact}</td>
                    <td><span className="badge badge-purple">{p.ticketType.name}</span></td>
                    <td style={{ color: "var(--gray-500)", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                      {new Date(p.registrationDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td>
                      {p.checkedInAt ? (
                        <div>
                          <span className="badge badge-green">✅ Checked In</span>
                          <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: 2 }}>
                            {new Date(p.checkedInAt).toLocaleTimeString()}
                          </div>
                        </div>
                      ) : (
                        <span className="badge badge-blue">🎟️ Registered</span>
                      )}
                    </td>
                    <td className="no-print">
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        {!p.checkedInAt ? (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleRedeem(p)}
                            disabled={redeemingId === p.id}
                            title="Check in"
                          >
                            {redeemingId === p.id ? <span className="spinner" /> : "✅ Redeem"}
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleUndoCheckin(p)}
                            disabled={undoingId === p.id}
                            title="Undo check-in"
                            style={{ color: "var(--amber-400)", borderColor: "var(--amber-400)" }}
                          >
                            {undoingId === p.id ? <span className="spinner spinner-dark" /> : "↩️ Undo"}
                          </button>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handlePrintBadge(p)}
                          disabled={printingId === p.id}
                          title="Print badge"
                        >
                          {printingId === p.id ? <span className="spinner spinner-dark" /> : "🖨️"}
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDownloadBadge(p)}
                          title="Download badge"
                        >
                          🎫
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(p)}
                          disabled={deletingId === p.id}
                          title="Delete registration"
                        >
                          {deletingId === p.id ? <span className="spinner" /> : "🗑️"}
                        </button>
                      </div>
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
