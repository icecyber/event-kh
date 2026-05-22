"use client";

import React, { useState, useEffect } from "react";
import { useLang } from "@/components/LangProvider";

// Global, client-side in-memory registry to ensure we NEVER translate the same string twice
// during a single user session, providing instantaneous back-and-forth language switches.
const clientTranslationCache = new Map<string, string>();

interface TranslateTextProps {
  text?: string | null;
  showLabel?: boolean; // Toggles the "Translated from..." interactive toggle badge beneath
  className?: string;
  style?: React.CSSProperties;
  as?: keyof React.JSX.IntrinsicElements; // Customizable wrapper element e.g. "p", "span", "div"
}

export default function TranslateText({
  text,
  showLabel = false,
  className = "",
  style = {},
  as: Component = "span",
}: TranslateTextProps) {
  const { locale } = useLang();
  const [translated, setTranslated] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [error, setError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const originalText = text || "";

  useEffect(() => {
    // Reset toggle when text or target language changes
    setShowOriginal(false);

    if (!originalText.trim()) {
      setTranslated("");
      setLoading(false);
      return;
    }

    if (locale === "en") {
      setTranslated(originalText);
      setLoading(false);
      return;
    }

    const cacheKey = `${originalText.trim()}:${locale}`;
    if (clientTranslationCache.has(cacheKey)) {
      setTranslated(clientTranslationCache.get(cacheKey) || "");
      setLoading(false);
      return;
    }

    // Trigger API fetch for new string
    let active = true;
    const fetchTranslation = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: originalText, target: locale }),
        });

        if (!res.ok) {
          throw new Error("Translation failed");
        }

        const data = await res.json();
        if (active) {
          const result = data.translatedText || originalText;
          clientTranslationCache.set(cacheKey, result);
          setTranslated(result);
        }
      } catch (err) {
        console.error("Error fetching translation:", err);
        if (active) {
          setError(true);
          setTranslated(originalText);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchTranslation();

    return () => {
      active = false;
    };
  }, [originalText, locale]);

  // If text is empty, don't render anything
  if (!originalText.trim()) return null;

  // English or same language renders raw content
  if (locale === "en") {
    return <Component className={className} style={style}>{originalText}</Component>;
  }

  // Pulse skeleton state during translation API call
  if (loading) {
    const isShort = originalText.length < 15;
    return (
      <span
        className={isShort ? "translate-skeleton-inline" : "translate-skeleton"}
        style={{
          display: "inline-block",
          width: isShort ? "60px" : "100%",
          maxWidth: isShort ? undefined : "100%",
          ...style,
        }}
      />
    );
  }

  const displayText = showOriginal || error ? originalText : translated;

  // If label details aren't requested, render standard container
  if (!showLabel) {
    return <Component className={className} style={style}>{displayText}</Component>;
  }

  // Multilingual label configuration
  const labelText = showOriginal
    ? locale === "km"
      ? "បង្ហាញការបកប្រែ"
      : "显示翻译"
    : locale === "km"
      ? "បកប្រែពីភាសាអង់គ្លេស · បង្ហាញច្បាប់ដើម"
      : "翻译自英语 · 显示原文";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <Component className={className} style={style}>{displayText}</Component>
      {!error && (
        <div
          style={{
            marginTop: "0.4rem",
            display: "flex",
            alignItems: "center",
            fontSize: "0.75rem",
            color: hovered ? "var(--blue-600)" : "var(--gray-400)",
            userSelect: "none",
            transition: "color 0.2s ease",
          }}
        >
          <span
            style={{
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              fontWeight: 500,
            }}
            onClick={() => setShowOriginal(!showOriginal)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <span>🌐</span>
            <span>{labelText}</span>
          </span>
        </div>
      )}
    </div>
  );
}
