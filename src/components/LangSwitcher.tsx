"use client";

import { useState, useRef, useEffect } from "react";
import { useLang } from "./LangProvider";
import { LOCALES } from "@/lib/i18n";

export default function LangSwitcher() {
  const { locale, setLocale } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", zIndex: 1000 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Select language"
        style={{
          display: "inline-flex", alignItems: "center", gap: "0.35rem",
          padding: "0.35rem 0.7rem", borderRadius: "0.5rem", cursor: "pointer",
          background: "rgba(255,255,255,0.08)", border: "1px solid var(--gray-200)",
          color: "var(--gray-700)", fontSize: "0.82rem", fontWeight: 600,
          transition: "all 0.15s",
        }}
      >
        <span style={{ fontSize: "1rem" }}>{current.flag}</span>
        <span>{current.label}</span>
        <span style={{ fontSize: "0.6rem", opacity: 0.5, marginLeft: "0.15rem" }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          minWidth: 150, background: "#fff", border: "1px solid var(--gray-200)",
          borderRadius: "0.6rem", boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          overflow: "hidden", animation: "fadeIn 0.12s ease",
        }}>
          {LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => { setLocale(l.code); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                width: "100%", padding: "0.65rem 1rem", border: "none",
                background: l.code === locale ? "var(--brand-50)" : "transparent",
                color: l.code === locale ? "var(--brand-700)" : "var(--gray-700)",
                fontWeight: l.code === locale ? 700 : 500,
                fontSize: "0.875rem", cursor: "pointer", textAlign: "left",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = l.code === locale ? "var(--brand-50)" : "var(--gray-50)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = l.code === locale ? "var(--brand-50)" : "transparent")}
            >
              <span style={{ fontSize: "1.15rem" }}>{l.flag}</span>
              <span>{l.label}</span>
              {l.code === locale && <span style={{ marginLeft: "auto", fontSize: "0.8rem" }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
