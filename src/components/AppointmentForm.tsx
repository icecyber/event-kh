"use client";

import { useState } from "react";

interface AppointmentFormProps {
  initialName?: string;
  initialEmail?: string;
}

export default function AppointmentForm({ initialName = "", initialEmail = "" }: AppointmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState("");
  const [targetType, setTargetType] = useState<"exhibitor" | "industry">("exhibitor");
  const [exhibitorName, setExhibitorName] = useState("");
  const [industry, setIndustry] = useState("Technology & IT");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("09:00 AM - 10:00 AM");
  const [purpose, setPurpose] = useState("");

  const industries = [
    "Technology & IT",
    "FinTech & Banking",
    "Agriculture & AgriTech",
    "Education & EdTech",
    "Real Estate & Construction",
    "Retail & E-commerce",
    "Healthcare & Medical",
    "Tourism & Hospitality",
    "Manufacturing & Logistics",
    "Other"
  ];

  const timeSlots = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!fullName.trim() || !email.trim() || !phone.trim() || !preferredDate || !preferredTime || !purpose.trim()) {
      setError("Please fill out all required fields.");
      setLoading(false);
      return;
    }

    if (targetType === "exhibitor" && !exhibitorName.trim()) {
      setError("Please enter the name of the exhibitor you wish to meet.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          exhibitorName: targetType === "exhibitor" ? exhibitorName : null,
          industry: targetType === "industry" ? industry : null,
          preferredDate,
          preferredTime,
          purpose,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit appointment application.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="alert alert-success" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", textAlign: "center" }}>
        <span style={{ fontSize: "3rem" }}>🎉</span>
        <h4 style={{ color: "#065f46", margin: 0, fontWeight: 700 }}>Appointment Applied Successfully!</h4>
        <p style={{ margin: 0, fontSize: "0.9rem", color: "#047857", lineHeight: 1.6 }}>
          Thank you, <strong>{fullName}</strong>. Your request to meet with{" "}
          <strong>{targetType === "exhibitor" ? exhibitorName : industry}</strong> on{" "}
          <strong>{preferredDate} ({preferredTime})</strong> has been submitted. The organizer/exhibitor will review your request and confirm your scheduled slot shortly.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setFullName("");
            setEmail("");
            setPhone("");
            setExhibitorName("");
            setPurpose("");
            setPreferredDate("");
          }}
          className="btn btn-sm btn-success"
          style={{ marginTop: "1rem" }}
        >
          Book Another Appointment
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="form-group">
          <label className="form-label">
            Full Name <span className="req">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Sophy Cheat"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Phone Number <span className="req">*</span>
          </label>
          <input
            type="tel"
            className="form-input"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +855 12 345 678"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Email Address <span className="req">*</span>
        </label>
        <input
          type="email"
          className="form-input"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. sophy.cheat@domain.com"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Who do you want to meet? <span className="req">*</span></label>
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", color: "var(--gray-700)", fontWeight: 600 }}>
            <input
              type="radio"
              name="targetType"
              checked={targetType === "exhibitor"}
              onChange={() => setTargetType("exhibitor")}
              style={{ accentColor: "var(--brand-600)" }}
            />
            Specific Exhibitor
          </label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", color: "var(--gray-700)", fontWeight: 600 }}>
            <input
              type="radio"
              name="targetType"
              checked={targetType === "industry"}
              onChange={() => setTargetType("industry")}
              style={{ accentColor: "var(--brand-600)" }}
            />
            Specific Industry Match
          </label>
        </div>
      </div>

      {targetType === "exhibitor" ? (
        <div className="form-group">
          <label className="form-label">
            Exhibitor / Company Name <span className="req">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            required
            value={exhibitorName}
            onChange={(e) => setExhibitorName(e.target.value)}
            placeholder="e.g. ABA Bank, Smart Axiata, etc."
          />
        </div>
      ) : (
        <div className="form-group">
          <label className="form-label">
            Select Target Industry <span className="req">*</span>
          </label>
          <select
            className="form-select"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="form-group">
          <label className="form-label">
            Preferred Date <span className="req">*</span>
          </label>
          <input
            type="date"
            className="form-input"
            required
            min={new Date().toISOString().split("T")[0]}
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Preferred Time Slot <span className="req">*</span>
          </label>
          <select
            className="form-select"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
          >
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Purpose of Meeting / Discussion Topic <span className="req">*</span>
        </label>
        <textarea
          className="form-textarea"
          required
          rows={3}
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Describe your meeting objectives or what you would like to discuss with the exhibitor..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary"
        style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "0.5rem" }}
      >
        {loading ? (
          <>
            <span className="spinner" /> Applying...
          </>
        ) : (
          "Apply for 1-on-1 Appointment"
        )}
      </button>
    </form>
  );
}
