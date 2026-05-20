import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/events/[id]/export — export participants as CSV
export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ORGANIZER") {
    return new Response("Forbidden", { status: 403 });
  }

  const { id: eventId } = await params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });
  if (!event) return new Response("Not found", { status: 404 });
  if (event.organizerId !== session.user.id) {
    return new Response("Forbidden", { status: 403 });
  }

  const customFields = await prisma.customField.findMany({
    where: { eventId },
    orderBy: { order: "asc" },
  });

  const registrations = await prisma.registration.findMany({
    where: { eventId },
    include: {
      attendee: { select: { name: true, email: true } },
      ticketType: true,
      customAnswers: true,
    },
    orderBy: { registrationDate: "asc" },
  });

  const customFieldHeaders = customFields.map((f) => f.label);


  // Build CSV
  const headers = [
    "No.",
    "Name",
    "Email",
    "Phone",
    "Ticket Type",
    "Status",
    "Registered At",
    "Checked In At",
    "Badge Issued At",
    ...customFieldHeaders,
  ];

  const rows = registrations.map((reg, idx) => {
    const customValues = customFields.map((field) => {
      const answer = reg.customAnswers.find((a) => a.fieldName === field.label);
      return answer?.answerValue ?? "";
    });

    const name = reg.attendee?.name || reg.guestName || "";
    const email = reg.attendee?.email || reg.guestEmail || "";
    const phone = reg.guestPhone || "";

    return [
      String(idx + 1),
      name,
      email,
      phone,
      reg.ticketType.name,
      reg.status,
      new Date(reg.registrationDate).toISOString(),
      reg.checkedInAt ? new Date(reg.checkedInAt).toISOString() : "",
      reg.badgeIssuedAt ? new Date(reg.badgeIssuedAt).toISOString() : "",
      ...customValues,
    ];
  });

  const escapeCSV = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csvLines = [headers, ...rows].map((row) =>
    row.map(escapeCSV).join(",")
  );
  const csv = csvLines.join("\n");

  const safeName = event.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="participants-${safeName}.csv"`,
    },
  });
}
