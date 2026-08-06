/**
 * Server-side helpers for persisting question definitions.
 *
 * Shared by the create (POST /api/events) and update (PATCH /api/events/[id])
 * routes so both accept exactly the same field shape.
 */

import { isKnownQuestionType, getQuestionType } from "@/lib/questions";

export interface IncomingField {
  id?: string;
  label?: string;
  fieldType?: string;
  required?: boolean;
  options?: unknown;
  order?: number;
  placeholder?: string;
  helpText?: string;
  minLength?: number;
  maxLength?: number;
  regex?: string;
  minValue?: number;
  maxValue?: number;
  step?: number;
  scale?: number;
  rateType?: string;
  rows?: unknown;
  columns?: unknown;
  rateValues?: unknown;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedTypes?: string;
  expression?: string;
  readOnly?: boolean;
}

const numOrNull = (v: unknown): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

const strOrNull = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
};

/** Serialize an array-ish payload value into a JSON column string. */
const jsonOrNull = (v: unknown): string | null => {
  if (v === undefined || v === null) return null;
  if (typeof v === "string") return v.trim() === "" ? null : v;
  if (Array.isArray(v)) return v.length ? JSON.stringify(v) : null;
  return JSON.stringify(v);
};

/**
 * Map an incoming payload field onto CustomField columns.
 *
 * Unknown field types fall back to `text` so a malformed or future client
 * payload can never persist a type the renderer cannot handle.
 */
export function toCustomFieldData(field: IncomingField, fallbackOrder: number) {
  const rawType = typeof field.fieldType === "string" ? field.fieldType : "text";
  const fieldType = isKnownQuestionType(rawType) ? rawType : "text";
  const config = getQuestionType(fieldType);

  return {
    label: typeof field.label === "string" ? field.label : "",
    fieldType,
    required: Boolean(field.required),
    // Only choice-style types persist options.
    options: config?.supports.options ? jsonOrNull(field.options) : null,
    order: numOrNull(field.order) ?? fallbackOrder,
    placeholder: strOrNull(field.placeholder),
    helpText: strOrNull(field.helpText),
    minLength: numOrNull(field.minLength),
    maxLength: numOrNull(field.maxLength),
    regex: strOrNull(field.regex),
    minValue: numOrNull(field.minValue),
    maxValue: numOrNull(field.maxValue),
    step: numOrNull(field.step),
    scale: numOrNull(field.scale),
    rateType: strOrNull(field.rateType),
    rows: jsonOrNull(field.rows),
    columns: jsonOrNull(field.columns),
    rateValues: jsonOrNull(field.rateValues),
    maxFiles: numOrNull(field.maxFiles),
    maxFileSize: numOrNull(field.maxFileSize),
    acceptedTypes: strOrNull(field.acceptedTypes),
    expression: strOrNull(field.expression),
    readOnly: Boolean(field.readOnly),
  };
}
