import { NextResponse } from "next/server";

// Module-level in-memory cache to prevent redundant external API hits and avoid rate limiting.
const translationCache = new Map<string, string>();

export async function POST(req: Request) {
  try {
    const { text, target } = await req.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ translatedText: "" });
    }

    if (!target || typeof target !== "string") {
      return NextResponse.json({ error: "Missing target language" }, { status: 400 });
    }

    // If target language is english, assume the source was English and return original text
    if (target.toLowerCase() === "en") {
      return NextResponse.json({ translatedText: text });
    }

    const cacheKey = `${text.trim()}:${target.toLowerCase()}`;
    if (translationCache.has(cacheKey)) {
      return NextResponse.json({ translatedText: translationCache.get(cacheKey) });
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target.toLowerCase()}&dt=t&q=${encodeURIComponent(text)}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      // Next.js caching behaviour
      next: { revalidate: 86400 }, // Cache on server-side Next fetch for 1 day
    });

    if (!res.ok) {
      throw new Error(`Google Translate responded with status ${res.status}`);
    }

    const data = await res.json();

    if (data && data[0] && Array.isArray(data[0])) {
      const translatedText = data[0]
        .filter((item: any) => item && typeof item[0] === "string")
        .map((item: any) => item[0])
        .join("");

      if (translatedText) {
        translationCache.set(cacheKey, translatedText);
        return NextResponse.json({ translatedText });
      }
    }

    // Fallback if structure is unexpected
    return NextResponse.json({ translatedText: text });
  } catch (error: any) {
    console.error("Translation proxy error:", error);
    // Fall back to original text gracefully on error, never crash the app
    try {
      const { text } = await req.clone().json();
      return NextResponse.json({ translatedText: text || "", error: error.message });
    } catch {
      return NextResponse.json({ error: "Failed to translate" }, { status: 500 });
    }
  }
}
