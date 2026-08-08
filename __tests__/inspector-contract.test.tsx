import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuestionRenderer } from "@/lib/questions/renderers";
import { parseJsonArray } from "@/lib/questions";
import type { QuestionField } from "@/lib/questions";

/**
 * Contract test: QuestionInspector writes `rows`/`columns`, the renderers read
 * them. The renderer unit tests use hand-written JSON, so they cannot catch a
 * mismatch between the two sides. This file reproduces the inspector's exact
 * encoding and feeds it to the renderers.
 *
 * Inspector encoding, QuestionInspector.tsx lines 311-322 (rows) and 346-357
 * (columns): `next.map(...)` returns JSON *strings*, and the resulting array of
 * strings is then stringified again -> double-encoded payload.
 */

/** Verbatim reproduction of the inspector's rows encoder. */
function inspectorEncodeRows(labels: string[]): string {
  return JSON.stringify(
    labels.map((r) => {
      try {
        const p = JSON.parse(r);
        return JSON.stringify(p);
      } catch {
        return JSON.stringify({
          value: r.toLowerCase().replace(/\s+/g, "_"),
          text: r,
        });
      }
    }),
  );
}

/** Verbatim reproduction of the inspector's columns encoder. */
function inspectorEncodeColumns(labels: string[]): string {
  return JSON.stringify(
    labels.map((c) => {
      try {
        const p = JSON.parse(c);
        return JSON.stringify(p);
      } catch {
        return JSON.stringify({
          value: c.toLowerCase().replace(/\s+/g, "_"),
          text: c,
          choices: [],
        });
      }
    }),
  );
}

function field(overrides: Partial<QuestionField> & { fieldType: string }): QuestionField {
  return { label: "Q", ...overrides };
}

describe("inspector encoding shape", () => {
  test("parseJsonArray unwraps the inspector's double-encoded elements", () => {
    const encoded = inspectorEncodeRows(["Row One", "Row Two"]);
    const parsed = parseJsonArray<{ value: string; text: string }>(encoded);
    expect(parsed).toHaveLength(2);
    expect(typeof parsed[0]).toBe("object");
    expect(parsed[0]).toEqual({ value: "row_one", text: "Row One" });
  });

  test("renderers receive usable value/text properties", () => {
    const encoded = inspectorEncodeRows(["Row One"]);
    const parsed = parseJsonArray<{ value: string; text: string }>(encoded);
    expect(parsed[0].text).toBe("Row One");
    expect(parsed[0].value).toBe("row_one");
  });

  test("plain string arrays are left intact (imagepicker/multipletext)", () => {
    // These types legitimately store `["a","b"]`; unwrapping must not corrupt
    // them, and must not choke on label text that happens to look numeric.
    expect(parseJsonArray<string>('["a","b"]')).toEqual(["a", "b"]);
    expect(parseJsonArray<string>('["123","true"]')).toEqual(["123", "true"]);
    expect(parseJsonArray<string>('["null"]')).toEqual(["null"]);
  });
});

describe("matrix fed by the inspector", () => {
  test("renders the row label the organizer typed", () => {
    render(
      <QuestionRenderer
        field={field({
          fieldType: "matrix",
          rows: inspectorEncodeRows(["Row One", "Row Two"]),
          columns: inspectorEncodeColumns(["Col One"]),
        })}
        value={undefined}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Row One")).toBeDefined();
    expect(screen.getByText("Col One")).toBeDefined();
  });
});

describe("matrixdropdown fed by the inspector", () => {
  test("renders a select per cell", () => {
    render(
      <QuestionRenderer
        field={field({
          fieldType: "matrixdropdown",
          rows: inspectorEncodeRows(["Row One"]),
          columns: inspectorEncodeColumns(["Col One"]),
        })}
        value={undefined}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getAllByRole("combobox")).toHaveLength(1);
  });
});

describe("paneldynamic fed by the inspector", () => {
  test("renders the template field label the organizer typed", () => {
    render(
      <QuestionRenderer
        field={field({
          fieldType: "paneldynamic",
          rows: inspectorEncodeRows(["First Name"]),
        })}
        value={[{}]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("First Name")).toBeDefined();
  });
});
