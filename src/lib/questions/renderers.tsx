"use client";

/**
 * Client-only renderers for registered question types.
 *
 * Kept separate from `registry.ts` so that server route handlers can use the
 * registry for validation and persistence without pulling React into the
 * server bundle.
 */

import { useRef, useState } from "react";
import { getQuestionType, parseOptions, type QuestionField } from "./index";

export interface FieldRenderProps {
  field: QuestionField;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  /** Scopes public uploads to an open event. */
  eventId?: string;
}

function TextInput({ field, value, onChange, disabled }: FieldRenderProps) {
  return (
    <input
      type="text"
      className="form-input"
      value={(value as string) ?? ""}
      placeholder={field.placeholder ?? ""}
      minLength={field.minLength ?? undefined}
      maxLength={field.maxLength ?? undefined}
      required={field.required}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function TextareaInput({ field, value, onChange, disabled }: FieldRenderProps) {
  return (
    <textarea
      className="form-textarea"
      value={(value as string) ?? ""}
      placeholder={field.placeholder ?? ""}
      minLength={field.minLength ?? undefined}
      maxLength={field.maxLength ?? undefined}
      required={field.required}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function NumberInput({ field, value, onChange, disabled }: FieldRenderProps) {
  return (
    <input
      type="number"
      className="form-input"
      value={(value as string) ?? ""}
      placeholder={field.placeholder ?? ""}
      min={field.minValue ?? undefined}
      max={field.maxValue ?? undefined}
      step={field.step ?? undefined}
      required={field.required}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function DateInput({ field, value, onChange, disabled }: FieldRenderProps) {
  return (
    <input
      type="date"
      className="form-input"
      value={(value as string) ?? ""}
      required={field.required}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function DropdownInput({ field, value, onChange, disabled }: FieldRenderProps) {
  const opts = parseOptions(field.options);
  return (
    <select
      className="form-select"
      value={(value as string) ?? ""}
      required={field.required}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{field.placeholder || "Select an option…"}</option>
      {opts.map((opt, idx) => (
        <option key={idx} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function RadioGroupInput({ field, value, onChange, disabled }: FieldRenderProps) {
  const opts = parseOptions(field.options);
  const name = `field-${field.id ?? field.label}`;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {opts.map((opt, idx) => (
        <label
          key={idx}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.6rem 0.85rem",
            border: `2px solid ${value === opt ? "var(--brand-500)" : "var(--gray-200)"}`,
            borderRadius: "0.5rem",
            cursor: disabled ? "not-allowed" : "pointer",
            background: value === opt ? "var(--brand-50)" : "#fff",
            transition: "all 0.15s",
          }}
        >
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            required={field.required}
            disabled={disabled}
            onChange={() => onChange(opt)}
            style={{ accentColor: "var(--brand-600)" }}
          />
          <span style={{ color: "var(--gray-700)" }}>{opt}</span>
        </label>
      ))}
    </div>
  );
}

function BooleanInput({ field, value, onChange, disabled }: FieldRenderProps) {
  const checked = value === true || value === "true";
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        required={field.required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: "var(--brand-600)", width: 18, height: 18 }}
      />
      <span style={{ color: "var(--gray-600)" }}>Yes</span>
    </label>
  );
}

function TagboxInput({ field, value, onChange, disabled }: FieldRenderProps) {
  const opts = parseOptions(field.options);
  const selected: string[] = Array.isArray(value) ? (value as string[]) : [];

  const toggle = (opt: string) => {
    if (disabled) return;
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
    );
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {opts.map((opt, idx) => {
        const active = selected.includes(opt);
        return (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => toggle(opt)}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: 999,
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: disabled ? "not-allowed" : "pointer",
              border: `2px solid ${active ? "var(--brand-600)" : "var(--gray-200)"}`,
              background: active ? "var(--brand-600)" : "#fff",
              color: active ? "#fff" : "var(--gray-600)",
              transition: "all 0.15s",
            }}
          >
            {active ? "✓ " : ""}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function RatingInput({ field, value, onChange, disabled }: FieldRenderProps) {
  const scale = field.scale ?? 5;
  const rateType = field.rateType ?? "star";
  const current = Number(value) || 0;
  const symbols: Record<string, string> = { star: "★", emoji: "😀", number: "" };
  const symbol = symbols[rateType] ?? "★";

  return (
    <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
      {Array.from({ length: scale }, (_, i) => i + 1).map((n) => {
        const active = n <= current;
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            aria-label={`Rate ${n} of ${scale}`}
            onClick={() => onChange(String(n))}
            style={{
              cursor: disabled ? "not-allowed" : "pointer",
              background: rateType === "number" ? (active ? "var(--brand-600)" : "#fff") : "none",
              border: rateType === "number" ? `2px solid ${active ? "var(--brand-600)" : "var(--gray-200)"}` : "none",
              borderRadius: rateType === "number" ? "0.5rem" : 0,
              color: rateType === "number" ? (active ? "#fff" : "var(--gray-600)") : active ? "#f59e0b" : "var(--gray-300)",
              fontSize: rateType === "number" ? "0.9rem" : "1.65rem",
              lineHeight: 1,
              padding: rateType === "number" ? "0.35rem 0.7rem" : "0 0.05rem",
              fontWeight: 600,
              transition: "all 0.12s",
            }}
          >
            {rateType === "number" ? n : symbol}
          </button>
        );
      })}
      {current > 0 && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("")}
          style={{
            marginLeft: "0.5rem",
            background: "none",
            border: "none",
            color: "var(--gray-400)",
            fontSize: "0.78rem",
            cursor: disabled ? "not-allowed" : "pointer",
            textDecoration: "underline",
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}

function FileInput({ field, value, onChange, disabled, eventId }: FieldRenderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const urls: string[] = Array.isArray(value) ? (value as string[]) : [];

  const maxFiles = field.maxFiles ?? 1;
  const maxSizeMB = field.maxFileSize ?? 2;

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setErr("");

    if (urls.length + files.length > maxFiles) {
      setErr(`You can upload at most ${maxFiles} file(s).`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of files) {
        if (file.size > maxSizeMB * 1024 * 1024) {
          setErr(`"${file.name}" exceeds the ${maxSizeMB}MB limit.`);
          continue;
        }
        const fd = new FormData();
        fd.append("file", file);
        if (eventId) fd.append("eventId", eventId);
        const res = await fetch("/api/upload/public", { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setErr(data.error || "Upload failed.");
          continue;
        }
        uploaded.push(data.url);
      }
      if (uploaded.length) onChange([...urls, ...uploaded]);
    } catch {
      setErr("Network error during upload.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (idx: number) => onChange(urls.filter((_, i) => i !== idx));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <label
        className="btn btn-secondary btn-sm"
        style={{
          alignSelf: "flex-start",
          cursor: disabled || uploading ? "not-allowed" : "pointer",
          opacity: disabled || uploading ? 0.65 : 1,
        }}
      >
        {uploading ? (
          <>
            <span className="spinner spinner-dark" /> Uploading…
          </>
        ) : (
          `📎 Choose file${maxFiles > 1 ? "s" : ""}`
        )}
        <input
          ref={inputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={field.acceptedTypes ?? undefined}
          style={{ display: "none" }}
          disabled={disabled || uploading}
          onChange={handleFiles}
        />
      </label>

      {err && (
        <p style={{ fontSize: "0.8rem", color: "var(--rose-500)", margin: 0 }}>{err}</p>
      )}

      {urls.map((url, idx) => (
        <div
          key={idx}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.82rem",
            color: "var(--gray-600)",
            background: "var(--gray-50)",
            border: "1px solid var(--gray-200)",
            borderRadius: "0.4rem",
            padding: "0.35rem 0.6rem",
          }}
        >
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            ✓ File {idx + 1} uploaded
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => remove(idx)}
            style={{
              background: "none",
              border: "none",
              color: "var(--rose-500)",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            Remove
          </button>
        </div>
      ))}

      <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>
        Up to {maxFiles} file(s), max {maxSizeMB}MB each.
      </span>
    </div>
  );
}

const RENDERERS: Record<string, (props: FieldRenderProps) => React.ReactElement> = {
  text: TextInput,
  textarea: TextareaInput,
  number: NumberInput,
  date: DateInput,
  rating: RatingInput,
  dropdown: DropdownInput,
  radiogroup: RadioGroupInput,
  boolean: BooleanInput,
  tagbox: TagboxInput,
  file: FileInput,
};

/**
 * Render a single question. Unknown types fall back to a text input so a
 * newly-introduced type never renders as a dead control on a live form.
 *
 * The renderer is invoked as a plain function rather than mounted as a dynamic
 * `<Component />`: treating a looked-up value as a component type makes React
 * see a new type on every render, remounting the input and dropping focus.
 */
export function QuestionRenderer(props: FieldRenderProps) {
  const config = getQuestionType(props.field.fieldType);
  const renderer = (config && RENDERERS[config.value]) || TextInput;
  return renderer(props);
}

/** Initial client-side value for a field, honouring the type's default. */
export function getInitialValue(field: QuestionField): unknown {
  const config = getQuestionType(field.fieldType);
  return config?.getDefaultValue ? config.getDefaultValue() : "";
}
