"use client";

/**
 * Questions tab — three-column form builder.
 *
 *   Left   : toolbox / component palette
 *   Center : canvas workspace with floating action bar
 *   Right  : property inspector for the selected question
 *
 * Owns question editing exclusively; the Settings tab renders EditEventForm
 * with `showQuestions={false}` so the two cannot overwrite each other.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createEmptyDraft,
  draftToPayload,
  type QuestionDraft,
} from "@/components/QuestionEditor";
import { draftsFromFields } from "@/components/QuestionListEditor";
import { getQuestionType, parseOptions } from "@/lib/questions";
import { QuestionRenderer, getInitialValue } from "@/lib/questions/renderers";
import QuestionToolbox from "@/components/builder/QuestionToolbox";
import QuestionCanvas from "@/components/builder/QuestionCanvas";
import QuestionInspector from "@/components/builder/QuestionInspector";
import { draftToPreviewField } from "@/components/builder/previewField";

interface QuestionsTabEvent {
  id: string;
  customFields: {
    id: string;
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
  }[];
}

export default function QuestionsTab({ event }: { event: QuestionsTabEvent }) {
  const router = useRouter();

  const initial = useMemo(
    () => draftsFromFields(event.customFields ?? [], parseOptions),
    [event.customFields]
  );

  const [fields, setFields] = useState<QuestionDraft[]>(initial);
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, unknown>>({});

  const dirty = useMemo(
    () => JSON.stringify(fields) !== JSON.stringify(initial),
    [fields, initial]
  );

  const mutate = (next: QuestionDraft[]) => {
    setFields(next);
    setSuccess(false);
    setError("");
  };

  // --- Mutations -----------------------------------------------------------

  const addType = (fieldType: string) => {
    const next = [...fields, createEmptyDraft(fieldType)];
    mutate(next);
    setSelected(next.length - 1);
  };

  const insertType = (fieldType: string, at: number) => {
    const clamped = Math.max(0, Math.min(at, fields.length));
    const next = [...fields];
    next.splice(clamped, 0, createEmptyDraft(fieldType));
    mutate(next);
    setSelected(clamped);
  };

  const removeAt = (i: number) => {
    mutate(fields.filter((_, idx) => idx !== i));
    setSelected((cur) => {
      if (cur === null) return null;
      if (cur === i) return null;
      return cur > i ? cur - 1 : cur;
    });
  };

  const duplicateAt = (i: number) => {
    const copy = { ...fields[i] };
    // A duplicate must be a new row, not an update to the original.
    delete copy.id;
    copy._key = `dup-${Date.now()}-${i}`;
    copy.label = copy.label ? `${copy.label} (copy)` : "";
    const next = [...fields];
    next.splice(i + 1, 0, copy);
    mutate(next);
    setSelected(i + 1);
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= fields.length || from === to) return;
    const next = [...fields];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    mutate(next);
    setSelected((cur) => (cur === from ? to : cur));
  };

  const patchSelected = (patch: Partial<QuestionDraft>) => {
    if (selected === null) return;
    const next = [...fields];
    next[selected] = { ...next[selected], ...patch };
    mutate(next);
  };

  // --- Persistence ---------------------------------------------------------

  const handleSave = async () => {
    const unlabeled = fields.findIndex((f) => !f.label.trim());
    if (unlabeled !== -1) {
      setError(`Question #${unlabeled + 1} needs a label.`);
      setSelected(unlabeled);
      return;
    }

    const missingOptions = fields.findIndex(
      (f) =>
        getQuestionType(f.fieldType)?.supports.options &&
        f.options.split(",").map((o) => o.trim()).filter(Boolean).length === 0
    );
    if (missingOptions !== -1) {
      setError(`Question #${missingOptions + 1} needs at least one choice.`);
      setSelected(missingOptions);
      return;
    }

    // multipletext stores its sub-item labels in `rows`; without them the
    // question renders as an empty block on the public form.
    const missingRows = fields.findIndex((f) => {
      if (f.fieldType !== "multipletext") return false;
      try {
        const parsed = JSON.parse(f.rows ?? "[]");
        return !Array.isArray(parsed) || parsed.filter(Boolean).length === 0;
      } catch {
        return true;
      }
    });
    if (missingRows !== -1) {
      setError(`Question #${missingRows + 1} needs at least one sub-item.`);
      setSelected(missingRows);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customFields: fields.map((f, idx) => draftToPayload(f, idx)),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save questions.");
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setFields(initial);
    setSelected(null);
    setError("");
    setSuccess(false);
  };

  const openPreview = () => {
    const seed: Record<string, unknown> = {};
    fields.forEach((f, i) => {
      const pf = draftToPreviewField(f, i);
      seed[pf.id as string] = getInitialValue(pf);
    });
    setPreviewAnswers(seed);
    setPreviewing(true);
  };

  // --- Render --------------------------------------------------------------

  const previewFields = useMemo(
    () => fields.map(draftToPreviewField),
    [fields]
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3 style={{ marginBottom: "0.2rem", color: "var(--gray-900)" }}>
            ❓ Registration Questions
          </h3>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", margin: 0 }}>
            Drag types from the toolbox onto the form, then select a question to
            edit its properties.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => (previewing ? setPreviewing(false) : openPreview())}
          style={{ whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {previewing ? "🧩 Back to builder" : "👁️ Preview form"}
        </button>
      </div>

      {previewing ? (
        <div className="card card-body" style={{ maxWidth: 640 }}>
          <div
            style={{
              marginBottom: "1.25rem",
              paddingBottom: "0.75rem",
              borderBottom: "1px solid var(--gray-100)",
            }}
          >
            <p style={{ fontWeight: 600, color: "var(--gray-800)", margin: 0 }}>
              Attendee view
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--gray-500)", margin: 0 }}>
              How your questions appear on the public registration form. Answers
              entered here are not saved.
            </p>
          </div>

          {previewFields.length === 0 ? (
            <p style={{ color: "var(--gray-400)", fontSize: "0.9rem" }}>
              No questions to preview yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {previewFields.map((f) => (
                <div key={f.id} className="form-group">
                  <label className="form-label">
                    {f.label}
                    {f.required && <span className="req">*</span>}
                  </label>
                  <QuestionRenderer
                    field={f}
                    value={previewAnswers[f.id as string]}
                    onChange={(v) =>
                      setPreviewAnswers((prev) => ({ ...prev, [f.id as string]: v }))
                    }
                    eventId={event.id}
                  />
                  {f.helpText && (
                    <span
                      className="form-hint"
                      style={{ color: "var(--gray-500)", fontSize: "0.8rem" }}
                    >
                      {f.helpText}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="qb-shell">
          <QuestionToolbox onAdd={addType} />

          <div className="qb-col">
            <QuestionCanvas
              fields={fields}
              selectedIndex={selected}
              onSelect={setSelected}
              onRemove={removeAt}
              onDuplicate={duplicateAt}
              onMove={moveItem}
              onInsertType={insertType}
              eventId={event.id}
            />

            {/* Floating action bar */}
            <div className="qb-fab">
              <span className="qb-fab-meta">
                {fields.length} question{fields.length === 1 ? "" : "s"}
                {dirty && <span className="qb-fab-dirty"> · unsaved changes</span>}
              </span>
              <span className="qb-fab-actions">
                {dirty && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleDiscard}
                    disabled={saving}
                  >
                    Discard
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSave}
                  disabled={saving || !dirty}
                  style={{ minWidth: 140, justifyContent: "center" }}
                >
                  {saving ? (
                    <>
                      <span className="spinner" /> Saving…
                    </>
                  ) : (
                    "💾 Save Questions"
                  )}
                </button>
              </span>
            </div>
          </div>

          <QuestionInspector
            draft={selected !== null ? fields[selected] : null}
            index={selected}
            total={fields.length}
            onChange={patchSelected}
            onSelectNone={() => setSelected(null)}
          />
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginTop: "1rem" }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success" style={{ marginTop: "1rem" }}>
          ✅ Questions saved successfully!
        </div>
      )}
    </div>
  );
}
