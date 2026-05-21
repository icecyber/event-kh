import { prisma } from "@/lib/prisma";
import EventsHeader from "./EventsHeader";
import EventsList from "./EventsList";

export const metadata = {
  title: "Browse Events — EventKH",
  description: "Discover and register for upcoming events.",
};

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    include: {
      organizer: { select: { name: true } },
      ticketTypes: true,
      _count: { select: { registrations: true } },
    },
    orderBy: { date: "asc" },
  });

  const serialized = events.map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date.toISOString(),
    startTime: e.startTime,
    location: e.location,
    bannerImageURL: e.bannerImageURL,
    capacity: e.capacity,
    organizerName: e.organizer.name ?? "Unknown",
    registrationCount: e._count.registrations,
    hasFreeTicket: e.ticketTypes.some((t) => t.price === 0),
  }));

  return (
    <main style={{ minHeight: "calc(100vh - 64px)" }}>
      <EventsHeader />
      <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
        <EventsList events={serialized} />
      </div>
    </main>
  );
}
