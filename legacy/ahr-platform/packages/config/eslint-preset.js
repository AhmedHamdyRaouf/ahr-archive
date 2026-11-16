/**
 * @ahr/eslint-config
 *
 * Shared lint rules for every workspace in the AHR Platform monorepo.
 * Architectural reference: Implementation Principles (Phase 9) —
 * "traceability from code back to architecture is mandatory" starts with
 * consistent code quality rules across every module.
 */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "prettier"],
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    // The base "no-unused-vars" rule doesn't understand TypeScript type
    // contexts — it flags parameter names in interface/type method
    // signatures (e.g. `(ids: string[]) => void` inside an interface) as
    // unused variables, which is a false positive. The TypeScript-aware
    // version correctly skips those (discovered while building Milestone
    // 4's generic, heavily-interface-typed CMS Foundation components).
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { args: "none" }],
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
};
