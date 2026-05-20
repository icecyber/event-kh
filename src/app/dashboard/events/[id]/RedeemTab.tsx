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
  const lastScanned = useRef<string>("");

  useEffect(() => {
    // Preload the QrScanner chunk in the background so it starts instantly when clicked
    import("@/components/QrScanner").catch(() => {});
  }, []);

  const handleRedeem = useCallback(
    async (qrCodeString: string) => {
      if (qrCodeString === lastScanned.current) return;
      lastScanned.current = qrCodeString;
      setScanning(true);
      setResult(null);

      try {
        const res = await fetch(`/api/events/${eventId}/redeem`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrCodeString }),
        });
        const data = await res.json();

        if (res.status === 409) {
          setResult({
            type: "already",
            message: "Already checked in",
            attendee: data.attendee,
            checkedInAt: data.checkedInAt,
          });
        } else if (!res.ok) {
          setResult({ type: "error", message: data.error || "Redemption failed" });
        } else {
          setResult({
            type: "success",
            message: "✅ Checked in successfully!",
            attendee: data.attendee,
            ticketType: data.ticketType,
          });
          // Reset after 3s for next scan
          setTimeout(() => {
            setResult(null);
            lastScanned.current = "";
          }, 4000);
        }
      } catch {
        setResult({ type: "error", message: "Network error. Please try again." });
      } finally {
        setScanning(false);
      }
    },
    [eventId]
  );

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
          Point the camera at an attendee&apos;s QR code to check them in.
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
              active={scannerActive && !scanning}
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
            <p>Scan a QR code or enter a code manually to check in an attendee.</p>
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
    </div>
  );
}
