import AppointmentForm from "@/components/AppointmentForm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "1-on-1 Business Matchmaking & Appointments — EventKH",
  description: "Request a scheduled 1-on-1 business matchmaking meeting with specific exhibitors or industry sectors globally on EventKH.",
};

export default async function MatchmakingPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login?callbackUrl=/matchmaking");
  }

  return (
    <main style={{ minHeight: "calc(100vh - 64px)", background: "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)", padding: "4rem 1.5rem" }}>
      <div className="container-sm" style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "1rem" }}>
            <span className="badge" style={{ padding: "0.4rem 1.1rem", fontSize: "0.85rem", backdropFilter: "blur(4px)", background: "rgba(225, 29, 72, 0.08)", color: "#dc2626", border: "1px solid rgba(225, 29, 72, 0.2)", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <img src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f1f0-1f1ed.png" alt="🇰🇭" style={{ width: "1.25em", height: "1.25em", objectFit: "contain" }} />
              EventKH Matchmaking
            </span>
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#09090b", marginBottom: "0.75rem", letterSpacing: "-0.03em" }}>
            1-on-1 Business Matchmaking
          </h1>
          <p style={{ color: "#52525b", fontSize: "1.05rem", lineHeight: 1.6, maxWidth: 520, margin: "0 auto" }}>
            Apply to schedule highly targeted global appointments with specific exhibitors or representatives of specific industries.
          </p>
        </div>

        {/* Card */}
        <div className="card card-body" style={{ border: "1.5px solid var(--emerald-lt)", boxShadow: "0 10px 30px rgba(0, 200, 150, 0.05)", background: "#fff", padding: "2.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "1.5rem" }}>🤝</span>
            <h3 style={{ margin: 0, color: "var(--gray-900)", fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Request an Appointment
            </h3>
          </div>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", marginBottom: "2rem", lineHeight: 1.5 }}>
            Please fill in your contact information and scheduling preferences. Platform managers and exhibitor representatives will review your request and confirm a timeslot.
          </p>

          <AppointmentForm
            initialName={session.user.name || ""}
            initialEmail={session.user.email || ""}
          />
        </div>
      </div>
    </main>
  );
}
