"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileDashNavProps {
  role: "ADMIN" | "ORGANIZER" | "ATTENDEE" | string;
  userName?: string | null;
}

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

// Mirrors the link sets in Sidebar.tsx so desktop and mobile nav stay in sync.
const NAV_ITEMS: Record<string, NavItem[]> = {
  ADMIN: [
    { href: "/dashboard", icon: "📊", label: "Stats" },
    { href: "/dashboard/events", icon: "📅", label: "Events" },
    { href: "/dashboard/appointments", icon: "🤝", label: "Matching" },
  ],
  ORGANIZER: [
    { href: "/dashboard", icon: "📊", label: "Overview" },
    { href: "/dashboard/events", icon: "📅", label: "My Events" },
    { href: "/dashboard/events/new", icon: "➕", label: "Create" },
  ],
  ATTENDEE: [
    { href: "/dashboard", icon: "🎟️", label: "Tickets" },
    { href: "/dashboard/matchmaking", icon: "🤝", label: "Matching" },
    { href: "/events", icon: "🔍", label: "Browse" },
  ],
};

export default function MobileDashNav({ role, userName }: MobileDashNavProps) {
  const pathname = usePathname();
  const isAdmin = role === "ADMIN";
  const isOrganizer = role === "ORGANIZER";
  const items = isAdmin ? NAV_ITEMS.ADMIN : isOrganizer ? NAV_ITEMS.ORGANIZER : NAV_ITEMS.ATTENDEE;
  const avatarActive = pathname === "/dashboard";
  const avatarColor = isAdmin ? "var(--rose-600)" : isOrganizer ? "var(--blue-600)" : "var(--emerald-600)";

  return (
    <nav className="mobile-dash-nav no-print" aria-label="Dashboard navigation">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-dash-nav-link${isActive ? " active" : ""}`}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 48, height: 32, borderRadius: 16,
              background: isActive ? "var(--blue-100)" : "transparent",
              transition: "background 0.2s"
            }}>
              <span className="mobile-dash-nav-icon">{item.icon}</span>
            </div>
            <span className="mobile-dash-nav-label" style={{ 
              fontWeight: isActive ? 700 : 500,
              color: isActive ? "var(--blue-700)" : "var(--gray-500)"
            }}>
              {item.label}
            </span>
          </Link>
        );
      })}
      <Link
        href="/dashboard"
        className={`mobile-dash-nav-link${avatarActive ? " active" : ""}`}
        aria-label="Account"
      >
        <div
          style={{
            width: 26, height: 26, borderRadius: "50%",
            background: avatarColor, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "0.7rem",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            border: avatarActive ? "2px solid var(--blue-600)" : "2px solid transparent",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.04)",
          }}
        >
          {userName ? userName.charAt(0).toUpperCase() : "U"}
        </div>
        <span
          className="mobile-dash-nav-label"
          style={{ fontWeight: avatarActive ? 700 : 500, color: avatarActive ? "var(--blue-700)" : "var(--gray-500)" }}
        >
          You
        </span>
      </Link>
    </nav>
  );
}
