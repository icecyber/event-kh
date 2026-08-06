/**
 * Built-in question types (Phase 1: core 10).
 *
 * Importing this module registers every built-in type as a side effect.
 * Import it once from `@/lib/questions` rather than directly.
 */

import {
  registerQuestionType,
  parseOptions,
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
