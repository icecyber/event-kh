import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { QuestionRenderer, getInitialValue } from "@/lib/questions/renderers";
import type { QuestionField } from "@/lib/questions";

/**
 * Phase 3 renderer coverage (plan lines 32-38, 206-208).
 *
 * These six renderers previously compiled but had never been rendered. A clean
 * build twice failed to catch real defects in this file, so these tests drive
 * them through jsdom with realistic `rows`/`columns` JSON payloads.
 */

function field(overrides: Partial<QuestionField> & { fieldType: string }): QuestionField {
  return { label: "Q", ...overrides };
}

const ROWS = JSON.stringify([
  { value: "r1", text: "Row One" },
  { value: "r2", text: "Row Two" },
]);

const COLS = JSON.stringify([
  { value: "c1", text: "Col One" },
  { value: "c2", text: "Col Two" },
]);

const COLS_WITH_CHOICES = JSON.stringify([
  { value: "c1", text: "Col One", choices: ["Low", "High"] },
  { value: "c2", text: "Col Two", choices: ["Yes", "No"] },
]);

function renderField(f: QuestionField, value: unknown = undefined) {
  const onChange = vi.fn();
  const utils = render(
    <QuestionRenderer field={f} value={value} onChange={onChange} />,
  );
  return { onChange, ...utils };
}

describe("matrix", () => {
  test("renders a cell input for every row x column pair", () => {
    renderField(field({ fieldType: "matrix", rows: ROWS, columns: COLS }));
    expect(screen.getByText("Row One")).toBeDefined();
    expect(screen.getByText("Row Two")).toBeDefined();
    expect(screen.getByText("Col One")).toBeDefined();
    // 2 rows x 2 cols
    expect(screen.getAllByRole("textbox")).toHaveLength(4);
  });

  test("prompts for configuration when rows/columns are unset", () => {
    renderField(field({ fieldType: "matrix" }));
    expect(screen.getByText(/configure rows and columns/i)).toBeDefined();
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
  });

  test("emits a nested {row: {col: value}} shape on edit", () => {
    const { onChange } = renderField(
      field({ fieldType: "matrix", rows: ROWS, columns: COLS }),
    );
    fireEvent.change(screen.getAllByRole("textbox")[0], { target: { value: "hi" } });
    expect(onChange).toHaveBeenCalledWith({ r1: { c1: "hi" } });
  });

  test("preserves other cells when one cell changes", () => {
    const { onChange } = renderField(
      field({ fieldType: "matrix", rows: ROWS, columns: COLS }),
      { r2: { c2: "keep" } },
    );
    fireEvent.change(screen.getAllByRole("textbox")[0], { target: { value: "new" } });
    expect(onChange).toHaveBeenCalledWith({
      r2: { c2: "keep" },
      r1: { c1: "new" },
    });
  });

  test("displays existing answers", () => {
    renderField(field({ fieldType: "matrix", rows: ROWS, columns: COLS }), {
      r1: { c1: "existing" },
    });
    expect(screen.getByDisplayValue("existing")).toBeDefined();
  });
});

describe("matrixdropdown", () => {
  test("renders a select per cell with its column choices", () => {
    renderField(
      field({ fieldType: "matrixdropdown", rows: ROWS, columns: COLS_WITH_CHOICES }),
    );
    const selects = screen.getAllByRole("combobox");
    expect(selects).toHaveLength(4);
    // First column's choices, not the second column's.
    expect(within(selects[0]).getByRole("option", { name: "Low" })).toBeDefined();
    expect(within(selects[1]).getByRole("option", { name: "Yes" })).toBeDefined();
  });

  test("emits the nested shape on select", () => {
    const { onChange } = renderField(
      field({ fieldType: "matrixdropdown", rows: ROWS, columns: COLS_WITH_CHOICES }),
    );
    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "High" } });
    expect(onChange).toHaveBeenCalledWith({ r1: { c1: "High" } });
  });

  test("tolerates a column with no choices", () => {
    const cols = JSON.stringify([{ value: "c1", text: "Col One" }]);
    expect(() =>
      renderField(field({ fieldType: "matrixdropdown", rows: ROWS, columns: cols })),
    ).not.toThrow();
  });
});

describe("matrixdynamic", () => {
  test("starts empty with an add-row affordance", () => {
    renderField(field({ fieldType: "matrixdynamic", columns: COLS_WITH_CHOICES }));
    expect(screen.getByText(/no rows yet/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /add row/i })).toBeDefined();
  });

  test("appends an empty row when add is clicked", () => {
    const { onChange } = renderField(
      field({ fieldType: "matrixdynamic", columns: COLS_WITH_CHOICES }),
      [],
    );
    fireEvent.click(screen.getByRole("button", { name: /add row/i }));
    expect(onChange).toHaveBeenCalledWith([{}]);
  });

  test("renders one select per column for each existing row", () => {
    renderField(field({ fieldType: "matrixdynamic", columns: COLS_WITH_CHOICES }), [
      {},
      {},
    ]);
    // 2 rows x 2 columns
    expect(screen.getAllByRole("combobox")).toHaveLength(4);
  });

  test("removes the correct row", () => {
    const { onChange } = renderField(
      field({ fieldType: "matrixdynamic", columns: COLS_WITH_CHOICES }),
      [{ c1: "keep" }, { c1: "drop" }],
    );
    const removes = screen.getAllByRole("button", { name: /remove row/i });
    fireEvent.click(removes[1]);
    expect(onChange).toHaveBeenCalledWith([{ c1: "keep" }]);
  });

  test("emits an array-of-objects shape on cell edit", () => {
    const { onChange } = renderField(
      field({ fieldType: "matrixdynamic", columns: COLS_WITH_CHOICES }),
      [{}],
    );
    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "Low" } });
    expect(onChange).toHaveBeenCalledWith([{ c1: "Low" }]);
  });

  test("prompts for configuration when columns are unset", () => {
    renderField(field({ fieldType: "matrixdynamic" }));
    expect(screen.getByText(/configure columns/i)).toBeDefined();
  });
});

describe("panel", () => {
  // Plan line 36: visual grouping, no answer collected.
  test("renders without collecting an answer", () => {
    const { onChange } = renderField(field({ fieldType: "panel" }));
    expect(screen.getByText(/no answer collected/i)).toBeDefined();
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("paneldynamic", () => {
  const TEMPLATE = JSON.stringify([
    { value: "fname", text: "First Name" },
    { value: "email", text: "Email" },
  ]);

  test("prompts for configuration when the template is empty", () => {
    renderField(field({ fieldType: "paneldynamic" }));
    expect(screen.getByText(/configure template fields/i)).toBeDefined();
  });

  test("shows an add affordance and no instances initially", () => {
    renderField(field({ fieldType: "paneldynamic", rows: TEMPLATE }), []);
    expect(screen.getByText(/no instances yet/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /add instance/i })).toBeDefined();
  });

  test("renders one input per template field per instance", () => {
    renderField(field({ fieldType: "paneldynamic", rows: TEMPLATE }), [{}, {}]);
    expect(screen.getAllByRole("textbox")).toHaveLength(4);
    expect(screen.getAllByText("First Name")).toHaveLength(2);
    expect(screen.getByText("Instance 1")).toBeDefined();
    expect(screen.getByText("Instance 2")).toBeDefined();
  });

  test("appends an empty instance on add", () => {
    const { onChange } = renderField(
      field({ fieldType: "paneldynamic", rows: TEMPLATE }),
      [],
    );
    fireEvent.click(screen.getByRole("button", { name: /add instance/i }));
    expect(onChange).toHaveBeenCalledWith([{}]);
  });

  test("emits an array of keyed objects on edit", () => {
    const { onChange } = renderField(
      field({ fieldType: "paneldynamic", rows: TEMPLATE }),
      [{}],
    );
    fireEvent.change(screen.getAllByRole("textbox")[0], { target: { value: "Ada" } });
    expect(onChange).toHaveBeenCalledWith([{ fname: "Ada" }]);
  });

  test("removes the correct instance", () => {
    const { onChange } = renderField(
      field({ fieldType: "paneldynamic", rows: TEMPLATE }),
      [{ fname: "keep" }, { fname: "drop" }],
    );
    fireEvent.click(screen.getAllByRole("button", { name: /remove instance/i })[1]);
    expect(onChange).toHaveBeenCalledWith([{ fname: "keep" }]);
  });
});

describe("expression", () => {
  // Plan line 128: read-only, never submitted.
  test("shows the formula and the computed value", () => {
    renderField(field({ fieldType: "expression", expression: "a + b" }), "42");
    expect(screen.getByText("a + b")).toBeDefined();
    expect(screen.getByText("42")).toBeDefined();
  });

  test("is read-only: renders no editable control and never emits", () => {
    const { onChange } = renderField(
      field({ fieldType: "expression", expression: "a + b" }),
      "42",
    );
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.queryAllByRole("combobox")).toHaveLength(0);
    expect(onChange).not.toHaveBeenCalled();
  });

  test("handles a missing formula and an uncomputed value", () => {
    renderField(field({ fieldType: "expression" }));
    expect(screen.getByText(/no formula/i)).toBeDefined();
    expect(screen.getByText(/not computed yet/i)).toBeDefined();
  });
});

describe("unknown types", () => {
  test("fall back to a usable control rather than a dead one", () => {
    const { onChange } = renderField(field({ fieldType: "not-a-real-type" }));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "typed" } });
    expect(onChange).toHaveBeenCalledWith("typed");
  });
});

describe("getInitialValue", () => {
  test("gives collection types an empty collection, not undefined", () => {
    expect(getInitialValue(field({ fieldType: "matrix" }))).toEqual({});
    expect(getInitialValue(field({ fieldType: "matrixdropdown" }))).toEqual({});
    expect(getInitialValue(field({ fieldType: "matrixdynamic" }))).toEqual([]);
    expect(getInitialValue(field({ fieldType: "paneldynamic" }))).toEqual([]);
  });
});
