import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  return { title: event ? `Print Badges: ${event.title} — EventKH` : "Print Badges — EventKH" };
}

export default async function PrintBadgesPage({ params }: Ctx) {
  const { id: eventId } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ORGANIZER") redirect("/login");

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { registrations: { include: { attendee: true, ticketType: true } } },
  });

  if (!event) notFound();
  if (event.organizerId !== session.user.id) redirect("/dashboard/events");

  const registrations = event.registrations;

  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          /* CSS Reset for Clean Print */
          html, body {
            margin: 0;
            padding: 0;
            background: #f8fafc;
            font-family: system-ui, -apple-system, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Control banner at top - hidden during print */
          .no-print-banner {
            background: #0f172a;
            color: #fff;
            padding: 1.25rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            font-family: inherit;
            border-bottom: 1px solid #1e293b;
          }
          .no-print-banner h2 {
            margin: 0;
            font-size: 1.15rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .no-print-banner p {
            margin: 0.25rem 0 0 0;
            font-size: 0.8rem;
            color: #94a3b8;
          }
          .btn-group {
            display: flex;
            gap: 0.75rem;
          }
          .btn-print {
            background: #0ea5e9;
            color: white;
            border: none;
            padding: 0.6rem 1.25rem;
            border-radius: 0.5rem;
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(14, 165, 233, 0.2);
          }
          .btn-print:hover {
            background: #0284c7;
          }
          .btn-back {
            background: #334155;
            color: #f1f5f9;
            border: none;
            padding: 0.6rem 1.25rem;
            border-radius: 0.5rem;
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            transition: all 0.2s;
          }
          .btn-back:hover {
            background: #1e293b;
          }

          /* Print Badge Container */
          .badge-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 2rem;
            gap: 2rem;
          }

          .badge-sheet {
            background: white;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            border-radius: 1rem;
            border: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            width: fit-content;
            padding: 1rem;
          }

          .badge-img {
            max-width: 100%;
            height: auto;
            object-fit: contain;
            display: block;
          }

          /* Strict Print Overrides */
          @media print {
            .no-print {
              display: none !important;
            }
            html, body {
              background: white;
            }
            .badge-container {
              padding: 0;
              gap: 0;
            }
            .badge-sheet {
              page-break-after: always;
              break-after: page;
              box-shadow: none;
              border: none;
              border-radius: 0;
              padding: 0;
              width: 100vw;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .badge-img {
              max-width: 100vw;
              max-height: 100vh;
              object-fit: contain;
            }
          }
        ` }} />
      </head>
      <body>
        {/* Banner with controls - hidden on print */}
        <header className="no-print-banner no-print">
          <div>
            <h2>🎫 Print Attendee Badges</h2>
            <p>Ready to export/print {registrations.length} badges for {event.title}.</p>
          </div>
          <div className="btn-group">
            <a href={`/dashboard/events/${event.id}`} className="btn-back">
              ← Dashboard
            </a>
            <button className="btn-print" onClick={() => window.print()}>
              🖨️ Print / Save to PDF
            </button>
          </div>
        </header>

        {/* Badge Listing */}
        <main className="badge-container">
          {registrations.length === 0 ? (
            <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#64748b", background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", width: "100%", maxWidth: "480px", margin: "2rem auto" }} className="no-print">
              <span style={{ fontSize: "3rem" }}>👥</span>
              <h3 style={{ margin: "1rem 0 0.5rem 0", color: "#1e293b" }}>No attendees registered yet</h3>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>Attendee badges will appear here as soon as registrations are received.</p>
            </div>
          ) : (
            registrations.map((reg) => {
              const attendeeName = reg.attendee?.name || reg.guestName || "Guest Attendee";
              return (
                <div key={reg.id} className="badge-sheet">
                  <img
                    className="badge-img"
                    src={`/api/events/${event.id}/registrations/${reg.id}/badge`}
                    alt={`Badge for ${attendeeName}`}
                  />
                </div>
              );
            })
          )}
        </main>

        {/* Auto-print Script once loaded */}
        {registrations.length > 0 && (
          <script dangerouslySetInnerHTML={{ __html: `
            window.addEventListener('load', () => {
              // Wait for image assets to be drawn in print render loop
              setTimeout(() => {
                window.print();
              }, 1200);
            });
          ` }} />
        )}
      </body>
    </html>
  );
}
