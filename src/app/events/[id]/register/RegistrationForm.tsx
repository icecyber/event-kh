"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface CustomField {
  id: string;
  label: string;
  fieldType: string;
  required: boolean;
  options?: string | null;
  order: number;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
}

interface EventData {
  id: string;
  title: string;
  date: string;
  location?: string;
  startTime?: string;
  eventType: string;
  ticketTypes: TicketType[];
  customFields: CustomField[];
}

interface Props {
  params: Promise<{ id: string }>;
  eventData: EventData;
}

export default function RegistrationForm({ eventData }: { eventData: EventData }) {
  const router = useRouter();
  const { data: session } = useSession();

  const [selectedTicket, setSelectedTicket] = useState(eventData.ticketTypes[0]?.id ?? "");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isGuest = eventData.eventType === "EXHIBITION" && !session;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (isGuest) {
      if (!guestName.trim()) {
        setError("Please enter your Full Name.");
        setSubmitting(false);
        return;
      }
      if (!guestPhone.trim()) {
        setError("Please enter your Phone Number.");
        setSubmitting(false);
        return;
      }
    }

    try {
      const formattedAnswers = eventData.customFields.map((field) => ({
        customFieldId: field.id,
        fieldName: field.label,
        answerValue: answers[field.id] ?? "",
      }));

      const res = await fetch(`/api/events/${eventData.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketTypeId: selectedTicket,
          answers: formattedAnswers,
          ...(isGuest ? { guestName, guestPhone, guestEmail } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.registrationId) {
          router.push(`/events/${eventData.id}/confirmation/${data.registrationId}`);
          return;
        }
        setError(data.error || "Registration failed. Please try again.");
        return;
      }

      router.push(`/events/${eventData.id}/confirmation/${data.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const setAnswer = (fieldId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Guest attendee info */}
      {isGuest && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          padding: "1.25rem",
          background: "var(--gray-50)",
          border: "1px solid var(--gray-200)",
          borderRadius: "0.75rem",
          marginBottom: "0.5rem"
        }}>
          <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--gray-900)", margin: 0 }}>Attendee Details</h4>
          <p style={{ fontSize: "0.85rem", color: "var(--gray-500)", margin: 0 }}>Please fill out your details below. No account registration is required.</p>
          
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Full Name <span className="req">*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Sokha Meas"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Phone Number <span className="req">*</span></label>
            <input
              type="tel"
              className="form-input"
              placeholder="e.g. 012345678"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Email Address <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(Optional)</span></label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. sokha@example.com"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Ticket selection */}
      {eventData.ticketTypes.length > 1 && (
        <div className="form-group">
          <label className="form-label">Select Ticket Type <span className="req">*</span></label>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {eventData.ticketTypes.map((ticket) => (
              <label key={ticket.id} style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.85rem 1rem", border: `2px solid ${selectedTicket === ticket.id ? "var(--brand-500)" : "var(--gray-200)"}`,
                borderRadius: "0.625rem", cursor: "pointer", background: selectedTicket === ticket.id ? "var(--brand-50)" : "#fff",
                transition: "all 0.2s"
              }}>
                <input
                  type="radio"
                  name="ticket"
                  value={ticket.id}
                  checked={selectedTicket === ticket.id}
                  onChange={() => setSelectedTicket(ticket.id)}
                  style={{ accentColor: "var(--brand-600)" }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "var(--gray-800)" }}>{ticket.name}</div>
                </div>
                <span className="badge badge-green">{ticket.price === 0 ? "Free" : `$${ticket.price}`}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Custom fields */}
      {eventData.customFields.map((field) => {
        const opts = field.options ? JSON.parse(field.options) as string[] : [];

        return (
          <div key={field.id} className="form-group">
            <label className="form-label">
              {field.label}
              {field.required && <span className="req">*</span>}
            </label>

            {field.fieldType === "text" && (
              <input
                type="text"
                className="form-input"
                value={answers[field.id] ?? ""}
                onChange={(e) => setAnswer(field.id, e.target.value)}
                required={field.required}
              />
            )}
            {field.fieldType === "number" && (
              <input
                type="number"
                className="form-input"
                value={answers[field.id] ?? ""}
                onChange={(e) => setAnswer(field.id, e.target.value)}
                required={field.required}
              />
            )}
            {field.fieldType === "textarea" && (
              <textarea
                className="form-textarea"
                value={answers[field.id] ?? ""}
                onChange={(e) => setAnswer(field.id, e.target.value)}
                required={field.required}
              />
            )}
            {field.fieldType === "select" && (
              <select
                className="form-select"
                value={answers[field.id] ?? ""}
                onChange={(e) => setAnswer(field.id, e.target.value)}
                required={field.required}
              >
                <option value="">Select an option…</option>
                {opts.map((opt: string) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
            {field.fieldType === "checkbox" && (
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={answers[field.id] === "true"}
                  onChange={(e) => setAnswer(field.id, e.target.checked ? "true" : "false")}
                  style={{ accentColor: "var(--brand-600)", width: 18, height: 18 }}
                />
                <span style={{ color: "var(--gray-600)" }}>Yes</span>
              </label>
            )}
          </div>
        );
      })}

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div style={{ paddingTop: "0.5rem" }}>
        <button
          type="submit"
          id="submit-registration"
          className="btn btn-primary btn-lg"
          style={{ width: "100%", justifyContent: "center" }}
          disabled={submitting}
        >
          {submitting ? (
            <><span className="spinner" /> Registering…</>
          ) : (
            "Complete Registration →"
          )}
        </button>
      </div>
    </form>
  );
}
