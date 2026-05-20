import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import RegistrationForm from "./RegistrationForm";

export const metadata = { title: "Register — EventKH" };

export default async function RegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/login?callbackUrl=/events/${id}/register`);
  }

  const event = await prisma.event.findUnique({
    where: { id, isPublished: true },
    include: {
      ticketTypes: true,
      customFields: { orderBy: { order: "asc" } },
    },
  });

  if (!event) notFound();

  // Already registered?
  const existing = await prisma.registration.findFirst({
    where: { eventId: id, attendeeId: session.user.id },
  });
  if (existing) {
    redirect(`/events/${id}/confirmation/${existing.id}`);
  }

  const dateStr = new Date(event.date).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <main style={{ minHeight: "calc(100vh - 64px)", background: "var(--gray-50)", padding: "2.5rem 1.5rem" }}>
      <div className="container-sm">
        {/* Breadcrumb */}
        <div style={{ marginBottom: "1.5rem", fontSize: "0.875rem", color: "var(--gray-500)" }}>
          <Link href="/events" style={{ color: "var(--brand-600)", textDecoration: "none" }}>Events</Link>
          {" / "}
          <Link href={`/events/${id}`} style={{ color: "var(--brand-600)", textDecoration: "none" }}>{event.title}</Link>
          {" / Register"}
        </div>

        {/* Event summary card */}
        <div className="card card-body" style={{ marginBottom: "1.5rem", background: "linear-gradient(135deg, var(--brand-900), #4c1d95)", color: "#fff" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.55)", marginBottom: "0.5rem" }}>Registering for</p>
          <h2 style={{ fontSize: "1.35rem", marginBottom: "0.75rem" }}>{event.title}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>
            <span>📅 {dateStr}{event.startTime ? ` · ${event.startTime}` : ""}</span>
            {event.location && <span>📍 {event.location}</span>}
            <span>👤 Registering as <strong style={{ color: "#fff" }}>{session.user.name}</strong></span>
          </div>
        </div>

        {/* Registration form */}
        <div className="card card-body">
          <h3 style={{ marginBottom: "1.5rem", color: "var(--gray-900)" }}>Complete your registration</h3>
          <RegistrationForm eventData={{
            id: event.id,
            title: event.title,
            date: event.date.toISOString(),
            location: event.location ?? undefined,
            startTime: event.startTime ?? undefined,
            ticketTypes: event.ticketTypes.map((t) => ({ id: t.id, name: t.name, price: t.price })),
            customFields: event.customFields.map((f) => ({
              id: f.id,
              label: f.label,
              fieldType: f.fieldType,
              required: f.required,
              options: f.options,
              order: f.order,
            })),
          }} />
        </div>
      </div>
    </main>
  );
}
