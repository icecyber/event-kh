/**
 * Pluggable question type registry.
 *
 * This module is intentionally free of React and Prisma imports so it can be
 * used from both server route handlers (validation, persistence, export) and
 * client components (organizer builder, registration renderer).
 *
 * Rendering lives in `./renderers.tsx`, which is client-only.
 */

export type QuestionCategory = "input" | "choice" | "advanced" | "layout";

export type ValidationRule =
  | "minLength"
  | "maxLength"
  | "regex"
  | "min"
  | "max";

/** The persisted shape of a question, mirroring the CustomField model. */
export interface QuestionField {
  id?: string;
  label: string;
  fieldType: string;
  required?: boolean;
  options?: string | null;
  order?: number;
  placeholder?: string | null;
  helpText?: string | null;
  minLength?: number | null;
  maxLength?: number | null;
  regex?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  step?: number | null;
  scale?: number | null;
  rateType?: string | null;
  rows?: string | null;
  columns?: string | null;
  rateValues?: string | null;
  maxFiles?: number | null;
  maxFileSize?: number | null;
  acceptedTypes?: string | null;
  expression?: string | null;
  readOnly?: boolean | null;
}

export interface QuestionTypeSupports {
  required: boolean;
  placeholder: boolean;
  /** Whether the organizer UI should show the options editor. */
  options: boolean;
  validation: ValidationRule[];
}

export interface QuestionTypeConfig {
  value: string;
  label: string;
  category: QuestionCategory;
  icon: string;
  /** Alternate identifiers that resolve to this type (legacy DB values). */
  aliases?: string[];
  /** Column defaults applied when an organizer first picks this type. */
  defaultProps?: Partial<QuestionField>;
  supports: QuestionTypeSupports;
  /**
   * True when the answer is stored as a JSON string rather than a scalar.
   * Used by the registration API and CSV export.
   */
  complexAnswer?: boolean;
  /** True when the field collects no answer (layout/computed types). */
  noAnswer?: boolean;
  /** Serialize a client-side value into the stored `answerValue` string. */
  serialize?: (value: unknown) => string;
  /** Human-readable rendering of a stored answer, used by CSV export. */
  formatForExport?: (raw: string) => string;
  /** Type-specific validation. Returns an error message, or null when valid. */
  validate?: (value: unknown, field: QuestionField) => string | null;
  getDefaultValue?: () => unknown;
}

const registry = new Map<string, QuestionTypeConfig>();
const aliasMap = new Map<string, string>();

export function registerQuestionType(config: QuestionTypeConfig): void {
  registry.set(config.value, config);
  for (const alias of config.aliases ?? []) {
    aliasMap.set(alias, config.value);
  }
}

/** Resolve a possibly-legacy field type to its canonical identifier. */
export function resolveTypeName(value: string): string {
  if (registry.has(value)) return value;
  return aliasMap.get(value) ?? value;
}

export function getQuestionType(value: string): QuestionTypeConfig | undefined {
  return registry.get(resolveTypeName(value));
}

export function isKnownQuestionType(value: string): boolean {
  return registry.has(resolveTypeName(value));
}

export function getAllQuestionTypes(): QuestionTypeConfig[] {
  return [...registry.values()];
}

const CATEGORY_ORDER: QuestionCategory[] = ["input", "choice", "advanced", "layout"];

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  input: "Input",
  choice: "Choice",
  advanced: "Advanced",
  layout: "Layout",
};

/** Types grouped by category, in a stable display order. */
export function getTypesByCategory(): {
  category: QuestionCategory;
  label: string;
  types: QuestionTypeConfig[];
}[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    types: getAllQuestionTypes().filter((t) => t.category === category),
  })).filter((group) => group.types.length > 0);
}

// --- Shared helpers -------------------------------------------------------

/** Parse a JSON-encoded column into a string array, tolerating legacy formats. */
export function parseOptions(options?: string | null): string[] {
  if (!options) return [];
  try {
    const parsed = JSON.parse(options);
    if (Array.isArray(parsed)) return parsed.map(String);
    return [];
  } catch {
    // Legacy rows may hold a bare comma-separated string.
    return options
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);
  }
}

export function parseJsonArray<T = unknown>(raw?: string | null): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // The organizer inspector stores rows/columns double-encoded: an array
    // whose elements are themselves JSON strings (QuestionInspector's
    // RowsEditor `JSON.stringify`s each entry, then stringifies the array).
    // Unwrap one extra level so renderers receive plain objects.
    //
    // Only strings that decode to an object/array are unwrapped: plain string
    // arrays are a valid shape for imagepicker and multipletext, and their
    // labels must survive untouched.
    return parsed.map((item) => {
      if (typeof item !== "string") return item;
      try {
        const inner = JSON.parse(item);
        return inner !== null && typeof inner === "object" ? inner : item;
      } catch {
        return item;
      }
    }) as T[];
  } catch {
    return [];
  }
}

/**
 * Apply the generic, column-driven validation rules a type opts into via
 * `supports.validation`. Type-specific checks live in `config.validate`.
 */
export function validateAnswer(
  value: unknown,
  field: QuestionField
): string | null {
  const config = getQuestionType(field.fieldType);
  if (!config || config.noAnswer) return null;

  const isEmpty =
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0);

  if (field.required && isEmpty) {
    return `"${field.label}" is required.`;
  }
  // Optional and unanswered: skip remaining rules.
  if (isEmpty) return null;

  const rules = config.supports.validation;

  if (typeof value === "string") {
    if (
      rules.includes("minLength") &&
      field.minLength != null &&
      value.length < field.minLength
    ) {
      return `"${field.label}" must be at least ${field.minLength} characters.`;
    }
    if (
      rules.includes("maxLength") &&
      field.maxLength != null &&
      value.length > field.maxLength
    ) {
      return `"${field.label}" must be at most ${field.maxLength} characters.`;
    }
    if (rules.includes("regex") && field.regex) {
      try {
        if (!new RegExp(field.regex).test(value)) {
          return `"${field.label}" is not in the expected format.`;
        }
      } catch {
        // An invalid stored pattern must not block a registration.
      }
    }
  }

  if (rules.includes("min") || rules.includes("max")) {
    const num = typeof value === "number" ? value : Number(value);
    if (!Number.isNaN(num)) {
      if (rules.includes("min") && field.minValue != null && num < field.minValue) {
        return `"${field.label}" must be at least ${field.minValue}.`;
      }
      if (rules.includes("max") && field.maxValue != null && num > field.maxValue) {
        return `"${field.label}" must be at most ${field.maxValue}.`;
      }
    }
  }

  return config.validate?.(value, field) ?? null;
}

/** Convert a client value into the string persisted in `answerValue`. */
export function serializeAnswer(value: unknown, fieldType: string): string {
  const config = getQuestionType(fieldType);
  if (config?.serialize) return config.serialize(value);
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

/** Render a stored answer as readable text for CSV export. */
export function formatAnswerForExport(raw: string, fieldType: string): string {
  if (!raw) return "";
  const config = getQuestionType(fieldType);
  if (config?.formatForExport) {
    try {
      return config.formatForExport(raw);
    } catch {
      return raw;
    }
  }
  return raw;
}
