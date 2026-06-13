import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { generateQRCodeDataURL } from "@/lib/qr";
import BadgeDownloadButton from "./BadgeDownloadButton";

export const metadata = { title: "Registration Confirmed — EventKH" };

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ slug: string; regId: string }>;
}) {
  const { slug, regId } = await params;
  const session = await getServerSession(authOptions);

  const registration = await prisma.registration.findUnique({
    where: { id: regId },
    include: {
      event: true,
      attendee: { select: { id: true, name: true, email: true } },
      ticketType: true,
      customAnswers: { include: { customField: true } },
    },
  });

  if (!registration) notFound();
  if (registration.event.slug !== slug) notFound();

  // Access control:
  // - Guest registrations (no attendeeId) are accessible to anyone with the URL
  // - Authenticated registrations require the owner or the event organizer
  const isGuestRegistration = !registration.attendeeId;
  if (!isGuestRegistration) {
    if (!session) {
      redirect(`/login?callbackUrl=/events/${slug}/confirmation/${regId}`);
    }
    const isOwner = registration.attendeeId === session.user.id;
    const isOrganizer =
      session.user.role === "ORGANIZER" &&
      registration.event.organizerId === session.user.id;
    if (!isOwner && !isOrganizer) redirect("/dashboard");
  }


  const qrDataURL = registration.qrCodeString
    ? await generateQRCodeDataURL(registration.qrCodeString)
    : null;

  const isCustomBadge = registration.event.badgeEnabled && registration.event.badgeBackgroundURL;

  const attendeeName = registration.attendee?.name || registration.guestName || "Guest Attendee";

  return (
    <main style={{ minHeight: "calc(100vh - 64px)", background: "var(--gray-50)", padding: "2.5rem 1.5rem" }}>
      <div className="container-sm" style={{ maxWidth: 480, margin: "0 auto" }}>
        {/* Merged: Success header + QR Code */}
        <div style={{
          background: "linear-gradient(135deg, var(--brand-900), #4c1d95)",
          borderRadius: "1.25rem", padding: "2.5rem 1.5rem", textAlign: "center",
          color: "#fff", marginBottom: "1.5rem",
        }}>
          {/* Header */}
          <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>🎉</div>
          <h1 style={{ fontSize: "clamp(1.35rem, 5vw, 1.75rem)", marginBottom: "0.5rem", color: "#fff" }}>You&apos;re registered!</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", margin: 0, fontSize: "0.95rem" }}>
            Your spot at <strong style={{ color: "#fff" }}>{registration.event.title}</strong> is confirmed.
          </p>

          {/* Divider */}
          <div style={{ margin: "1.75rem 0", borderTop: "1px solid rgba(255,255,255,0.18)" }} />

          {/* QR Code / Custom Badge */}
          {isCustomBadge ? (
            <>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "1rem" }}>
                Your Custom Event Badge
              </p>
              <div style={{
                borderRadius: "1rem", overflow: "hidden", display: "inline-block",
                boxShadow: "0 8px 32px rgba(0,0,0,0.35)", maxWidth: "100%", border: "1px solid rgba(255,255,255,0.12)",
                background: "#000", marginBottom: "1rem"
              }}>
                <img
                  src={`/api/events/${registration.eventId}/registrations/${registration.id}/badge`}
                  alt="Custom Badge"
                  style={{
                    width: "100%",
                    maxWidth: 320,
                    height: "auto",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              </div>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", margin: 0 }}>
                Present this badge at the entrance to check in.
              </p>
            </>
          ) : qrDataURL ? (
            <>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "1rem" }}>
                Your Entry QR Code
              </p>
              <div style={{
                background: "#fff",
                padding: "1rem", borderRadius: "0.875rem", display: "inline-block",
                marginBottom: "1rem", boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              }}>
                <img
                  src={qrDataURL}
                  alt="QR Code"
                  style={{
                    width: "100%",
                    maxWidth: 220,
                    height: "auto",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              </div>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", margin: 0 }}>
                Present this QR code at the entrance to check in.
              </p>
            </>
          ) : (
            <p style={{ color: "rgba(255,255,255,0.5)" }}>QR code unavailable</p>
          )}
        </div>

        {/* Download button */}
        <BadgeDownloadButton eventId={registration.eventId} regId={regId} attendeeName={attendeeName} />
      </div>
    </main>
  );
}
