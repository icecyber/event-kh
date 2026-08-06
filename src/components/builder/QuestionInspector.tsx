"use client";

/**
 * Question builder — right column property inspector.
 *
 * Shows contextual settings for the selected question. Which controls appear
 * is driven entirely by the registry (`supports` + type identity), so a newly
 * registered type gets a sensible inspector with no changes here.
 */

import { getQuestionType, getTypesByCategory } from "@/lib/questions";
import type { QuestionDraft } from "@/components/QuestionEditor";

export default function QuestionInspector({
  draft,
  index,
  total,
  onChange,
  onSelectNone,
}: {
  draft: QuestionDraft | null;
  index: number | null;
  total: number;
  onChange: (patch: Partial<QuestionDraft>) => void;
  onSelectNone: () => void;
}) {
  if (!draft || index === null) {
    return (
      <div className="qb-col">
        <div className="qb-col-head">
          <span>Properties</span>
        </div>
        <div className="qb-col-body">
          <div className="qb-insp-empty">
            <div style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>👈</div>
            {total === 0
              ? "Add a question from the toolbox, then select it to edit its properties."
              : "Select a question on the form to edit its properties."}
          </div>
        </div>
      </div>
    );
  }

  const config = getQuestionType(draft.fieldType);
  const validation = config?.supports.validation ?? [];
  const options = draft.options
    ? draft.options.split(",").map((o) => o.trim())
    : [];

  const setOptions = (next: string[]) =>
    onChange({ options: next.join(", ") });

  return (
    <div className="qb-col">
      <div className="qb-col-head">
        <span>Properties</span>
        <button
          type="button"
          className="qb-icon-btn"
          title="Deselect"
          onClick={onSelectNone}
        >
          ✕
        </button>
      </div>

      <div className="qb-col-body">
        {/* Identity */}
        <div className="qb-insp-section">
          <div className="qb-insp-section-label">
            {config?.icon} Question {index + 1} · {config?.label ?? draft.fieldType}
          </div>

          <div className="qb-insp-row">
            <label className="qb-insp-label">Label</label>
            <input
              className="form-input"
              value={draft.label}
              onChange={(e) => onChange({ label: e.target.value })}
              placeholder="e.g. Dietary Requirements"
            />
            {!draft.label.trim() && (
              <p className="qb-insp-hint" style={{ color: "var(--rose-500)" }}>
                A label is required before saving.
              </p>
            )}
          </div>

          <div className="qb-insp-row">
            <label className="qb-insp-label">Type</label>
            <select
              className="form-select"
              value={config?.value ?? draft.fieldType}
              onChange={(e) => {
                const next = getQuestionType(e.target.value);
                onChange({
                  fieldType: e.target.value,
                  // Seed defaults so newly revealed settings are never blank.
                  scale: next?.defaultProps?.scale?.toString() ?? draft.scale,
                  rateType: next?.defaultProps?.rateType ?? draft.rateType,
                  maxFiles: next?.defaultProps?.maxFiles?.toString() ?? draft.maxFiles,
                  maxFileSize:
                    next?.defaultProps?.maxFileSize?.toString() ?? draft.maxFileSize,
                  acceptedTypes:
                    next?.defaultProps?.acceptedTypes ?? draft.acceptedTypes,
                  options:
                    next?.supports.options && !draft.options
                      ? "Option 1, Option 2"
                      : draft.options,
                });
              }}
            >
              {getTypeOptions()}
            </select>
          </div>

          <label className="qb-insp-check">
            <input
              type="checkbox"
              checked={draft.required}
              onChange={(e) => onChange({ required: e.target.checked })}
              style={{ accentColor: "var(--brand-600)", width: 15, height: 15 }}
            />
            Required question
          </label>
        </div>

        {/* Options editor for choice types */}
        {config?.supports.options && (
          <div className="qb-insp-section">
            <div className="qb-insp-section-label">Choices</div>
            {options.length === 0 && (
              <p className="qb-insp-hint" style={{ color: "var(--rose-500)" }}>
                Add at least one choice.
              </p>
            )}
            {options.map((opt, i) => (
              <div className="qb-opt-row" key={i}>
                <input
                  className="form-input"
                  value={opt}
                  onChange={(e) => {
                    const next = [...options];
                    next[i] = e.target.value;
                    setOptions(next);
                  }}
                  placeholder={`Choice ${i + 1}`}
                />
                <button
                  type="button"
                  className="qb-icon-btn danger"
                  title="Remove choice"
                  onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ marginTop: "0.2rem", fontSize: "0.78rem" }}
              onClick={() => setOptions([...options, `Option ${options.length + 1}`])}
            >
              ➕ Add choice
            </button>
          </div>
        )}

        {/* Rating-specific */}
        {draft.fieldType === "rating" && (
          <div className="qb-insp-section">
            <div className="qb-insp-section-label">Rating</div>
            <div className="qb-insp-row">
              <label className="qb-insp-label">Scale</label>
              <div className="qb-seg">
                {["5", "10"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={(draft.scale ?? "5") === s ? "active" : ""}
                    onClick={() => onChange({ scale: s })}
                  >
                    1–{s}
                  </button>
                ))}
              </div>
            </div>
            <div className="qb-insp-row">
              <label className="qb-insp-label">Style</label>
              <div className="qb-seg">
                {[
                  { v: "star", l: "★" },
                  { v: "emoji", l: "😀" },
                  { v: "number", l: "123" },
                ].map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    className={(draft.rateType ?? "star") === o.v ? "active" : ""}
                    onClick={() => onChange({ rateType: o.v })}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* File-specific */}
        {draft.fieldType === "file" && (
          <div className="qb-insp-section">
            <div className="qb-insp-section-label">File upload</div>
            <div className="qb-insp-grid2">
              <div className="qb-insp-row">
                <label className="qb-insp-label">Max files</label>
                <input
                  type="number"
                  min={1}
                  className="form-input"
                  value={draft.maxFiles ?? "1"}
                  onChange={(e) => onChange({ maxFiles: e.target.value })}
                />
              </div>
              <div className="qb-insp-row">
                <label className="qb-insp-label">Max MB</label>
                <input
                  type="number"
                  min={1}
                  max={2}
                  className="form-input"
                  value={draft.maxFileSize ?? "2"}
                  onChange={(e) => onChange({ maxFileSize: e.target.value })}
                />
              </div>
            </div>
            <div className="qb-insp-row">
              <label className="qb-insp-label">Accepted types</label>
              <input
                className="form-input"
                value={draft.acceptedTypes ?? ""}
                onChange={(e) => onChange({ acceptedTypes: e.target.value })}
                placeholder="image/*"
              />
              <p className="qb-insp-hint">Server limit is 2MB per file.</p>
            </div>
          </div>
        )}

        {/* Display */}
        <div className="qb-insp-section">
          <div className="qb-insp-section-label">Display</div>
          {config?.supports.placeholder && (
            <div className="qb-insp-row">
              <label className="qb-insp-label">Placeholder</label>
              <input
                className="form-input"
                value={draft.placeholder ?? ""}
                onChange={(e) => onChange({ placeholder: e.target.value })}
              />
            </div>
          )}
          <div className="qb-insp-row">
            <label className="qb-insp-label">Help text</label>
            <input
              className="form-input"
              value={draft.helpText ?? ""}
              onChange={(e) => onChange({ helpText: e.target.value })}
              placeholder="Shown beneath the question"
            />
          </div>
        </div>

        {/* Validation */}
        {validation.length > 0 && (
          <div className="qb-insp-section">
            <div className="qb-insp-section-label">Validation</div>

            {(validation.includes("minLength") || validation.includes("maxLength")) && (
              <div className="qb-insp-grid2">
                <div className="qb-insp-row">
                  <label className="qb-insp-label">Min length</label>
                  <input
                    type="number"
                    min={0}
                    className="form-input"
                    value={draft.minLength ?? ""}
                    onChange={(e) => onChange({ minLength: e.target.value })}
                  />
                </div>
                <div className="qb-insp-row">
                  <label className="qb-insp-label">Max length</label>
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
              <div className="qb-insp-grid2">
                <div className="qb-insp-row">
                  <label className="qb-insp-label">Min value</label>
                  <input
                    type="number"
                    className="form-input"
                    value={draft.minValue ?? ""}
                    onChange={(e) => onChange({ minValue: e.target.value })}
                  />
                </div>
                <div className="qb-insp-row">
                  <label className="qb-insp-label">Max value</label>
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
              <div className="qb-insp-row">
                <label className="qb-insp-label">Pattern (regex)</label>
                <input
                  className="form-input"
                  value={draft.regex ?? ""}
                  onChange={(e) => onChange({ regex: e.target.value })}
                  placeholder="^[A-Z]{2}\d{4}$"
                />
                <p className="qb-insp-hint">
                  Invalid patterns are ignored at submission time.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Grouped <optgroup> list of every registered type. */
function getTypeOptions() {
  return getTypesByCategory().map((g) => (
    <optgroup key={g.category} label={g.label}>
      {g.types.map((t) => (
        <option key={t.value} value={t.value}>
          {t.icon} {t.label}
        </option>
      ))}
    </optgroup>
  ));
}
