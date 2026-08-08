"use client";

/**
 * Client-only renderers for registered question types.
 *
 * Kept separate from `registry.ts` so that server route handlers can use the
 * registry for validation and persistence without pulling React into the
 * server bundle.
 */

import { useRef, useState } from "react";
import { getQuestionType, parseOptions, parseJsonArray, type QuestionField } from "./index";

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

// --- Phase 2 renderers ----------------------------------------------------

function TimeInput({ field, value, onChange, disabled }: FieldRenderProps) {
  return (
    <input
      type="time"
      className="form-input"
      value={(value as string) ?? ""}
      required={field.required}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function DateTimeInput({ field, value, onChange, disabled }: FieldRenderProps) {
  return (
    <input
      type="datetime-local"
      className="form-input"
      value={(value as string) ?? ""}
      required={field.required}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function RankingInput({ field, value, onChange, disabled }: FieldRenderProps) {
  const opts = parseOptions(field.options);
  // Start from any saved order, then append choices not yet ranked.
  const current: string[] = Array.isArray(value) ? (value as string[]) : [];
  const ordered = [
    ...current.filter((v) => opts.includes(v)),
    ...opts.filter((o) => !current.includes(o)),
  ];

  const move = (from: number, to: number) => {
    if (disabled || to < 0 || to >= ordered.length) return;
    const next = [...ordered];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange(next);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      {ordered.map((opt, i) => (
        <div
          key={opt}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.5rem 0.7rem",
            border: "1.5px solid var(--gray-200)",
            borderRadius: "0.5rem",
            background: "#fff",
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              flexShrink: 0,
              borderRadius: "50%",
              background: "var(--brand-600)",
              color: "#fff",
              fontSize: "0.72rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {i + 1}
          </span>
          <span style={{ flex: 1, color: "var(--gray-700)", fontSize: "0.9rem" }}>
            {opt}
          </span>
          <button
            type="button"
            disabled={disabled || i === 0}
            onClick={() => move(i, i - 1)}
            aria-label={`Move ${opt} up`}
            style={{
              border: "none",
              background: "none",
              cursor: disabled || i === 0 ? "not-allowed" : "pointer",
              opacity: i === 0 ? 0.3 : 1,
              color: "var(--gray-500)",
              padding: "0.1rem 0.3rem",
            }}
          >
            ↑
          </button>
          <button
            type="button"
            disabled={disabled || i === ordered.length - 1}
            onClick={() => move(i, i + 1)}
            aria-label={`Move ${opt} down`}
            style={{
              border: "none",
              background: "none",
              cursor:
                disabled || i === ordered.length - 1 ? "not-allowed" : "pointer",
              opacity: i === ordered.length - 1 ? 0.3 : 1,
              color: "var(--gray-500)",
              padding: "0.1rem 0.3rem",
            }}
          >
            ↓
          </button>
        </div>
      ))}
      {ordered.length === 0 && (
        <p style={{ fontSize: "0.82rem", color: "var(--gray-400)", margin: 0 }}>
          No items to rank.
        </p>
      )}
    </div>
  );
}

function ImagePickerInput({ field, value, onChange, disabled }: FieldRenderProps) {
  const labels = parseOptions(field.options);
  const images = parseJsonArray<string>(field.rows);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
        gap: "0.6rem",
      }}
    >
      {labels.map((label, i) => {
        const src = images[i];
        const active = value === label;
        return (
          <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={() => onChange(active ? "" : label)}
            style={{
              padding: 0,
              overflow: "hidden",
              cursor: disabled ? "not-allowed" : "pointer",
              border: `2px solid ${active ? "var(--brand-600)" : "var(--gray-200)"}`,
              borderRadius: "0.6rem",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                height: 74,
                background: "var(--gray-100)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={label}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: "1.4rem", opacity: 0.4 }}>🖼️</span>
              )}
            </span>
            <span
              style={{
                padding: "0.35rem 0.4rem",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: active ? "var(--brand-700)" : "var(--gray-600)",
                textAlign: "center",
              }}
            >
              {active ? "✓ " : ""}
              {label}
            </span>
          </button>
        );
      })}
      {labels.length === 0 && (
        <p style={{ fontSize: "0.82rem", color: "var(--gray-400)", margin: 0 }}>
          No images configured.
        </p>
      )}
    </div>
  );
}

function MultipleTextInput({ field, value, onChange, disabled }: FieldRenderProps) {
  const items = parseJsonArray<string>(field.rows);
  const answers = (value ?? {}) as Record<string, string>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {items.map((label) => (
        <div
          key={label}
          style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
        >
          <span
            style={{
              minWidth: 110,
              fontSize: "0.83rem",
              color: "var(--gray-600)",
              fontWeight: 500,
            }}
          >
            {label}
          </span>
          <input
            className="form-input"
            style={{ flex: 1 }}
            value={answers[label] ?? ""}
            placeholder={field.placeholder ?? ""}
            disabled={disabled}
            onChange={(e) => onChange({ ...answers, [label]: e.target.value })}
          />
        </div>
      ))}
      {items.length === 0 && (
        <p style={{ fontSize: "0.82rem", color: "var(--gray-400)", margin: 0 }}>
          No sub-items configured.
        </p>
      )}
    </div>
  );
}

function SignaturePadInput({ value, onChange, disabled }: FieldRenderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    // Map CSS pixels to the canvas backing-store resolution.
    return {
      x: ((e.clientX - r.left) / r.width) * c.width,
      y: ((e.clientY - r.top) / r.height) * c.height,
    };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    const { x, y } = pos(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.beginPath();
    ctx.moveTo(x, y);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || disabled) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const c = canvasRef.current;
    if (c) onChange(c.toDataURL("image/png"));
  };

  const clear = () => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
    onChange("");
  };

  const signed = typeof value === "string" && value.startsWith("data:image/");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <canvas
        ref={canvasRef}
        width={520}
        height={160}
        onPointerDown={start}
        onPointerMove={draw}
        onPointerUp={end}
        onPointerLeave={end}
        style={{
          width: "100%",
          height: 160,
          border: "1.5px dashed var(--gray-300)",
          borderRadius: "0.5rem",
          background: "#fff",
          touchAction: "none",
          cursor: disabled ? "not-allowed" : "crosshair",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={clear}
          disabled={disabled}
          style={{ fontSize: "0.78rem" }}
        >
          Clear
        </button>
        <span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>
          {signed ? "✓ Signature captured" : "Sign above using your mouse or finger."}
        </span>
      </div>
    </div>
  );
}

// --- Phase 3 renderers ----------------------------------------------------

function MatrixInput({ field, value, onChange, disabled }: FieldRenderProps) {
  const rows = parseJsonArray<{ value: string; text: string }>(field.rows);
  const cols = parseJsonArray<{ value: string; text: string }>(field.columns);
  const answers = (value ?? {}) as Record<string, Record<string, string>>;

  const handleChange = (rowKey: string, colKey: string, val: string) => {
    if (disabled) return;
    const next = { ...answers };
    if (!next[rowKey]) next[rowKey] = {};
    next[rowKey][colKey] = val;
    onChange(next);
  };

  if (!rows.length || !cols.length) {
    return (
      <p style={{ fontSize: "0.82rem", color: "var(--gray-400)", margin: 0 }}>
        Configure rows and columns in the inspector.
      </p>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
        <thead>
          <tr>
            <th style={{ padding: "0.4rem 0.6rem", textAlign: "left", borderBottom: "1px solid var(--gray-200)", fontWeight: 600, color: "var(--gray-600)", minWidth: 120 }}></th>
            {cols.map((c) => (
              <th key={c.value} style={{ padding: "0.4rem 0.6rem", textAlign: "left", borderBottom: "1px solid var(--gray-200)", fontWeight: 600, color: "var(--gray-600)", minWidth: 120 }}>
                {c.text}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.value}>
              <td style={{ padding: "0.4rem 0.6rem", borderBottom: "1px solid var(--gray-100)", fontWeight: 500, color: "var(--gray-700)", whiteSpace: "nowrap" }}>
                {r.text}
              </td>
              {cols.map((c) => (
                <td key={c.value} style={{ padding: "0.2rem 0.6rem", borderBottom: "1px solid var(--gray-100)" }}>
                  <input
                    className="form-input"
                    style={{ width: "100%", minWidth: 100, padding: "0.3rem 0.5rem", fontSize: "0.82rem" }}
                    value={answers[r.value]?.[c.value] ?? ""}
                    onChange={(e) => handleChange(r.value, c.value, e.target.value)}
                    disabled={disabled}
                    placeholder={c.text}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MatrixDropdownInput({ field, value, onChange, disabled }: FieldRenderProps) {
  const rows = parseJsonArray<{ value: string; text: string }>(field.rows);
  const cols = parseJsonArray<{ value: string; text: string; choices?: string[] }>(field.columns);
  const answers = (value ?? {}) as Record<string, Record<string, string>>;

  const handleChange = (rowKey: string, colKey: string, val: string) => {
    if (disabled) return;
    const next = { ...answers };
    if (!next[rowKey]) next[rowKey] = {};
    next[rowKey][colKey] = val;
    onChange(next);
  };

  if (!rows.length || !cols.length) {
    return (
      <p style={{ fontSize: "0.82rem", color: "var(--gray-400)", margin: 0 }}>
        Configure rows and columns in the inspector.
      </p>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
        <thead>
          <tr>
            <th style={{ padding: "0.4rem 0.6rem", textAlign: "left", borderBottom: "1px solid var(--gray-200)", fontWeight: 600, color: "var(--gray-600)", minWidth: 120 }}></th>
            {cols.map((c) => (
              <th key={c.value} style={{ padding: "0.4rem 0.6rem", textAlign: "left", borderBottom: "1px solid var(--gray-200)", fontWeight: 600, color: "var(--gray-600)", minWidth: 140 }}>
                {c.text}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.value}>
              <td style={{ padding: "0.4rem 0.6rem", borderBottom: "1px solid var(--gray-100)", fontWeight: 500, color: "var(--gray-700)", whiteSpace: "nowrap" }}>
                {r.text}
              </td>
              {cols.map((c) => {
                const choices = c.choices ?? [];
                return (
                  <td key={c.value} style={{ padding: "0.2rem 0.6rem", borderBottom: "1px solid var(--gray-100)" }}>
                    <select
                      className="form-select"
                      style={{ width: "100%", minWidth: 120, padding: "0.3rem 0.5rem", fontSize: "0.82rem" }}
                      value={answers[r.value]?.[c.value] ?? ""}
                      onChange={(e) => handleChange(r.value, c.value, e.target.value)}
                      disabled={disabled}
                    >
                      <option value="">Select…</option>
                      {choices.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MatrixDynamicInput({ field, value, onChange, disabled }: FieldRenderProps) {
  const cols = parseJsonArray<{ value: string; text: string; choices?: string[] }>(field.columns);
  const answers: Record<string, string>[] = Array.isArray(value) ? value : [];

  const handleCellChange = (rowIdx: number, colKey: string, val: string) => {
    if (disabled) return;
    const next = [...answers];
    if (!next[rowIdx]) next[rowIdx] = {};
    next[rowIdx][colKey] = val;
    onChange(next);
  };

  const addRow = () => {
    if (disabled) return;
    onChange([...answers, {}]);
  };

  const removeRow = (idx: number) => {
    if (disabled) return;
    onChange(answers.filter((_, i) => i !== idx));
  };

  if (!cols.length) {
    return (
      <p style={{ fontSize: "0.82rem", color: "var(--gray-400)", margin: 0 }}>
        Configure columns in the inspector.
      </p>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
        <thead>
          <tr>
            <th style={{ padding: "0.4rem 0.6rem", textAlign: "left", borderBottom: "1px solid var(--gray-200)", fontWeight: 600, color: "var(--gray-600)", width: 36 }}></th>
            {cols.map((c) => (
              <th key={c.value} style={{ padding: "0.4rem 0.6rem", textAlign: "left", borderBottom: "1px solid var(--gray-200)", fontWeight: 600, color: "var(--gray-600)", minWidth: 140 }}>
                {c.text}
              </th>
            ))}
            <th style={{ padding: "0.4rem 0.6rem", textAlign: "left", borderBottom: "1px solid var(--gray-200)", fontWeight: 600, color: "var(--gray-600)", width: 48 }}></th>
          </tr>
        </thead>
        <tbody>
          {answers.length === 0 ? (
            <tr>
              <td colSpan={cols.length + 2} style={{ padding: "1.5rem", textAlign: "center", color: "var(--gray-400)" }}>
                No rows yet. Click &quot;Add row&quot; to start.
              </td>
            </tr>
          ) : (
            answers.map((row, i) => (
              <tr key={i}>
                <td style={{ padding: "0.4rem 0.6rem", borderBottom: "1px solid var(--gray-100)", fontWeight: 600, color: "var(--gray-600)", textAlign: "center" }}>
                  {i + 1}
                </td>
                {cols.map((c) => {
                  const choices = c.choices ?? [];
                  return (
                    <td key={c.value} style={{ padding: "0.2rem 0.6rem", borderBottom: "1px solid var(--gray-100)" }}>
                      <select
                        className="form-select"
                        style={{ width: "100%", minWidth: 120, padding: "0.3rem 0.5rem", fontSize: "0.82rem" }}
                        value={row[c.value] ?? ""}
                        onChange={(e) => handleCellChange(i, c.value, e.target.value)}
                        disabled={disabled}
                      >
                        <option value="">Select…</option>
                        {choices.map((opt, j) => (
                          <option key={j} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                  );
                })}
                <td style={{ padding: "0.2rem 0.6rem", borderBottom: "1px solid var(--gray-100)", textAlign: "center" }}>
                  <button
                    type="button"
                    className="qb-icon-btn danger"
                    title="Remove row"
                    aria-label={`Remove row ${i + 1}`}
                    disabled={disabled}
                    onClick={() => removeRow(i)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        style={{ marginTop: "0.6rem" }}
        onClick={addRow}
        disabled={disabled}
      >
        ➕ Add row
      </button>
    </div>
  );
}

function PanelInput() {
  return (
    <div
      style={{
        padding: "1rem",
        border: "1px solid var(--gray-200)",
        borderRadius: "0.75rem",
        background: "var(--gray-50)",
      }}
    >
      <p style={{ fontSize: "0.82rem", color: "var(--gray-400)", margin: 0 }}>
        Static panel — no answer collected. Nested fields render inside on the
        public form (future enhancement).
      </p>
    </div>
  );
}

function PanelDynamicInput({ field, value, onChange, disabled }: FieldRenderProps) {
  const template = parseJsonArray<{ value: string; text?: string; label?: string; placeholder?: string }>(field.rows);
  const instances: Record<string, unknown>[] = Array.isArray(value) ? value : [];

  const handleChange = (idx: number, fieldName: string, val: unknown) => {
    if (disabled) return;
    const next = [...instances];
    if (!next[idx]) next[idx] = {};
    next[idx][fieldName] = val;
    onChange(next);
  };

  const addInstance = () => onChange([...instances, {}]);
  const removeInstance = (idx: number) => onChange(instances.filter((_, i) => i !== idx));

  if (!template.length) {
    return (
      <p style={{ fontSize: "0.82rem", color: "var(--gray-400)", margin: 0 }}>
        Configure template fields in the inspector.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {instances.map((instance, i) => (
        <div
          key={i}
          style={{
            padding: "1rem",
            border: "1.5px solid var(--gray-200)",
            borderRadius: "0.75rem",
            background: "#fff",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontWeight: 600, color: "var(--gray-800)" }}>Instance {i + 1}</span>
            <button
              type="button"
              className="qb-icon-btn danger"
              title="Remove instance"
              aria-label={`Remove instance ${i + 1}`}
              disabled={disabled}
              onClick={() => removeInstance(i)}
            >
              ✕
            </button>
          </div>
          {template.map((f, j) => (
            <div key={j} className="form-group" style={{ marginBottom: "0.5rem" }}>
              <label className="form-label" style={{ fontSize: "0.85rem" }}>
                {f.text || f.label || `Field ${j + 1}`}
              </label>
              <input
                className="form-input"
                style={{ fontSize: "0.85rem" }}
                value={String((instance as Record<string, unknown>)[f.value ?? `field_${j}`] ?? "")}
                onChange={(e) => handleChange(i, f.value ?? `field_${j}`, e.target.value)}
                disabled={disabled}
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>
      ))}
      {instances.length === 0 && (
        <p style={{ fontSize: "0.82rem", color: "var(--gray-400)", margin: 0 }}>
          No instances yet. Click &quot;Add instance&quot; to start.
        </p>
      )}
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={addInstance}
        disabled={disabled}
      >
        ➕ Add instance
      </button>
    </div>
  );
}

function ExpressionInput({ field, value, disabled }: FieldRenderProps) {
  const formula = field.expression ?? "";
  const result = typeof value === "string" ? value : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div className="form-group">
        <label className="form-label">Formula</label>
        <code
          style={{
            display: "block",
            padding: "0.6rem 0.8rem",
            background: "var(--gray-100)",
            borderRadius: "0.4rem",
            fontSize: "0.82rem",
            color: "var(--brand-700)",
            fontFamily: "monospace",
            wordBreak: "break-all",
          }}
        >
          {formula || "(no formula)"}
        </code>
      </div>
      <div className="form-group">
        <label className="form-label">Computed Value</label>
        <div
          style={{
            padding: "0.6rem 0.8rem",
            background: disabled ? "var(--gray-50)" : "var(--brand-50)",
            borderRadius: "0.4rem",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: result ? "var(--brand-700)" : "var(--gray-400)",
            fontFamily: "monospace",
          }}
        >
          {result || "(not computed yet)"}
        </div>
      </div>
    </div>
  );
}

const RENDERERS: Record<string, (props: FieldRenderProps) => React.ReactElement> = {
  text: TextInput,
  textarea: TextareaInput,
  number: NumberInput,
  date: DateInput,
  time: TimeInput,
  datetime: DateTimeInput,
  rating: RatingInput,
  dropdown: DropdownInput,
  radiogroup: RadioGroupInput,
  boolean: BooleanInput,
  tagbox: TagboxInput,
  ranking: RankingInput,
  imagepicker: ImagePickerInput,
  multipletext: MultipleTextInput,
  signaturepad: SignaturePadInput,
  file: FileInput,
  matrix: MatrixInput,
  matrixdropdown: MatrixDropdownInput,
  matrixdynamic: MatrixDynamicInput,
  panel: PanelInput,
  paneldynamic: PanelDynamicInput,
  expression: ExpressionInput,
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
