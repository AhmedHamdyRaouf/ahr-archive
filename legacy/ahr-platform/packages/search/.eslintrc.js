/**
 * Extends the shared, Next.js-independent lint preset for plain
 * TypeScript packages (packages/config/eslint-preset-node.js).
 * Fixed per Milestone 1 Bootstrap Verification (Phase 2 CTO Audit).
 */
module.exports = {
  root: true,
  extends: ["@ahr/eslint-config/eslint-preset-node"],
};
