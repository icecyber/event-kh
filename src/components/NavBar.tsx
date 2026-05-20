"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isOnDash = pathname?.startsWith("/dashboard");

  return (
    <header className="nav-bar">
      <Link href="/" className="nav-logo">⚡ EventKH</Link>

      <nav className="nav-links">
        {!isOnDash && (
          <Link href="/events" className="btn btn-ghost">
            Browse Events
          </Link>
        )}

        {session ? (
          <>
            <Link href="/dashboard" className="btn btn-ghost">
              Dashboard
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="btn btn-secondary btn-sm"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-ghost">Log in</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
