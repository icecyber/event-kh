import { describe, expect, test } from "vitest";
import {
  formatAnswerForExport,
  getQuestionType,
  serializeAnswer,
} from "@/lib/questions";

/**
 * Answer persistence + CSV export coverage.
 *
 * Plan decisions under test:
 *  - line 263: complex answers are stored as JSON in the existing
 *    `answerValue` string column (the "Option 1 JSON-flatten" choice).
 *  - line 131 / 251: CSV export flattens complex answers to readable text.
 *  - line 128: expression fields are never submitted.
 */

describe("serializeAnswer", () => {
  test("passes scalar strings through unchanged", () => {
    expect(serializeAnswer("hello", "text")).toBe("hello");
  });

  test("maps null and undefined to an empty string, never to 'null'", () => {
    expect(serializeAnswer(null, "text")).toBe("");
    expect(serializeAnswer(undefined, "text")).toBe("");
  });

  test("stores matrix answers as JSON that round-trips", () => {
    const value = { r1: { c1: "a" }, r2: { c2: "b" } };
    const stored = serializeAnswer(value, "matrix");
    expect(JSON.parse(stored)).toEqual(value);
  });

  test("stores matrixdynamic answers as a JSON array that round-trips", () => {
    const value = [{ c1: "x" }, { c1: "y" }];
    const stored = serializeAnswer(value, "matrixdynamic");
    expect(JSON.parse(stored)).toEqual(value);
  });

  test("stores paneldynamic answers as a JSON array that round-trips", () => {
    const value = [{ fname: "Ada" }, { fname: "Grace" }];
    const stored = serializeAnswer(value, "paneldynamic");
    expect(JSON.parse(stored)).toEqual(value);
  });

  test("stores tagbox multi-select answers as JSON", () => {
    const stored = serializeAnswer(["a", "b"], "tagbox");
    expect(JSON.parse(stored)).toEqual(["a", "b"]);
  });

  test("produces a string for every registered type, never undefined", () => {
    // Guards the DB contract: `answerValue` is a non-null string column.
    const samples: Record<string, unknown> = {
      matrix: { r1: { c1: "v" } },
      matrixdynamic: [{ c1: "v" }],
      paneldynamic: [{ f: "v" }],
      tagbox: ["a"],
      boolean: true,
      number: 42,
      text: "s",
      ranking: ["a", "b"],
    };
    for (const [type, value] of Object.entries(samples)) {
      expect(typeof serializeAnswer(value, type), type).toBe("string");
    }
  });
});

describe("formatAnswerForExport", () => {
  test("returns an empty string for empty input", () => {
    expect(formatAnswerForExport("", "matrix")).toBe("");
    expect(formatAnswerForExport("", "text")).toBe("");
  });

  test("passes plain text through unchanged", () => {
    expect(formatAnswerForExport("hello", "text")).toBe("hello");
  });

  test("never throws and never returns undefined on malformed stored JSON", () => {
    // Legacy or hand-edited rows must not break a whole CSV export.
    for (const type of [
      "matrix",
      "matrixdropdown",
      "matrixdynamic",
      "paneldynamic",
      "tagbox",
      "ranking",
    ]) {
      let out: string | undefined;
      expect(() => {
        out = formatAnswerForExport("{not valid json", type);
      }, type).not.toThrow();
      expect(typeof out, type).toBe("string");
    }
  });

  test("flattens a matrix answer into readable text, not raw JSON", () => {
    const stored = JSON.stringify({ r1: { c1: "yes" } });
    const out = formatAnswerForExport(stored, "matrix");
    expect(out).not.toContain("{");
    expect(out).toContain("yes");
  });

  test("flattens a multi-select answer without JSON punctuation", () => {
    const stored = JSON.stringify(["Alpha", "Beta"]);
    const out = formatAnswerForExport(stored, "tagbox");
    expect(out).toContain("Alpha");
    expect(out).toContain("Beta");
    expect(out).not.toContain("[");
  });

  test("renders booleans as Yes/No rather than true/false", () => {
    expect(formatAnswerForExport("true", "boolean")).toMatch(/yes/i);
    expect(formatAnswerForExport("false", "boolean")).toMatch(/no/i);
  });

  test("summarises file answers rather than dumping data URLs", () => {
    // Uploads are stored as base64 data URLs; a CSV must not inline them.
    const stored = JSON.stringify([
      "data:image/png;base64,AAAA",
      "data:image/png;base64,BBBB",
    ]);
    const out = formatAnswerForExport(stored, "file");
    expect(out).not.toContain("base64");
    expect(out).toMatch(/2/);
  });
});

describe("non-answering types", () => {
  test("expression and panel are flagged so the API can skip them", () => {
    // Plan lines 36 and 128: neither type submits a value.
    expect(getQuestionType("expression")?.noAnswer).toBe(true);
    expect(getQuestionType("panel")?.noAnswer).toBe(true);
  });
});

describe("complexAnswer flags", () => {
  test("types whose answers are JSON are flagged complexAnswer", () => {
    // The registration API and CSV export branch on this flag.
    for (const type of [
      "matrix",
      "matrixdropdown",
      "matrixdynamic",
      "paneldynamic",
      "tagbox",
      "ranking",
    ]) {
      expect(getQuestionType(type)?.complexAnswer, type).toBe(true);
    }
  });

  test("scalar types are not flagged complexAnswer", () => {
    for (const type of ["text", "textarea", "number", "date", "boolean"]) {
      expect(getQuestionType(type)?.complexAnswer, type).toBeFalsy();
    }
  });
});
