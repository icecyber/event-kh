"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  active?: boolean;
}

export default function QrScanner({ onScan, onError, active = true }: QrScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "active" | "error">("idle");

  useEffect(() => {
    if (!active) {
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        scannerRef.current = null;
        if (scanner.isScanning) {
          scanner.stop()
            .then(() => {
              scanner.clear();
            })
            .catch(() => {});
        }
        setStatus("idle");
      }
      return;
    }

    let isMounted = true;
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        setStatus("starting");
        
        // Brief timeout to ensure the container element is fully rendered and sized
        await new Promise((resolve) => setTimeout(resolve, 150));
        
        if (!isMounted || !containerRef.current) return;

        html5QrCode = new Html5Qrcode("qr-scanner-container");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText: string) => {
            if (isMounted) {
              onScan(decodedText);
            }
          },
          () => {
            // Ignore verbose scanning noise/errors
          }
        );

        if (isMounted) {
          setStatus("active");
        } else {
          if (html5QrCode.isScanning) {
            html5QrCode.stop()
              .then(() => {
                html5QrCode?.clear();
              })
              .catch(() => {});
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus("error");
          onError?.(err?.message || err || "Camera not available");
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        scannerRef.current = null;
        if (scanner.isScanning) {
          scanner.stop()
            .then(() => {
              scanner.clear();
            })
            .catch(() => {});
        }
      }
    };
  }, [active, onScan, onError]);

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
      
      {status === "active" && (
        <div className="qr-scanner-viewfinder">
          <div className="qr-scanner-viewfinder-box">
            <div className="viewfinder-corner viewfinder-corner-tl" />
            <div className="viewfinder-corner viewfinder-corner-tr" />
            <div className="viewfinder-corner viewfinder-corner-bl" />
            <div className="viewfinder-corner viewfinder-corner-br" />
            <div className="viewfinder-laser" />
          </div>
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

