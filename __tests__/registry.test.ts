import { describe, expect, test } from "vitest";
import {
  getAllQuestionTypes,
  getQuestionType,
  getTypesByCategory,
  isKnownQuestionType,
  parseJsonArray,
  parseOptions,
  resolveTypeName,
} from "@/lib/questions";

/**
 * The plan (1786036285270-pluggable-question-types.md) specifies SurveyJS
 * parity. Its table numbers 21 entries, but folds Number into
 * `text` + inputType and lists `expression` unnumbered; this implementation
 * registers both as first-class types, giving 22.
 */
const EXPECTED_TYPES = [
  "text",
  "textarea",
  "number",
  "date",
  "rating",
  "dropdown",
  "radiogroup",
  "boolean",
  "tagbox",
  "file",
  "time",
  "datetime",
  "multipletext",
  "ranking",
  "imagepicker",
  "signaturepad",
  "matrix",
  "matrixdropdown",
  "matrixdynamic",
  "panel",
  "paneldynamic",
  "expression",
] as const;

describe("registry: type coverage", () => {
  test("registers exactly the expected 22 types", () => {
    const registered = getAllQuestionTypes()
      .map((t) => t.value)
      .sort();
    expect(registered).toEqual([...EXPECTED_TYPES].sort());
  });

  test.each(EXPECTED_TYPES)("%s is resolvable and well-formed", (value) => {
    const config = getQuestionType(value);
    expect(config, `${value} not registered`).toBeDefined();
    expect(config!.value).toBe(value);
    expect(config!.label.length).toBeGreaterThan(0);
    expect(["input", "choice", "advanced", "layout"]).toContain(config!.category);
    // NOTE: the plan (line 61) put `render` on the config, but this
    // implementation keeps rendering in `renderers.tsx` so `registry.ts`
    // stays framework-free and server-importable. Renderer coverage lives
    // in renderers.test.tsx instead.
    expect(config!.supports).toBeDefined();
  });

  test("unknown types are not resolvable", () => {
    expect(getQuestionType("definitely-not-a-type")).toBeUndefined();
    expect(isKnownQuestionType("definitely-not-a-type")).toBe(false);
  });
});

describe("registry: legacy aliases", () => {
  // Plan line 40: `select` -> `dropdown`, `checkbox` -> `boolean`.
  // Aliases exist so legacy DB rows keep working without a data migration.
  test("select resolves to dropdown", () => {
    expect(resolveTypeName("select")).toBe("dropdown");
    expect(getQuestionType("select")?.value).toBe("dropdown");
  });

  test("checkbox resolves to boolean", () => {
    expect(resolveTypeName("checkbox")).toBe("boolean");
    expect(getQuestionType("checkbox")?.value).toBe("boolean");
  });

  test("canonical names take precedence over alias lookup", () => {
    expect(resolveTypeName("dropdown")).toBe("dropdown");
    expect(resolveTypeName("boolean")).toBe("boolean");
  });

  test("unknown names pass through unchanged", () => {
    expect(resolveTypeName("mystery")).toBe("mystery");
  });
});

describe("registry: categories", () => {
  test("groups every registered type exactly once", () => {
    const groups = getTypesByCategory();
    const flat = groups.flatMap((g) => g.types.map((t) => t.value));
    expect(flat.sort()).toEqual([...EXPECTED_TYPES].sort());
    expect(new Set(flat).size).toBe(flat.length);
  });

  test("uses the plan's category order and omits empty groups", () => {
    const groups = getTypesByCategory();
    expect(groups.map((g) => g.category)).toEqual([
      "input",
      "choice",
      "advanced",
      "layout",
    ]);
    expect(groups.every((g) => g.types.length > 0)).toBe(true);
  });

  test("panel, paneldynamic and expression are layout (plan lines 36-38)", () => {
    for (const value of ["panel", "paneldynamic", "expression"]) {
      expect(getQuestionType(value)?.category, value).toBe("layout");
    }
  });

  test("matrix family is advanced (plan lines 32-34)", () => {
    for (const value of ["matrix", "matrixdropdown", "matrixdynamic"]) {
      expect(getQuestionType(value)?.category, value).toBe("advanced");
    }
  });
});

describe("registry: non-answering types", () => {
  // Plan line 36 (panel: "no answer") and line 128 (expression not submitted).
  test("panel and expression are flagged noAnswer", () => {
    expect(getQuestionType("panel")?.noAnswer).toBe(true);
    expect(getQuestionType("expression")?.noAnswer).toBe(true);
  });

  test("answer-collecting types are not flagged noAnswer", () => {
    for (const value of ["text", "matrix", "paneldynamic", "file"]) {
      expect(getQuestionType(value)?.noAnswer, value).toBeFalsy();
    }
  });
});

describe("parseOptions", () => {
  test("parses a JSON array", () => {
    expect(parseOptions('["a","b"]')).toEqual(["a", "b"]);
  });

  test("returns an empty array for null, undefined and blank input", () => {
    expect(parseOptions(null)).toEqual([]);
    expect(parseOptions(undefined)).toEqual([]);
    expect(parseOptions("")).toEqual([]);
  });

  test("does not throw on malformed JSON", () => {
    expect(() => parseOptions("{not json")).not.toThrow();
  });
});

describe("parseJsonArray", () => {
  test("parses arrays of objects", () => {
    expect(
      parseJsonArray<{ value: string }>('[{"value":"r1"},{"value":"r2"}]'),
    ).toEqual([{ value: "r1" }, { value: "r2" }]);
  });

  test("returns an empty array for null, undefined and blank input", () => {
    expect(parseJsonArray(null)).toEqual([]);
    expect(parseJsonArray(undefined)).toEqual([]);
    expect(parseJsonArray("")).toEqual([]);
  });

  test("does not throw on malformed JSON", () => {
    expect(() => parseJsonArray("[[[")).not.toThrow();
  });

  test("does not throw when the payload is a non-array JSON value", () => {
    expect(() => parseJsonArray('{"a":1}')).not.toThrow();
  });
});
