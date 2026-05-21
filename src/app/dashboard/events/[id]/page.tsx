import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import EventManagementClient from "./EventManagementClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  return { title: event ? `Manage: ${event.title} — EventKH` : "Event Management — EventKH" };
}

export default async function EventManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ORGANIZER") redirect("/dashboard");

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      ticketTypes: true,
      customFields: { orderBy: { order: "asc" } },
      _count: { select: { registrations: true } },
    },
  });

  if (!event) notFound();
  if (event.organizerId !== session.user.id) redirect("/dashboard/events");

  const checkedIn = await prisma.registration.count({
    where: { eventId: id, status: "CHECKED_IN" },
  });

  return (
    <EventManagementClient
      event={{
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date.toISOString(),
        endDate: event.endDate?.toISOString() ?? null,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        capacity: event.capacity,
        bannerImageURL: event.bannerImageURL,
        badgeBackgroundURL: event.badgeBackgroundURL,
        badgeEnabled: event.badgeEnabled,
        badgeSize: event.badgeSize,
        badgeOrientation: event.badgeOrientation,
        eventType: event.eventType,
        isPublished: event.isPublished,
        totalRegistrations: event._count.registrations,
        checkedIn,
        ticketTypes: event.ticketTypes,
        customFields: event.customFields,
      }}
    />
  );
}
