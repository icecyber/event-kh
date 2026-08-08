import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";

// Harness smoke test: confirms jsdom, JSX transform, and RTL all work
// before the real suites depend on them.
describe("test harness", () => {
  test("renders JSX into jsdom", () => {
    render(<h1>harness ok</h1>);
    expect(screen.getByRole("heading", { level: 1, name: "harness ok" })).toBeDefined();
  });

  test("resolves the @/ path alias", async () => {
    const mod = await import("@/lib/questions");
    expect(typeof mod.getQuestionType).toBe("function");
  });
});
