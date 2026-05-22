import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import EventDetailClient from "./EventDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  return {
    title: event ? `${event.title} — EventKH` : "Event — EventKH",
    description: event?.description ?? undefined,
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const event = await prisma.event.findUnique({
    where: { id, isPublished: true },
    include: {
      organizer: { select: { name: true } },
      ticketTypes: true,
      customFields: { orderBy: { order: "asc" } },
      _count: { select: { registrations: true } },
    },
  });

  if (!event) notFound();

  let existingRegId: string | null = null;
  if (session) {
    const reg = await prisma.registration.findFirst({
      where: { eventId: id, attendeeId: session.user.id },
      select: { id: true },
    });
    existingRegId = reg?.id ?? null;
  }

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
    });
  const startDateStr = fmtDate(event.date);
  const endDateStr = event.endDate ? fmtDate(event.endDate) : null;
  const dateDisplay = endDateStr && endDateStr !== startDateStr
    ? `${startDateStr} – ${endDateStr}`
    : startDateStr;

  const spotsLeft = event.capacity
    ? event.capacity - event._count.registrations
    : null;

  return (
    <EventDetailClient
      ev={{
        id: event.id,
        title: event.title,
        description: event.description,
        dateDisplay,
        dateISO: event.date.toISOString(),
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        bannerImageURL: event.bannerImageURL,
        eventType: event.eventType,
        organizerName: event.organizer.name ?? "Unknown",
        registrationCount: event._count.registrations,
        spotsLeft,
        ticketTypes: event.ticketTypes.map((t) => ({ id: t.id, name: t.name, price: t.price })),
        customFields: event.customFields.map((f) => ({
          id: f.id,
          label: f.label,
          fieldType: f.fieldType,
          required: f.required,
          options: f.options,
          order: f.order,
        })),
        existingRegId,
      }}
    />
  );
}
