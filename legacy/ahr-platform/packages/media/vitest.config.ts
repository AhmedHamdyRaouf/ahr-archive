import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Added Phase 3 CTO Audit (Testing & QA Final Review — Coverage
    // Report): no coverage tooling existed anywhere in the project before
    // this. v8 is Vitest's native, zero-extra-instrumentation provider.
    // Thresholds are informational (report generation), not enforced as a
    // CI gate in this pass — see the Testing & QA Final Review Report for
    // why enforcing a hard threshold now, without a baseline history,
    // would be an arbitrary number rather than a considered one.
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.d.ts"],
    },
  },
});
