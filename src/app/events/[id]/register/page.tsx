import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import RegistrationForm from "./RegistrationForm";
import { RegisterPageHeader, RegisterFormTitle } from "./RegisterPageClient";

export const metadata = { title: "Register — EventKH" };

export default async function RegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const event = await prisma.event.findUnique({
    where: { id, isPublished: true },
    include: {
      ticketTypes: true,
      customFields: { orderBy: { order: "asc" } },
    },
  });

  if (!event) notFound();

  // All event types allow guest registration — no login wall
  // (Standard requires Name+Email, Exhibition requires Name+Phone)

  // Already registered? Only check if logged in
  let existing = null;
  if (session) {
    existing = await prisma.registration.findFirst({
      where: { eventId: id, attendeeId: session.user.id },
    });
  }
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
        <RegisterPageHeader
          eventTitle={event.title}
          dateStr={dateStr}
          startTime={event.startTime}
          location={event.location}
          userName={session?.user?.name}
        />

        {/* Registration form */}
        <div className="card card-body">
          <RegisterFormTitle />
          <RegistrationForm eventData={{
            id: event.id,
            title: event.title,
            date: event.date.toISOString(),
            location: event.location ?? undefined,
            startTime: event.startTime ?? undefined,
            eventType: event.eventType,
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

