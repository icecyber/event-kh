/**
 * Built-in question types (Phase 1: core 10).
 *
 * Importing this module registers every built-in type as a side effect.
 * Import it once from `@/lib/questions` rather than directly.
 */

import {
  registerQuestionType,
  parseOptions,
  parseJsonArray,
  type QuestionField,
} from "./registry";

// --- Input ----------------------------------------------------------------

registerQuestionType({
  value: "text",
  label: "Short Text",
  category: "input",
  icon: "✏️",
  supports: {
    required: true,
    placeholder: true,
    options: false,
    validation: ["minLength", "maxLength", "regex"],
  },
  getDefaultValue: () => "",
});

registerQuestionType({
  value: "textarea",
  label: "Long Text",
  category: "input",
  icon: "📝",
  supports: {
    required: true,
    placeholder: true,
    options: false,
    validation: ["minLength", "maxLength"],
  },
  getDefaultValue: () => "",
});

registerQuestionType({
  value: "number",
  label: "Number",
  category: "input",
  icon: "🔢",
  supports: {
    required: true,
    placeholder: true,
    options: false,
    validation: ["min", "max"],
  },
  validate: (value) =>
    Number.isNaN(Number(value)) ? "Please enter a valid number." : null,
  getDefaultValue: () => "",
});

registerQuestionType({
  value: "date",
  label: "Date",
  category: "input",
  icon: "📅",
  supports: {
    required: true,
    placeholder: false,
    options: false,
    validation: [],
  },
  validate: (value) =>
    Number.isNaN(Date.parse(String(value))) ? "Please enter a valid date." : null,
  getDefaultValue: () => "",
});

registerQuestionType({
  value: "rating",
  label: "Rating",
  category: "input",
  icon: "⭐",
  defaultProps: { scale: 5, rateType: "star" },
  supports: {
    required: true,
    placeholder: false,
    options: false,
    validation: [],
  },
  validate: (value, field: QuestionField) => {
    const num = Number(value);
    const max = field.scale ?? 5;
    if (Number.isNaN(num) || num < 1 || num > max) {
      return `Please choose a rating between 1 and ${max}.`;
    }
    return null;
  },
  getDefaultValue: () => "",
});

// --- Choice ---------------------------------------------------------------

registerQuestionType({
  value: "dropdown",
  label: "Dropdown",
  category: "choice",
  icon: "🔽",
  // Legacy rows persisted before the SurveyJS-aligned rename.
  aliases: ["select"],
  supports: {
    required: true,
    placeholder: true,
    options: true,
    validation: [],
  },
  validate: (value, field) => {
    const opts = parseOptions(field.options);
    if (opts.length && !opts.includes(String(value))) {
      return `"${field.label}" has an invalid selection.`;
    }
    return null;
  },
  getDefaultValue: () => "",
});

registerQuestionType({
  value: "radiogroup",
  label: "Radio Group",
  category: "choice",
  icon: "🔘",
  supports: {
    required: true,
    placeholder: false,
    options: true,
    validation: [],
  },
  validate: (value, field) => {
    const opts = parseOptions(field.options);
    if (opts.length && !opts.includes(String(value))) {
      return `"${field.label}" has an invalid selection.`;
    }
    return null;
  },
  getDefaultValue: () => "",
});

registerQuestionType({
  value: "boolean",
  label: "Checkbox (Yes/No)",
  category: "choice",
  icon: "☑️",
  aliases: ["checkbox"],
  supports: {
    required: true,
    placeholder: false,
    options: false,
    validation: [],
  },
  serialize: (value) => (value === true || value === "true" ? "true" : "false"),
  formatForExport: (raw) => (raw === "true" ? "Yes" : "No"),
  // A required boolean must be affirmatively checked.
  validate: (value, field) =>
    field.required && value !== true && value !== "true"
      ? `"${field.label}" must be checked.`
      : null,
  getDefaultValue: () => false,
});

registerQuestionType({
  value: "tagbox",
  label: "Multi-select",
  category: "choice",
  icon: "🏷️",
  complexAnswer: true,
  supports: {
    required: true,
    placeholder: true,
    options: true,
    validation: [],
  },
  serialize: (value) => JSON.stringify(Array.isArray(value) ? value : []),
  formatForExport: (raw) => {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.join("; ") : raw;
  },
  validate: (value, field) => {
    if (!Array.isArray(value)) return null;
    const opts = parseOptions(field.options);
    if (opts.length && value.some((v) => !opts.includes(String(v)))) {
      return `"${field.label}" has an invalid selection.`;
    }
    return null;
  },
  getDefaultValue: () => [],
});

// --- Advanced -------------------------------------------------------------

registerQuestionType({
  value: "file",
  label: "File Upload",
  category: "advanced",
  icon: "📎",
  complexAnswer: true,
  defaultProps: { maxFiles: 1, maxFileSize: 2, acceptedTypes: "image/*" },
  supports: {
    required: true,
    placeholder: false,
    options: false,
    validation: [],
  },
  serialize: (value) => JSON.stringify(Array.isArray(value) ? value : []),
  formatForExport: (raw) => {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? `${parsed.length} file(s)` : raw;
  },
  validate: (value, field) => {
    if (!Array.isArray(value)) return null;
    const max = field.maxFiles ?? 1;
    if (value.length > max) {
      return `"${field.label}" accepts at most ${max} file(s).`;
    }
    return null;
  },
  getDefaultValue: () => [],
});

// =========================================================================
// Phase 2 — additional types
// =========================================================================

// --- Input ----------------------------------------------------------------

registerQuestionType({
  value: "time",
  label: "Time",
  category: "input",
  icon: "🕒",
  supports: {
    required: true,
    placeholder: false,
    options: false,
    validation: [],
  },
  // HTML time inputs emit "HH:mm" (or "HH:mm:ss").
  validate: (value, field) =>
    /^\d{2}:\d{2}(:\d{2})?$/.test(String(value))
      ? null
      : `"${field.label}" must be a valid time.`,
  getDefaultValue: () => "",
});

registerQuestionType({
  value: "datetime",
  label: "Date & Time",
  category: "input",
  icon: "📆",
  supports: {
    required: true,
    placeholder: false,
    options: false,
    validation: [],
  },
  validate: (value, field) =>
    Number.isNaN(Date.parse(String(value)))
      ? `"${field.label}" must be a valid date and time.`
      : null,
  getDefaultValue: () => "",
});

registerQuestionType({
  value: "multipletext",
  label: "Multiple Text",
  category: "input",
  icon: "🧾",
  complexAnswer: true,
  // Sub-item labels live in the existing `rows` JSON column.
  defaultProps: { rows: JSON.stringify(["Item 1", "Item 2"]) },
  supports: {
    required: true,
    placeholder: true,
    options: false,
    validation: [],
  },
  serialize: (value) =>
    value && typeof value === "object" && !Array.isArray(value)
      ? JSON.stringify(value)
      : "{}",
  formatForExport: (raw) => {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return raw;
    return Object.entries(parsed)
      .map(([k, v]) => `${k}: ${v}`)
      .join("; ");
  },
  validate: (value, field) => {
    if (!field.required) return null;
    const items = parseJsonArray<string>(field.rows);
    if (!items.length) return null;
    const answers = (value ?? {}) as Record<string, unknown>;
    const missing = items.filter((label) => {
      const v = answers[label];
      return v === undefined || v === null || String(v).trim() === "";
    });
    return missing.length
      ? `"${field.label}" requires: ${missing.join(", ")}.`
      : null;
  },
  getDefaultValue: () => ({}),
});

// --- Choice ---------------------------------------------------------------

registerQuestionType({
  value: "ranking",
  label: "Ranking",
  category: "choice",
  icon: "🔢",
  complexAnswer: true,
  supports: {
    required: true,
    placeholder: false,
    options: true,
    validation: [],
  },
  serialize: (value) => JSON.stringify(Array.isArray(value) ? value : []),
  formatForExport: (raw) => {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((v, i) => `${i + 1}. ${v}`).join("; ")
      : raw;
  },
  validate: (value, field) => {
    if (!Array.isArray(value)) return null;
    const opts = parseOptions(field.options);
    if (!opts.length) return null;
    // A ranking answer must be a permutation of the defined choices.
    if (field.required && value.length !== opts.length) {
      return `"${field.label}" requires every item to be ranked.`;
    }
    if (value.some((v) => !opts.includes(String(v)))) {
      return `"${field.label}" contains an unknown item.`;
    }
    if (new Set(value.map(String)).size !== value.length) {
      return `"${field.label}" contains duplicate items.`;
    }
    return null;
  },
  getDefaultValue: () => [],
});

registerQuestionType({
  value: "imagepicker",
  label: "Image Picker",
  category: "choice",
  icon: "🖼️",
  // Image URLs are stored in `rows`; `options` holds the matching labels.
  defaultProps: { rows: JSON.stringify([]) },
  supports: {
    required: true,
    placeholder: false,
    options: true,
    validation: [],
  },
  validate: (value, field) => {
    const opts = parseOptions(field.options);
    if (opts.length && value && !opts.includes(String(value))) {
      return `"${field.label}" has an invalid selection.`;
    }
    return null;
  },
  getDefaultValue: () => "",
});

// --- Advanced -------------------------------------------------------------

registerQuestionType({
  value: "signaturepad",
  label: "Signature",
  category: "advanced",
  icon: "✍️",
  supports: {
    required: true,
    placeholder: false,
    options: false,
    validation: [],
  },
  // Stored as a base64 PNG data URL produced by the canvas.
  formatForExport: (raw) => (raw ? "signed" : ""),
  validate: (value, field) => {
    const s = String(value ?? "");
    if (field.required && !s.startsWith("data:image/")) {
      return `"${field.label}" requires a signature.`;
    }
    return null;
  },
  getDefaultValue: () => "",
});

// =========================================================================
// Phase 3 — Matrix, Panel, Expression
// =========================================================================

// --- Advanced / Layout ----------------------------------------------------

registerQuestionType({
  value: "matrix",
  label: "Matrix (Static)",
  category: "advanced",
  icon: "📊",
  complexAnswer: true,
  // rows: array of {value, text}, columns: array of {value, text}
  defaultProps: {
    rows: JSON.stringify([
      { value: "row1", text: "Row 1" },
      { value: "row2", text: "Row 2" },
    ]),
    columns: JSON.stringify([
      { value: "col1", text: "Column 1" },
      { value: "col2", text: "Column 2" },
    ]),
  },
  supports: {
    required: true,
    placeholder: false,
    options: false,
    validation: [],
  },
  serialize: (value) =>
    value && typeof value === "object" ? JSON.stringify(value) : "{}",
  formatForExport: (raw) => {
    const parsed = JSON.parse(raw) as Record<string, Record<string, unknown>>;
    if (!parsed || typeof parsed !== "object") return raw;
    return Object.entries(parsed)
      .map(([row, cols]) =>
        `${row}: ${Object.entries(cols).map(([c, v]) => `${c}=${v}`).join(", ")}`
      )
      .join("; ");
  },
  validate: (value, field) => {
    const rows = parseJsonArray<{ value: string; text: string }>(field.rows);
    const cols = parseJsonArray<{ value: string; text: string }>(field.columns);
    if (!rows.length || !cols.length) return null;
    const answers = (value ?? {}) as Record<string, Record<string, string>>;
    if (!field.required) return null;
    for (const r of rows) {
      const rowVal = r.value;
      const rowAns = answers[rowVal];
      if (!rowAns) return `"${field.label}" requires all rows to be answered.`;
      for (const c of cols) {
        if (rowAns[c.value] === undefined || rowAns[c.value] === null || String(rowAns[c.value]).trim() === "") {
          return `"${field.label}" row "${r.text}" column "${c.text}" is required.`;
        }
      }
    }
    return null;
  },
  getDefaultValue: () => ({}),
});

registerQuestionType({
  value: "matrixdropdown",
  label: "Matrix Dropdown",
  category: "advanced",
  icon: "📋",
  complexAnswer: true,
  defaultProps: {
    rows: JSON.stringify([
      { value: "row1", text: "Row 1" },
      { value: "row2", text: "Row 2" },
    ]),
    columns: JSON.stringify([
      { value: "col1", text: "Column 1", choices: ["A", "B", "C"] },
    ]),
  },
  supports: {
    required: true,
    placeholder: false,
    options: false,
    validation: [],
  },
  serialize: (value) =>
    value && typeof value === "object" ? JSON.stringify(value) : "{}",
  formatForExport: (raw) => {
    const parsed = JSON.parse(raw) as Record<string, Record<string, unknown>>;
    if (!parsed || typeof parsed !== "object") return raw;
    return Object.entries(parsed)
      .map(([row, cols]) =>
        `${row}: ${Object.entries(cols).map(([c, v]) => `${c}=${v}`).join(", ")}`
      )
      .join("; ");
  },
  validate: (value, field) => {
    const rows = parseJsonArray<{ value: string; text: string }>(field.rows);
    const cols = parseJsonArray<{ value: string; text: string; choices?: string[] }>(field.columns);
    if (!rows.length || !cols.length) return null;
    const answers = (value ?? {}) as Record<string, Record<string, string>>;
    if (!field.required) return null;
    for (const r of rows) {
      const rowVal = r.value;
      const rowAns = answers[rowVal];
      if (!rowAns) return `"${field.label}" requires all rows to be answered.`;
      for (const c of cols) {
        const choices = c.choices ?? [];
        if (choices.length && (!rowAns[c.value] || !choices.includes(rowAns[c.value]))) {
          return `"${field.label}" row "${r.text}" column "${c.text}" has an invalid selection.`;
        }
      }
    }
    return null;
  },
  getDefaultValue: () => ({}),
});

registerQuestionType({
  value: "matrixdynamic",
  label: "Matrix Dynamic",
  category: "advanced",
  icon: "📈",
  complexAnswer: true,
  defaultProps: {
    rows: JSON.stringify([
      { value: "row1", text: "Row 1" },
    ]),
    columns: JSON.stringify([
      { value: "col1", text: "Column 1", choices: ["A", "B", "C"] },
    ]),
  },
  supports: {
    required: true,
    placeholder: false,
    options: false,
    validation: [],
  },
  serialize: (value) => JSON.stringify(Array.isArray(value) ? value : []),
  formatForExport: (raw) => {
    const parsed = JSON.parse(raw) as Record<string, Record<string, unknown>>;
    if (!parsed || typeof parsed !== "object") return raw;
    return Object.entries(parsed)
      .map(([row, cols]) =>
        `${row}: ${Object.entries(cols).map(([c, v]) => `${c}=${v}`).join(", ")}`
      )
      .join("; ");
  },
  validate: (value, field) => {
    const cols = parseJsonArray<{ value: string; text: string; choices?: string[] }>(field.columns);
    if (!cols.length) return null;
    const answers = Array.isArray(value) ? value : [];
    if (field.required && answers.length === 0) {
      return `"${field.label}" requires at least one row.`;
    }
    for (let i = 0; i < answers.length; i++) {
      const row = answers[i];
      for (const c of cols) {
        const choices = c.choices ?? [];
        if (choices.length && (!row[c.value] || !choices.includes(row[c.value]))) {
          return `"${field.label}" row ${i + 1} column "${c.text}" has an invalid selection.`;
        }
      }
    }
    return null;
  },
  getDefaultValue: () => [],
});

// --- Layout ---------------------------------------------------------------

registerQuestionType({
  value: "panel",
  label: "Panel (Static)",
  category: "layout",
  icon: "📦",
  noAnswer: true,
  // Nested fields live in `rows` as an array of field definitions.
  defaultProps: { rows: JSON.stringify([]) },
  supports: {
    required: false,
    placeholder: false,
    options: false,
    validation: [],
  },
  getDefaultValue: () => null,
});

registerQuestionType({
  value: "paneldynamic",
  label: "Panel Dynamic",
  category: "layout",
  icon: "🔄",
  complexAnswer: true,
  // Template fields in `rows` as array of field definitions.
  defaultProps: { rows: JSON.stringify([]) },
  supports: {
    required: true,
    placeholder: false,
    options: false,
    validation: [],
  },
  serialize: (value) => JSON.stringify(Array.isArray(value) ? value : []),
  formatForExport: (raw) => {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return raw;
    return parsed
      .map((instance, i) =>
        `${i + 1}: ${Object.entries(instance).map(([k, v]) => `${k}=${v}`).join(", ")}`
      )
      .join("; ");
  },
  validate: (value, field) => {
    const template = parseJsonArray(field.rows);
    if (!template.length) return null;
    const instances = Array.isArray(value) ? value : [];
    if (field.required && instances.length === 0) {
      return `"${field.label}" requires at least one panel instance.`;
    }
    return null;
  },
  getDefaultValue: () => [],
});

// --- Computed -------------------------------------------------------------

registerQuestionType({
  value: "expression",
  label: "Expression (Computed)",
  category: "layout",
  icon: "🧮",
  noAnswer: true,
  // Expression formula in `expression` column.
  defaultProps: { expression: "" },
  supports: {
    required: false,
    placeholder: true,
    options: false,
    validation: [],
  },
  validate: () => null,
  getDefaultValue: () => "",
});
