"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function AdminNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Only show notifications for administrators / platform managers
  const isAdmin = session && (session.user.role === "ADMIN" || session.user.email === "admin@eventkh.com");

  const fetchNotifications = async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 15 seconds to fetch in real-time
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [session]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isAdmin) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PUT",
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fmtTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " · " + date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-ghost"
        style={{
          position: "relative",
          padding: "0.5rem",
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          background: open ? "var(--gray-100)" : "transparent",
        }}
        aria-label="Platform administration notifications"
      >
        <span style={{ fontSize: "1.2rem" }}>🔔</span>
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              background: "#e11d48",
              color: "#fff",
              fontSize: "0.65rem",
              fontWeight: 800,
              minWidth: "16px",
              height: "16px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              boxShadow: "0 0 0 2px #fff",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "360px",
            background: "#ffffff",
            border: "1px solid var(--gray-200)",
            borderRadius: "0.875rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            zIndex: 1000,
            overflow: "hidden",
            animation: "fadeIn 0.15s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--gray-100)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#fafafa",
            }}
          >
            <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--gray-900)" }}>
              Platform Alerts ⚡
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: "none",
                  border: "none",
                  color: "#e11d48",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: "320px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "2.5rem 1.5rem", textAlign: "center", color: "var(--gray-400)" }}>
                <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}>🎉</span>
                <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 500 }}>No notifications yet</p>
                <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.75rem", color: "var(--gray-400)" }}>
                   match requests will appear here instantly.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                  style={{
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid var(--gray-50)",
                    background: notif.read ? "transparent" : "rgba(225, 29, 72, 0.02)",
                    cursor: notif.read ? "default" : "pointer",
                    transition: "background 0.15s",
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "flex-start",
                  }}
                  onMouseEnter={(e) => {
                    if (!notif.read) e.currentTarget.style.background = "rgba(225, 29, 72, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (!notif.read) e.currentTarget.style.background = "rgba(225, 29, 72, 0.02)";
                  }}
                >
                  <span style={{ fontSize: "1.25rem", marginTop: "0.15rem", flexShrink: 0 }}>🤝</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: notif.read ? "var(--gray-700)" : "var(--gray-900)" }}>
                        {notif.title}
                      </span>
                      {!notif.read && (
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#e11d48", flexShrink: 0 }} />
                      )}
                    </div>
                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "var(--gray-500)", lineHeight: 1.45, wordBreak: "break-word" }}>
                      {notif.message}
                    </p>
                    <span style={{ display: "block", marginTop: "0.4rem", fontSize: "0.72rem", color: "var(--gray-400)" }}>
                      {fmtTime(notif.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
