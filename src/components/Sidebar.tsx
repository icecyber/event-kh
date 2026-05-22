"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface SidebarProps {
  userName: string | null | undefined;
  userEmail: string | null | undefined;
  role: "ORGANIZER" | "ATTENDEE" | string;
  currentEventTitle?: string | null;
}

export default function Sidebar({
  userName,
  userEmail,
  role,
  currentEventTitle,
}: SidebarProps) {
  const pathname = usePathname();
  const isOrganizer = role === "ORGANIZER";

  const getLinkClass = (href: string) => {
    return pathname === href ? "dash-sidebar-link active" : "dash-sidebar-link";
  };

  return (
    <aside className="dash-sidebar no-print">
      {/* User profile header with solid contrast */}
      <div style={{
        marginBottom: "2rem",
        padding: "0.875rem",
        background: "var(--gray-50)",
        borderRadius: "0.875rem",
        border: "1px solid var(--gray-200)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.5rem" }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "var(--blue-600)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "0.85rem",
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontSize: "0.7rem", color: "var(--blue-600)",
              fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              {isOrganizer ? "Organizer" : "Attendee"}
            </p>
            <p style={{
              color: "var(--gray-900)", fontWeight: 700,
              fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>
              {userName || "User"}
            </p>
          </div>
        </div>
        <p style={{
          color: "var(--gray-400)", fontSize: "0.75rem",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
        }}>
          {userEmail}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <p className="dash-sidebar-section">Main Menu</p>
        
        {isOrganizer ? (
          <>
            <Link href="/dashboard" className={getLinkClass("/dashboard")}>
              <span className="dash-sidebar-icon">📊</span> Overview
            </Link>
            <Link href="/dashboard/events" className={getLinkClass("/dashboard/events")}>
              <span className="dash-sidebar-icon">📅</span> My Events
            </Link>
            <Link href="/dashboard/events/new" className={getLinkClass("/dashboard/events/new")}>
              <span className="dash-sidebar-icon">➕</span> Create Event
            </Link>
          </>
        ) : (
          <>
            <Link href="/dashboard" className={getLinkClass("/dashboard")}>
              <span className="dash-sidebar-icon">🎟️</span> My Tickets
            </Link>
            <Link href="/events" className={getLinkClass("/events")}>
              <span className="dash-sidebar-icon">🔍</span> Browse Events
            </Link>
          </>
        )}
      </div>

      {currentEventTitle && (
        <div style={{
          marginTop: "1.75rem",
          padding: "1rem 0.875rem",
          background: "var(--blue-50)",
          border: "1px solid var(--blue-100)",
          borderRadius: "0.875rem"
        }}>
          <p style={{
            fontSize: "0.7rem", color: "var(--blue-700)",
            fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
            marginBottom: "0.4rem"
          }}>
            📍 Active Event
          </p>
          <p style={{
            color: "var(--blue-900)", fontWeight: 700,
            fontSize: "0.825rem", lineHeight: 1.4,
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            {currentEventTitle}
          </p>
        </div>
      )}

      <div style={{ marginTop: "auto", paddingTop: "2rem" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="dash-sidebar-link"
          style={{
            background: "none", border: "none", cursor: "pointer",
            width: "100%", textAlign: "left", color: "var(--gray-500)",
            display: "flex", alignItems: "center", gap: "0.7rem"
          }}
        >
          <span className="dash-sidebar-icon">🚪</span> Sign out
        </button>
      </div>
    </aside>
  );
}
