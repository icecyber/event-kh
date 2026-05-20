"use client";

import { useState } from "react";

interface BadgeDownloadProps {
  eventId: string;
  regId: string;
  attendeeName: string;
}

export default function BadgeDownloadButton({ eventId, regId, attendeeName }: BadgeDownloadProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/registrations/${regId}/badge`);
      if (!res.ok) throw new Error("Failed to generate badge");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `badge-${attendeeName.replace(/[^a-z0-9]/gi, "_")}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch {
      alert("Failed to download badge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      id="download-badge-btn"
      className={`btn ${done ? "btn-success" : "btn-primary"} btn-lg`}
      style={{ width: "100%", justifyContent: "center" }}
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? (
        <><span className="spinner" /> Generating badge…</>
      ) : done ? (
        "✅ Badge Downloaded!"
      ) : (
        "⬇️ Download Badge (.png)"
      )}
    </button>
  );
}
