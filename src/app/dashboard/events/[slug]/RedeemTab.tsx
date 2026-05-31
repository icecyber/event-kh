"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

const QrScanner = dynamic(() => import("@/components/QrScanner"), { ssr: false });

interface ScanResult {
  type: "success" | "error" | "already";
  message: string;
  attendee?: { name: string; email: string };
  ticketType?: { name: string };
  checkedInAt?: string;
}

export default function RedeemTab({ eventId }: { eventId: string }) {
  const [scannerActive, setScannerActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  
  // Lookup Modal States
  const [activeRegistration, setActiveRegistration] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const lastScanned = useRef<string>("");

  useEffect(() => {
    // Preload the QrScanner chunk in the background so it starts instantly when clicked
    import("@/components/QrScanner").catch(() => {});
  }, []);

  const handleRedeem = useCallback(
    async (qrCodeString: string) => {
      if (scanning) return;
      if (qrCodeString === lastScanned.current) return;
      lastScanned.current = qrCodeString;
      setScanning(true);
      setResult(null);

      try {
        // Perform a lookup-only request first to pull registration details
        const res = await fetch(`/api/events/${eventId}/redeem`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrCodeString, lookupOnly: true }),
        });
        const data = await res.json();

        if (!res.ok) {
          setResult({ type: "error", message: data.error || "Ticket not found" });
          lastScanned.current = ""; // Reset on error so they can re-try same code if corrected
        } else {
          setActiveRegistration(data);
          setModalOpen(true);
        }
      } catch {
        setResult({ type: "error", message: "Network error. Please try again." });
        lastScanned.current = "";
      } finally {
        setScanning(false);
      }
    },
    [eventId, scanning]
  );

  const confirmRedeem = async () => {
    if (!activeRegistration || redeeming) return;
    setRedeeming(true);
    try {
      const res = await fetch(`/api/events/${eventId}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCodeString: activeRegistration.qrCodeString }),
      });
      const data = await res.json();

      if (res.status === 409) {
        // Already checked in
        setActiveRegistration({
          ...activeRegistration,
          checkedInAt: data.checkedInAt || new Date().toISOString(),
        });
        setResult({
          type: "already",
          message: "Already checked in",
          attendee: data.attendee,
          checkedInAt: data.checkedInAt,
        });
      } else if (!res.ok) {
        alert(data.error || "Redemption failed");
      } else {
        // Successful check-in
        setActiveRegistration({
          ...activeRegistration,
          checkedInAt: data.checkedInAt || new Date().toISOString(),
        });
        setResult({
          type: "success",
          message: "✅ Checked in successfully!",
          attendee: data.attendee,
          ticketType: data.ticketType,
        });
        // Clear result after 5s
        setTimeout(() => {
          setResult(null);
        }, 5000);
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setRedeeming(false);
      // Reset scan cache delay
      setTimeout(() => {
        lastScanned.current = "";
      }, 2000);
    }
  };

  const handlePrintBadge = async () => {
    if (!activeRegistration) return;
    try {
      const res = await fetch(`/api/events/${eventId}/registrations/${activeRegistration.id}/badge`);
      if (!res.ok) throw new Error("Failed to generate badge");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        const name = activeRegistration.attendee?.name || activeRegistration.guestName || "Guest Attendee";
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
    } catch {
      alert("Failed to print badge. Please try again.");
    }
  };

  const handleManualRedeem = async () => {
    if (!manualCode.trim()) return;
    setManualLoading(true);
    await handleRedeem(manualCode.trim());
    setManualCode("");
    setManualLoading(false);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>
      {/* Scanner */}
      <div className="card card-body">
        <h3 style={{ marginBottom: "1rem", color: "var(--gray-900)" }}>📷 QR Code Scanner</h3>
        <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          Point the camera at an attendee&apos;s QR code to look them up and redeem tickets.
        </p>

        {!scannerActive ? (
          <button
            id="start-scanner"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => { setScannerActive(true); setResult(null); lastScanned.current = ""; }}
          >
            📷 Start Camera Scanner
          </button>
        ) : (
          <>
            <QrScanner
              active={scannerActive}
              onScan={handleRedeem}
              onError={(e) => setResult({ type: "error", message: e })}
            />
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: "0.75rem", width: "100%" }}
              onClick={() => { setScannerActive(false); setResult(null); lastScanned.current = ""; }}
            >
              Stop Scanner
            </button>
          </>
        )}
      </div>

      {/* Right panel: result + manual */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Scan result */}
        {result ? (
          <div className={`card card-body ${result.type === "success" ? "alert-success" : result.type === "already" ? "alert-warning" : "alert-error"}`}
            style={{ border: "none" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
              {result.type === "success" ? "✅" : result.type === "already" ? "⚠️" : "❌"}
            </div>
            <h4 style={{ marginBottom: "0.5rem" }}>{result.message}</h4>
            {result.attendee && (
              <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.9rem" }}>
                <p><strong>{result.attendee.name}</strong></p>
                <p style={{ opacity: 0.8 }}>{result.attendee.email}</p>
                {result.ticketType && <p>🎫 {result.ticketType.name}</p>}
                {result.checkedInAt && (
                  <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                    Checked in at: {new Date(result.checkedInAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="card card-body" style={{ textAlign: "center", color: "var(--gray-400)", padding: "3rem 1.5rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📲</div>
            <p>Scan a QR code or enter a code manually to look up and redeem an attendee.</p>
          </div>
        )}

        {/* Manual entry */}
        <div className="card card-body">
          <h4 style={{ marginBottom: "0.75rem", color: "var(--gray-700)" }}>Manual Code Entry</h4>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              id="manual-qr-input"
              className="form-input"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualRedeem()}
              placeholder="Paste QR code string…"
            />
            <button
              className="btn btn-primary"
              onClick={handleManualRedeem}
              disabled={!manualCode.trim() || manualLoading}
            >
              {manualLoading ? <span className="spinner" /> : "Redeem"}
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Lookup Dialog Popup */}
      {modalOpen && activeRegistration && (
        <div className="modal-backdrop" style={{ display: "flex" }}>
          <div className="modal" style={{ maxWidth: "520px", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--gray-100)", paddingBottom: "0.75rem" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: 0, fontSize: "1.25rem", color: "var(--gray-900)" }}>
                🎟️ Ticket Registration Lookup
              </h3>
              <button
                style={{ background: "none", border: "none", fontSize: "1.5rem", color: "var(--gray-400)", cursor: "pointer", display: "flex", alignItems: "center", padding: "0 0.25rem" }}
                onClick={() => { setModalOpen(false); setActiveRegistration(null); }}
              >
                &times;
              </button>
            </div>

            {/* Status Indicator */}
            {activeRegistration.checkedInAt ? (
              <div style={{
                background: "#fef2f2",
                color: "#991b1b",
                borderRadius: "0.75rem",
                padding: "0.75rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                border: "1px solid #fee2e2"
              }}>
                <span style={{ fontSize: "1.25rem" }}>⚠️</span>
                <div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700 }}>Already Checked In</div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 400, opacity: 0.9, marginTop: "0.15rem" }}>
                    Redeemed on: {new Date(activeRegistration.checkedInAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                background: "#ecfdf5",
                color: "#065f46",
                borderRadius: "0.75rem",
                padding: "0.75rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                border: "1px solid #d1fae5"
              }}>
                <span style={{ fontSize: "1.25rem" }}>✅</span>
                <div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700 }}>Ready to Redeem</div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 400, opacity: 0.9, marginTop: "0.15rem" }}>
                    This ticket is valid and can be checked in.
                  </div>
                </div>
              </div>
            )}

            {/* Registration Details Card */}
            <div style={{
              background: "var(--gray-50)",
              borderRadius: "0.75rem",
              padding: "1.25rem",
              border: "1.5px dashed var(--gray-200)",
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem"
            }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Attendee Name
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--gray-900)", marginTop: "0.25rem" }}>
                  {activeRegistration.attendee?.name || activeRegistration.guestName || "Guest Attendee"}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", borderTop: "1px solid var(--gray-100)", paddingTop: "0.75rem" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Contact Details
                  </div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", marginTop: "0.15rem", wordBreak: "break-all" }}>
                    {activeRegistration.attendee?.email || activeRegistration.guestEmail || activeRegistration.guestPhone || "No contact info"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Ticket Option
                  </div>
                  <div style={{ marginTop: "0.25rem" }}>
                    <span className="badge badge-purple" style={{ fontSize: "0.8rem", padding: "0.25rem 0.65rem", display: "inline-block" }}>
                      🎟️ {activeRegistration.ticketType?.name || "Standard Ticket"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              borderTop: "1px solid var(--gray-100)",
              paddingTop: "1rem"
            }}>
              <button
                className="btn btn-secondary"
                onClick={() => { setModalOpen(false); setActiveRegistration(null); }}
                style={{ minWidth: "80px" }}
              >
                Close
              </button>

              <button
                className="btn btn-primary"
                onClick={handlePrintBadge}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  background: "linear-gradient(135deg, var(--violet-600), var(--brand-600))",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)"
                }}
              >
                🖨️ Print Badge
              </button>

              {!activeRegistration.checkedInAt && (
                <button
                  className="btn btn-primary"
                  onClick={confirmRedeem}
                  disabled={redeeming}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    background: "var(--emerald-600)",
                    borderColor: "var(--emerald-600)",
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)"
                  }}
                >
                  {redeeming ? <span className="spinner" /> : "✅ Confirm Check-In"}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
