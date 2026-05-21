"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useLang } from "./LangProvider";
import LangSwitcher from "./LangSwitcher";

export default function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isOnDash = pathname?.startsWith("/dashboard");
  const { t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <header className="nav-bar">
      {/* Logo */}
      <Link href="/" className="nav-logo">
        <div className="nav-logo-icon">⚡</div>
        EventKH
      </Link>

      {/* Mobile toggle */}
      <button
        className="nav-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <nav className={`nav-links${menuOpen ? " open" : ""}`}>
        {!isOnDash && (
          <Link
            href="/events"
            className="btn btn-ghost"
            style={pathname === "/events"
              ? { background: "var(--blue-50)", color: "var(--blue-700)", fontWeight: 700 }
              : {}}
          >
            📅 {t("nav.browseEvents")}
          </Link>
        )}

        {session ? (
          <>
            <Link
              href="/dashboard"
              className="btn btn-ghost"
              style={isOnDash
                ? { background: "var(--blue-50)", color: "var(--blue-700)", fontWeight: 700 }
                : {}}
            >
              📊 {t("nav.dashboard")}
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="btn btn-secondary btn-sm"
            >
              👋 {t("nav.signOut")}
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="btn btn-ghost"
              style={pathname === "/login"
                ? { background: "var(--blue-50)", color: "var(--blue-700)", fontWeight: 700 }
                : {}}
            >
              {t("nav.logIn")}
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              🚀 {t("nav.signUp")}
            </Link>
          </>
        )}

        <LangSwitcher />
      </nav>
    </header>
  );
}
