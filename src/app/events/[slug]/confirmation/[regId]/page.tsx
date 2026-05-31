import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
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

  const dateStr = new Date(registration.event.date).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const qrDataURL = registration.qrCodeString
    ? await generateQRCodeDataURL(registration.qrCodeString)
    : null;

  const attendeeName = registration.attendee?.name || registration.guestName || "Guest Attendee";
  const contactInfo = registration.attendee?.email || registration.guestEmail || (registration.guestPhone ? `📞 ${registration.guestPhone}` : "");

  return (
    <main style={{ minHeight: "calc(100vh - 64px)", background: "var(--gray-50)", padding: "2.5rem 1.5rem" }}>
      <div className="container-sm">
        {/* Success header */}
        <div style={{
          background: "linear-gradient(135deg, var(--brand-900), #4c1d95)",
          borderRadius: "1.25rem", padding: "2.5rem", textAlign: "center",
          color: "#fff", marginBottom: "1.5rem"
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>You&apos;re registered!</h1>
          <p style={{ color: "rgba(255,255,255,0.7)" }}>
            Your spot at <strong style={{ color: "#fff" }}>{registration.event.title}</strong> is confirmed.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Event details */}
          <div className="card card-body">
            <h3 style={{ marginBottom: "1rem", color: "var(--gray-900)" }}>Event Details</h3>
            <dl style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <dt style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Event</dt>
                <dd style={{ fontWeight: 600, color: "var(--gray-900)" }}>{registration.event.title}</dd>
              </div>
              <div>
                <dt style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Date</dt>
                <dd style={{ color: "var(--gray-700)" }}>{dateStr}</dd>
              </div>
              {registration.event.startTime && (
                <div>
                  <dt style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Time</dt>
                  <dd style={{ color: "var(--gray-700)" }}>{registration.event.startTime}{registration.event.endTime ? ` – ${registration.event.endTime}` : ""}</dd>
                </div>
              )}
              {registration.event.location && (
                <div>
                  <dt style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Location</dt>
                  <dd style={{ color: "var(--gray-700)" }}>{registration.event.location}</dd>
                </div>
              )}
              <div>
                <dt style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Ticket</dt>
                <dd><span className="badge badge-purple">{registration.ticketType.name}</span></dd>
              </div>
              <div>
                <dt style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Attendee</dt>
                <dd style={{ color: "var(--gray-700)" }}>{attendeeName}</dd>
              </div>
              {contactInfo && (
                <div>
                  <dt style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Contact</dt>
                  <dd style={{ color: "var(--gray-700)" }}>{contactInfo}</dd>
                </div>
              )}
              <div>
                <dt style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</dt>
                <dd>
                  {registration.checkedInAt ? (
                    <span className="badge badge-green">✅ Checked In</span>
                  ) : (
                    <span className="badge badge-blue">🎟️ Confirmed</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* QR Code */}
          <div className="card card-body" style={{ textAlign: "center" }}>
            <h3 style={{ marginBottom: "1rem", color: "var(--gray-900)" }}>Your QR Code</h3>
            {qrDataURL ? (
              <>
                <div style={{
                  background: "linear-gradient(135deg, var(--brand-900), #4c1d95)",
                  padding: "1.25rem", borderRadius: "0.75rem", display: "inline-block", marginBottom: "0.75rem"
                }}>
                  <img src={qrDataURL} alt="QR Code" style={{ width: 180, height: 180, display: "block" }} />
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>
                  Present this QR code at the entrance to check in.
                </p>
                <p style={{ fontSize: "0.7rem", color: "var(--gray-400)", marginTop: "0.5rem", fontFamily: "monospace", wordBreak: "break-all" }}>
                  {registration.qrCodeString}
                </p>
              </>
            ) : (
              <p style={{ color: "var(--gray-400)" }}>QR code unavailable</p>
            )}
          </div>
        </div>

        {/* Custom answers */}
        {registration.customAnswers.length > 0 && (
          <div className="card card-body" style={{ marginTop: "1.5rem" }}>
            <h3 style={{ marginBottom: "1rem", color: "var(--gray-900)" }}>Your Responses</h3>
            <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {registration.customAnswers.map((a) => (
                <div key={a.id}>
                  <dt style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{a.fieldName}</dt>
                  <dd style={{ color: "var(--gray-700)", fontWeight: 500 }}>{a.answerValue || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Actions */}
        <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <BadgeDownloadButton eventId={registration.eventId} regId={regId} attendeeName={attendeeName} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Link href={`/events/${slug}`} className="btn btn-secondary" style={{ justifyContent: "center" }}>
              ← Back to Event
            </Link>
            {session ? (
              <Link href="/dashboard" className="btn btn-secondary" style={{ justifyContent: "center" }}>
                My Dashboard
              </Link>
            ) : (
              <Link href="/" className="btn btn-secondary" style={{ justifyContent: "center" }}>
                🏠 Home Page
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
