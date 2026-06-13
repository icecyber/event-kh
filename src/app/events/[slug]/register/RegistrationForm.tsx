"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLang } from "@/components/LangProvider";
import TranslateText from "@/components/TranslateText";

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
  slug: string;
  title: string;
  date: string;
  location?: string;
  startTime?: string;
  eventType: string;
  ticketTypes: TicketType[];
  customFields: CustomField[];
}

const COUNTRY_CODES = [
  { code: "+855", flag: "🇰🇭", name: "Cambodia" },
  { code: "+66", flag: "🇹🇭", name: "Thailand" },
  { code: "+84", flag: "🇻🇳", name: "Vietnam" },
  { code: "+856", flag: "🇱🇦", name: "Laos" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+62", flag: "🇮🇩", name: "Indonesia" },
  { code: "+63", flag: "🇵🇭", name: "Philippines" },
  { code: "+95", flag: "🇲🇲", name: "Myanmar" },
  { code: "+673", flag: "🇧🇳", name: "Brunei" },
  { code: "+670", flag: "🇹🇱", name: "East Timor" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+852", flag: "🇭🇰", name: "Hong Kong" },
  { code: "+886", flag: "🇹🇼", name: "Taiwan" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+94", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+977", flag: "🇳🇵", name: "Nepal" },
  { code: "+1", flag: "🇺🇸", name: "USA/Canada" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+64", flag: "🇳🇿", name: "New Zealand" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "+41", flag: "🇨🇭", name: "Switzerland" },
  { code: "+31", flag: "🇳🇱", name: "Netherlands" },
  { code: "+32", flag: "🇧🇪", name: "Belgium" },
  { code: "+7", flag: "🇷🇺", name: "Russia" },
  { code: "+90", flag: "🇹🇷", name: "Turkey" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+972", flag: "🇮🇱", name: "Israel" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "+52", flag: "🇲🇽", name: "Mexico" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+20", flag: "🇪🇬", name: "Egypt" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria" }
];

export default function RegistrationForm({ eventData }: { eventData: EventData }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLang();

  const isExhibition = eventData.eventType === "EXHIBITION";
  const isGuest = !session; // all event types support guest registration

  const [selectedTicket, setSelectedTicket] = useState(eventData.ticketTypes[0]?.id ?? "");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Core attendee info — always collected
  const [guestName, setGuestName] = useState(session?.user?.name ?? "");
  const [countryCode, setCountryCode] = useState("+855");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState(session?.user?.email ?? "");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const getFullPhoneNumber = () => {
    const trimmed = guestPhone.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("+")) return trimmed;
    
    // Clean all non-digit characters
    const digits = trimmed.replace(/\D/g, "");
    
    // If it starts with 0, strip the leading 0
    const normalized = digits.startsWith("0") ? digits.slice(1) : digits;
    
    return `${countryCode}${normalized}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Client-side validation
    if (!guestName.trim()) {
      setError("Please enter your Full Name.");
      setSubmitting(false);
      return;
    }
    if (isExhibition && !guestPhone.trim()) {
      setError("Please enter your Phone Number.");
      setSubmitting(false);
      return;
    }
    if (!isExhibition && !guestEmail.trim()) {
      setError("Please enter your Email Address.");
      setSubmitting(false);
      return;
    }

    try {
      const formattedAnswers = eventData.customFields.map((field) => ({
        customFieldId: field.id,
        fieldName: field.label,
        answerValue: answers[field.id] ?? "",
      }));

      const fullPhone = getFullPhoneNumber();

      const res = await fetch(`/api/events/${eventData.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketTypeId: selectedTicket,
          answers: formattedAnswers,
          guestName: guestName.trim(),
          guestPhone: fullPhone || undefined,
          guestEmail: guestEmail.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.registrationId) {
          router.push(`/events/${eventData.slug}/confirmation/${data.registrationId}`);
          return;
        }
        setError(data.error || "Registration failed. Please try again.");
        return;
      }

      router.push(`/events/${eventData.slug}/confirmation/${data.id}`);
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
      {/* Attendee core info — always shown */}
      <div style={{
        display: "flex", flexDirection: "column", gap: "1.25rem",
        padding: "1.25rem", background: "var(--gray-50)",
        border: "1px solid var(--gray-200)", borderRadius: "0.75rem",
      }}>
        <div>
          <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--gray-900)", margin: 0, marginBottom: "0.25rem" }}>
            {t("reg.yourDetails")}
          </h4>
          <p style={{ fontSize: "0.85rem", color: "var(--gray-500)", margin: 0 }}>
            {isExhibition
              ? t("reg.noAccountNeeded")
              : session
                ? t("reg.preFilled")
                : t("reg.enterDetails")
            }
          </p>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontWeight: 600 }}>{t("reg.fullName")} <span className="req">*</span></label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Sokha Meas"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
          />
        </div>

        {/* Exhibition: require Phone, Email optional */}
        {isExhibition && (
          <>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{t("reg.phoneNumber")} <span className="req">*</span></label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <select
                  className="form-select"
                  style={{ width: "125px", flexShrink: 0 }}
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 12 345 678"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                {t("reg.emailAddress")} <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>({t("common.optional")})</span>
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. sokha@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Standard: require Email, Phone optional */}
        {!isExhibition && (
          <>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{t("reg.emailAddress")} <span className="req">*</span></label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. sokha@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                {t("reg.phoneNumber")} <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>({t("common.optional")})</span>
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <select
                  className="form-select"
                  style={{ width: "125px", flexShrink: 0 }}
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 12 345 678"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Ticket selection */}
      {eventData.ticketTypes.length > 1 && (
        <div className="form-group">
          <label className="form-label">{t("reg.selectTicket")} <span className="req">*</span></label>
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
                  <div style={{ fontWeight: 600, color: "var(--gray-800)" }}>
                    <TranslateText text={ticket.name} />
                  </div>
                </div>
                <span className="badge badge-green">{ticket.price === 0 ? t("events.free") : `$${ticket.price}`}</span>
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
              <TranslateText text={field.label} />
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
                {opts.map((opt: string, idx: number) => (
                  <option key={idx} value={opt}>{opt}</option>
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
            <><span className="spinner" /> {t("reg.registering")}</>
          ) : (
            t("reg.completeBtn")
          )}
        </button>
      </div>
    </form>
  );
}
