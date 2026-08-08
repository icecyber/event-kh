"use client";

/**
 * Editable list of registration questions.
 *
 * Extracted so the Questions tab and any other host can reuse the same list UI
 * without duplicating the add / remove / reorder logic.
 */

import QuestionEditor, {
  createEmptyDraft,
  type QuestionDraft,
} from "@/components/QuestionEditor";

export default function QuestionListEditor({
  fields,
  onChange,
}: {
  fields: QuestionDraft[];
  onChange: (next: QuestionDraft[]) => void;
}) {
  const add = () => onChange([...fields, createEmptyDraft()]);
  const remove = (i: number) => onChange(fields.filter((_, idx) => idx !== i));
  const update = (i: number, patch: Partial<QuestionDraft>) => {
    const copy = [...fields];
    copy[i] = { ...copy[i], ...patch };
    onChange(copy);
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= fields.length) return;
    const copy = [...fields];
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    onChange(copy);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {fields.length === 0 ? (
        <div
          style={{
            padding: "1.5rem",
            textAlign: "center",
            border: "2px dashed var(--gray-300)",
            borderRadius: "0.5rem",
            background: "#fff",
            color: "var(--gray-400)",
            fontSize: "0.9rem",
          }}
        >
          No custom questions yet. Attendees only need to provide basic details
          (name, email/phone).
        </div>
      ) : (
        fields.map((f, i) => (
          <QuestionEditor
            key={f.id ?? `new-${i}`}
            draft={f}
            index={i}
            onChange={(patch) => update(i, patch)}
            onRemove={() => remove(i)}
            onMoveUp={() => move(i, i - 1)}
            onMoveDown={() => move(i, i + 1)}
            canMoveUp={i > 0}
            canMoveDown={i < fields.length - 1}
          />
        ))
      )}

      <button
        type="button"
        className="btn btn-secondary"
        onClick={add}
        style={{
          alignSelf: "flex-start",
          marginTop: "0.5rem",
          background: "#fff",
          border: "1px solid var(--gray-300)",
          color: "var(--gray-700)",
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: "0.5rem 1rem",
          fontSize: "0.875rem",
          fontWeight: 600,
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        ➕ Add Question
      </button>
    </div>
  );
}

/** Build editor drafts from persisted CustomField rows. */
export function draftsFromFields(
  customFields: {
    id?: string;
    label: string;
    fieldType: string;
    required: boolean;
    options?: string | null;
    placeholder?: string | null;
    helpText?: string | null;
    minLength?: number | null;
    maxLength?: number | null;
    regex?: string | null;
    minValue?: number | null;
    maxValue?: number | null;
    scale?: number | null;
    rateType?: string | null;
    maxFiles?: number | null;
    maxFileSize?: number | null;
    acceptedTypes?: string | null;
    rows?: string | null;
  }[],
  parseOptions: (o?: string | null) => string[]
): QuestionDraft[] {
  const str = (v?: number | null) => (v == null ? undefined : String(v));
  return (customFields ?? []).map((f) => ({
    id: f.id,
    label: f.label,
    fieldType: f.fieldType,
    required: f.required,
    options: parseOptions(f.options).join(", "),
    placeholder: f.placeholder ?? undefined,
    helpText: f.helpText ?? undefined,
    minLength: str(f.minLength),
    maxLength: str(f.maxLength),
    regex: f.regex ?? undefined,
    minValue: str(f.minValue),
    maxValue: str(f.maxValue),
    scale: str(f.scale),
    rateType: f.rateType ?? undefined,
    maxFiles: str(f.maxFiles),
    maxFileSize: str(f.maxFileSize),
    acceptedTypes: f.acceptedTypes ?? undefined,
    rows: f.rows ?? undefined,
  }));
}
