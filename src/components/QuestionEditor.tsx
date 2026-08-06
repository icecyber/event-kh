"use client";

/**
 * Shared organizer-side editor for a single registration question.
 *
 * Used by both the create-event wizard and the edit-event form so the type
 * selector and per-type settings have exactly one implementation.
 */

import { useState } from "react";
import {
  getQuestionType,
  getTypesByCategory,
  type QuestionCategory,
} from "@/lib/questions";

/** Editor-local shape: `options` is a comma-separated string while editing. */
export interface QuestionDraft {
  id?: string;
  /**
   * Client-only stable identity for drafts not yet persisted, so React keys
   * stay stable across reorders and the inspector keeps focus.
   */
  _key?: string;
  label: string;
  fieldType: string;
  required: boolean;
  options: string;
  placeholder?: string;
  helpText?: string;
  minLength?: string;
  maxLength?: string;
  regex?: string;
  minValue?: string;
  maxValue?: string;
  scale?: string;
  rateType?: string;
  maxFiles?: string;
  maxFileSize?: string;
  acceptedTypes?: string;
}

let draftSeq = 0;

export function createEmptyDraft(fieldType = "text"): QuestionDraft {
  draftSeq += 1;
  const config = getQuestionType(fieldType);
  const dp = config?.defaultProps;
  return {
    _key: `draft-${Date.now()}-${draftSeq}`,
    label: "",
    fieldType,
    required: false,
    options: config?.supports.options ? "Option 1, Option 2" : "",
    scale: dp?.scale != null ? String(dp.scale) : undefined,
    rateType: dp?.rateType ?? undefined,
    maxFiles: dp?.maxFiles != null ? String(dp.maxFiles) : undefined,
    maxFileSize: dp?.maxFileSize != null ? String(dp.maxFileSize) : undefined,
    acceptedTypes: dp?.acceptedTypes ?? undefined,
  };
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 700,
  color: "var(--gray-500)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "0.35rem",
};

export default function QuestionEditor({
  draft,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  draft: QuestionDraft;
  index: number;
  onChange: (patch: Partial<QuestionDraft>) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const config = getQuestionType(draft.fieldType);
  const groups = getTypesByCategory();
  const validation = config?.supports.validation ?? [];

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--gray-200)",
        borderRadius: "0.75rem",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h5 style={{ color: "var(--gray-700)", fontWeight: 600, margin: 0 }}>
          {config?.icon ?? "❓"} Question #{index + 1}
        </h5>
        <div style={{ display: "flex", gap: "0.35rem" }}>
          {onMoveUp && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
              disabled={!canMoveUp}
              onClick={onMoveUp}
              aria-label="Move question up"
            >
              ↑
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
              disabled={!canMoveDown}
              onClick={onMoveDown}
              aria-label="Move question down"
            >
              ↓
            </button>
          )}
          <button
            type="button"
            className="btn btn-danger btn-sm"
            style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
            onClick={onRemove}
          >
            🗑️ Remove
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem" }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={labelStyle}>
            Question Label <span className="req">*</span>
          </label>
          <input
            className="form-input"
            value={draft.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="e.g. Dietary Requirements"
          />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={labelStyle}>
            Type
          </label>
          <select
            className="form-select"
            value={getQuestionType(draft.fieldType)?.value ?? draft.fieldType}
            onChange={(e) => {
              const next = getQuestionType(e.target.value);
              // Seed the type's defaults so new settings are never blank.
              onChange({
                fieldType: e.target.value,
                scale: next?.defaultProps?.scale?.toString() ?? draft.scale,
                rateType: next?.defaultProps?.rateType ?? draft.rateType,
                maxFiles: next?.defaultProps?.maxFiles?.toString() ?? draft.maxFiles,
                maxFileSize:
                  next?.defaultProps?.maxFileSize?.toString() ?? draft.maxFileSize,
                acceptedTypes:
                  next?.defaultProps?.acceptedTypes ?? draft.acceptedTypes,
              });
            }}
          >
            {groups.map((group) => (
              <optgroup key={group.category as QuestionCategory} label={group.label}>
                {group.types.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {config?.supports.options && (
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={labelStyle}>
            Options (comma-separated)
          </label>
          <input
            className="form-input"
            value={draft.options}
            onChange={(e) => onChange({ options: e.target.value })}
            placeholder="Option 1, Option 2, Option 3"
          />
        </div>
      )}

      {draft.fieldType === "rating" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={labelStyle}>
              Scale
            </label>
            <select
              className="form-select"
              value={draft.scale ?? "5"}
              onChange={(e) => onChange({ scale: e.target.value })}
            >
              <option value="5">1 – 5</option>
              <option value="10">1 – 10</option>
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={labelStyle}>
              Style
            </label>
            <select
              className="form-select"
              value={draft.rateType ?? "star"}
              onChange={(e) => onChange({ rateType: e.target.value })}
            >
              <option value="star">★ Stars</option>
              <option value="emoji">😀 Emoji</option>
              <option value="number">Numbers</option>
            </select>
          </div>
        </div>
      )}

      {draft.fieldType === "file" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={labelStyle}>
              Max files
            </label>
            <input
              type="number"
              min={1}
              className="form-input"
              value={draft.maxFiles ?? "1"}
              onChange={(e) => onChange({ maxFiles: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={labelStyle}>
              Max size (MB)
            </label>
            <input
              type="number"
              min={1}
              max={2}
              className="form-input"
              value={draft.maxFileSize ?? "2"}
              onChange={(e) => onChange({ maxFileSize: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={labelStyle}>
              Accepted types
            </label>
            <input
              className="form-input"
              value={draft.acceptedTypes ?? ""}
              onChange={(e) => onChange({ acceptedTypes: e.target.value })}
              placeholder="image/*"
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        style={{
          alignSelf: "flex-start",
          background: "none",
          border: "none",
          color: "var(--brand-600)",
          fontSize: "0.8rem",
          fontWeight: 600,
          cursor: "pointer",
          padding: 0,
        }}
      >
        {showAdvanced ? "▾ Hide advanced settings" : "▸ Advanced settings"}
      </button>

      {showAdvanced && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            padding: "0.85rem",
            background: "var(--gray-50)",
            border: "1px solid var(--gray-200)",
            borderRadius: "0.5rem",
          }}
        >
          {config?.supports.placeholder && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={labelStyle}>
                Placeholder
              </label>
              <input
                className="form-input"
                value={draft.placeholder ?? ""}
                onChange={(e) => onChange({ placeholder: e.target.value })}
              />
            </div>
          )}

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={labelStyle}>
              Help text
            </label>
            <input
              className="form-input"
              value={draft.helpText ?? ""}
              onChange={(e) => onChange({ helpText: e.target.value })}
              placeholder="Shown beneath the question"
            />
          </div>

          {(validation.includes("minLength") || validation.includes("maxLength")) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={labelStyle}>
                  Min length
                </label>
                <input
                  type="number"
                  min={0}
                  className="form-input"
                  value={draft.minLength ?? ""}
                  onChange={(e) => onChange({ minLength: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={labelStyle}>
                  Max length
                </label>
                <input
                  type="number"
                  min={0}
                  className="form-input"
                  value={draft.maxLength ?? ""}
                  onChange={(e) => onChange({ maxLength: e.target.value })}
                />
              </div>
            </div>
          )}

          {(validation.includes("min") || validation.includes("max")) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={labelStyle}>
                  Min value
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={draft.minValue ?? ""}
                  onChange={(e) => onChange({ minValue: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={labelStyle}>
                  Max value
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={draft.maxValue ?? ""}
                  onChange={(e) => onChange({ maxValue: e.target.value })}
                />
              </div>
            </div>
          )}

          {validation.includes("regex") && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={labelStyle}>
                Pattern (regex)
              </label>
              <input
                className="form-input"
                value={draft.regex ?? ""}
                onChange={(e) => onChange({ regex: e.target.value })}
                placeholder="^[A-Z]{2}\\d{4}$"
              />
            </div>
          )}
        </div>
      )}

      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          cursor: "pointer",
          fontSize: "0.85rem",
          alignSelf: "flex-start",
        }}
      >
        <input
          type="checkbox"
          checked={draft.required}
          onChange={(e) => onChange({ required: e.target.checked })}
          style={{ accentColor: "var(--brand-600)", width: 16, height: 16 }}
        />
        <span style={{ color: "var(--gray-600)", fontWeight: 500 }}>Required question</span>
      </label>
    </div>
  );
}

/** Convert an editor draft into the API payload shape. */
export function draftToPayload(draft: QuestionDraft, order: number) {
  const config = getQuestionType(draft.fieldType);
  const num = (v?: string) => {
    if (v === undefined || v === "") return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  };

  return {
    id: draft.id,
    label: draft.label,
    fieldType: draft.fieldType,
    required: draft.required,
    options:
      config?.supports.options && draft.options
        ? draft.options.split(",").map((o) => o.trim()).filter(Boolean)
        : undefined,
    order,
    placeholder: draft.placeholder || undefined,
    helpText: draft.helpText || undefined,
    minLength: num(draft.minLength),
    maxLength: num(draft.maxLength),
    regex: draft.regex || undefined,
    minValue: num(draft.minValue),
    maxValue: num(draft.maxValue),
    scale: num(draft.scale),
    rateType: draft.rateType || undefined,
    maxFiles: num(draft.maxFiles),
    maxFileSize: num(draft.maxFileSize),
    acceptedTypes: draft.acceptedTypes || undefined,
  };
}
