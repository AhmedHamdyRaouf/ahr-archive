/**
 * @ahr/eslint-config/eslint-preset-node
 *
 * Shared lint rules for every non-Next.js workspace in the monorepo
 * (packages/* — plain TypeScript library code, no React/Next.js runtime).
 *
 * Architectural reference: Coding Standards ("Shared lint rules live in
 * packages/config and are extended by every app/package — no per-app rule
 * divergence without updating the shared preset first").
 *
 * Fixed per Milestone 1 Bootstrap Verification (Phase 2 CTO Audit): the
 * original `eslint-preset.js` extends "next/core-web-vitals", which only
 * resolves inside a Next.js application and cannot be used by a plain
 * TypeScript package — this is why no packages/* workspace previously had
 * a working `.eslintrc`/`lint` script. This preset is a Next.js-independent
 * sibling for exactly that case, not a replacement for the original.
 * `apps/web`'s `.eslintrc.js` is unchanged and continues to extend the
 * original `eslint-preset.js`.
 */
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  rules: {
    // Matches the same, deliberate exception already documented in
    // eslint-preset.js: the base rule misreads interface/type method
    // signatures as unused variables.
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { args: "none" }],
    "no-console": ["warn", { allow: ["warn", "error"] }],
    // Coding Standards: "No `any` without an inline comment explaining why."
    // That is a documentation requirement, not a ban — this rule is a
    // visible nudge (warn), matching how `no-console` is already handled
    // in this preset, not a hard error that would block an existing,
    // justified test-mock usage.
    "@typescript-eslint/no-explicit-any": "warn",
  },
  ignorePatterns: ["dist/", "node_modules/", "*.tsbuildinfo"],
};
