import { describe, it, expect } from "vitest";
import {
  COLOR_TOKENS,
  SPACING_TOKENS,
  RADIUS_TOKENS,
  buildThemeCssVariables,
} from "../src/theme-tokens";

describe("theme-tokens — Design System token catalog (Milestone 8)", () => {
  it("covers every semantic color role named in the Design System (doc 02)", () => {
    const names = COLOR_TOKENS.map((t) => t.name);
    expect(names).toEqual([
      "primary",
      "secondary",
      "neutral",
      "success",
      "warning",
      "danger",
      "info",
    ]);
  });

  it("every color token has both a CSS variable name and a placeholder value", () => {
    for (const token of COLOR_TOKENS) {
      expect(token.cssVariable).toMatch(/^--color-/);
      expect(token.placeholderValue.length).toBeGreaterThan(0);
    }
  });

  it("spacing tokens form an ascending scale", () => {
    expect(SPACING_TOKENS.map((t) => t.name)).toEqual(["1x", "2x", "3x", "4x", "6x", "8x", "12x"]);
  });

  it("radius tokens cover none/small/medium/full per the Design System", () => {
    expect(RADIUS_TOKENS.map((t) => t.name)).toEqual(["none", "small", "medium", "full"]);
  });

  it("buildThemeCssVariables produces a valid :root block containing every token", () => {
    const css = buildThemeCssVariables();
    expect(css).toMatch(/^:root \{/);
    expect(css).toContain("--color-primary:");
    expect(css).toContain("--space-4x:");
    expect(css).toContain("--radius-medium:");
  });
});
