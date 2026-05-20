"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface QrScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  active?: boolean;
}

export default function QrScanner({ onScan, onError, active = true }: QrScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "active" | "error">("idle");

  useEffect(() => {
    if (!active) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
        setStatus("idle");
      }
      return;
    }

    let stopped = false;

    const startScanner = () => {
      try {
        setStatus("starting");

        if (stopped || !containerRef.current) return;

        const scanner = new Html5QrcodeScanner(
          "qr-scanner-container",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
          },
          false
        );

        scanner.render(
          (decodedText: string) => {
            onScan(decodedText);
          },
          (errorMessage: string) => {
            // Ignore continuous scanning errors (not-found frames)
          }
        );

        scannerRef.current = scanner;
        setStatus("active");
      } catch (err: any) {
        setStatus("error");
        onError?.(err.message || "Camera not available");
      }
    };

    startScanner();

    return () => {
      stopped = true;
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [active]);

  return (
    <div className="qr-scanner-wrapper">
      {status === "starting" && (
        <div className="qr-scanner-overlay">
          <div className="qr-scanner-spinner" />
          <p>Starting camera…</p>
        </div>
      )}
      {status === "error" && (
        <div className="qr-scanner-error">
          <p>⚠️ Camera unavailable. Please allow camera access.</p>
        </div>
      )}
      <div
        id="qr-scanner-container"
        ref={containerRef}
        className="qr-scanner-container"
      />
    </div>
  );
}
