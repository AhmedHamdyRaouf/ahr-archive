/**
 * Implements: UI/UX Specification, Design System (doc 02) — token
 * categories AND their ratified values. Brand colors/fonts (Blocking
 * Issue B10) were ratified 2026-07-21 (Decision Log item B10/C1) —
 * mirroring ahmedhamdyraouf.com's own live CSS for Primary/backgrounds/
 * text; Success/Warning/Danger/Info have no live-site equivalent and use
 * this ratification's own recommendation instead (see Color System/
 * README.md). Replacing a value later is a data change to this one file,
 * not a redesign of any component that consumes a token by name.
 */

export interface ColorToken {
  name: string;
  cssVariable: string;
  placeholderValue: string;
}

/** Semantic color roles — Design System (doc 02) §"Colors." Values match the ratified set in apps/web/app/globals.css. */
export const COLOR_TOKENS: readonly ColorToken[] = [
  { name: "primary", cssVariable: "--color-primary", placeholderValue: "#c7a86b" },
  { name: "secondary", cssVariable: "--color-secondary", placeholderValue: "#d6b57a" },
  { name: "neutral", cssVariable: "--color-neutral", placeholderValue: "#8a8a8a" },
  { name: "success", cssVariable: "--color-success", placeholderValue: "#3fb950" },
  { name: "warning", cssVariable: "--color-warning", placeholderValue: "#d9a441" },
  { name: "danger", cssVariable: "--color-danger", placeholderValue: "#e5484d" },
  { name: "info", cssVariable: "--color-info", placeholderValue: "#5b8dc7" },
];

export interface SpacingToken {
  name: string;
  cssVariable: string;
  placeholderValue: string;
}

/** Base-unit spacing scale — Design System (doc 02) §"Spacing." */
export const SPACING_TOKENS: readonly SpacingToken[] = [
  { name: "1x", cssVariable: "--space-1x", placeholderValue: "0.25rem" },
  { name: "2x", cssVariable: "--space-2x", placeholderValue: "0.5rem" },
  { name: "3x", cssVariable: "--space-3x", placeholderValue: "0.75rem" },
  { name: "4x", cssVariable: "--space-4x", placeholderValue: "1rem" },
  { name: "6x", cssVariable: "--space-6x", placeholderValue: "1.5rem" },
  { name: "8x", cssVariable: "--space-8x", placeholderValue: "2rem" },
  { name: "12x", cssVariable: "--space-12x", placeholderValue: "3rem" },
];

export interface RadiusToken {
  name: string;
  cssVariable: string;
  placeholderValue: string;
}

/** Border radius scale — Design System (doc 02) §"Border Radius." */
export const RADIUS_TOKENS: readonly RadiusToken[] = [
  { name: "none", cssVariable: "--radius-none", placeholderValue: "0" },
  { name: "small", cssVariable: "--radius-small", placeholderValue: "0.25rem" },
  { name: "medium", cssVariable: "--radius-medium", placeholderValue: "0.5rem" },
  { name: "full", cssVariable: "--radius-full", placeholderValue: "9999px" },
];

/** Generates a CSS custom-property block from the token catalogs above — one function, not hand-copied CSS. */
export function buildThemeCssVariables(): string {
  const lines = [
    ...COLOR_TOKENS.map((t) => `  ${t.cssVariable}: ${t.placeholderValue};`),
    ...SPACING_TOKENS.map((t) => `  ${t.cssVariable}: ${t.placeholderValue};`),
    ...RADIUS_TOKENS.map((t) => `  ${t.cssVariable}: ${t.placeholderValue};`),
  ];
  return `:root {\n${lines.join("\n")}\n}`;
}
