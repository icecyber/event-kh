/**
 * Converts an editor draft into the persisted-field shape the registry
 * renderers expect, so the canvas and preview can reuse the real renderers.
 */

import type { QuestionDraft } from "@/components/QuestionEditor";
import type { QuestionField } from "@/lib/questions";

const num = (v?: string): number | null => {
  if (v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

export function draftToPreviewField(draft: QuestionDraft, idx: number): QuestionField {
  const opts = draft.options
    ? draft.options.split(",").map((o) => o.trim()).filter(Boolean)
    : [];

  return {
    id: draft.id ?? draft._key ?? `preview-${idx}`,
    label: draft.label || "Untitled question",
    fieldType: draft.fieldType,
    required: draft.required,
    options: opts.length ? JSON.stringify(opts) : null,
    order: idx,
    placeholder: draft.placeholder ?? null,
    helpText: draft.helpText ?? null,
    minLength: num(draft.minLength),
    maxLength: num(draft.maxLength),
    regex: draft.regex ?? null,
    minValue: num(draft.minValue),
    maxValue: num(draft.maxValue),
    scale: num(draft.scale),
    rateType: draft.rateType ?? null,
    maxFiles: num(draft.maxFiles),
    maxFileSize: num(draft.maxFileSize),
    acceptedTypes: draft.acceptedTypes ?? null,
  };
}
