import { describe, it, expect, vi } from "vitest";
import { listActivityLog } from "../src/activity-log";

/**
 * A minimal, self-contained chainable query-builder mock, scoped to only
 * this test file (rather than extending the shared mock-supabase.ts,
 * which models a different call shape --
 * `select().eq().maybeSingle()` for platform_user lookups, not the
 * `select().order().range()` list-query shape `listActivityLog` needs).
 */
function createListQueryMock(rows: Record<string, unknown>[], count: number) {
  const calls: { method: string; args: unknown[] }[] = [];
  const builder: Record<string, unknown> = {};

  const chain = (method: string) =>
    vi.fn((...args: unknown[]) => {
      calls.push({ method, args });
      return builder;
    });

  builder.select = chain("select");
  builder.order = chain("order");
  builder.eq = chain("eq");
  builder.gte = chain("gte");
  builder.lte = chain("lte");
  // .range() is the terminal call in listActivityLog's own chain — it
  // resolves the query, matching how the real supabase-js client behaves
  // (the builder is itself a thenable once a terminal method is called).
  builder.range = vi.fn(() => Promise.resolve({ data: rows, error: null, count }));

  return { from: vi.fn().mockReturnValue(builder), __calls: calls };
}

describe("activity-log — listActivityLog (Phase 3 CTO Audit — Admin Dashboard fix)", () => {
  it("returns rows, total count, and echoes page/pageSize", async () => {
    const rows = [{ id: "1", action: "login" }];
    const supabase = createListQueryMock(rows, 1);

    const result = await listActivityLog(supabase as never, { page: 2, pageSize: 10 });

    expect(result.data).toEqual(rows);
    expect(result.totalItems).toBe(1);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(10);
  });

  it("defaults to page 1, pageSize 20 when not specified", async () => {
    const supabase = createListQueryMock([], 0);
    const result = await listActivityLog(supabase as never);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it("caps pageSize at 100, matching every other list endpoint's convention (07-API.md §5)", async () => {
    const supabase = createListQueryMock([], 0);
    const result = await listActivityLog(supabase as never, { pageSize: 500 });
    expect(result.pageSize).toBe(100);
  });

  it("applies actorId, action, and date-range filters only when provided", async () => {
    const supabase = createListQueryMock([], 0);
    await listActivityLog(supabase as never, {
      filters: { actorId: "a1", action: "login", dateFrom: "2026-01-01", dateTo: "2026-01-31" },
    });
    const methods = supabase.__calls.map((c) => c.method);
    expect(methods).toContain("eq");
    expect(methods).toContain("gte");
    expect(methods).toContain("lte");
  });

  it("applies no filter calls when none are provided", async () => {
    const supabase = createListQueryMock([], 0);
    await listActivityLog(supabase as never, {});
    const methods = supabase.__calls.map((c) => c.method);
    expect(methods).not.toContain("eq");
    expect(methods).not.toContain("gte");
    expect(methods).not.toContain("lte");
  });

  it("throws a clear error when the query fails, rather than returning a silently empty page", async () => {
    const builder: Record<string, unknown> = {};
    builder.select = vi.fn().mockReturnValue(builder);
    builder.order = vi.fn().mockReturnValue(builder);
    builder.range = vi.fn(() =>
      Promise.resolve({ data: null, error: { message: "db unavailable" }, count: null }),
    );
    const supabase = { from: vi.fn().mockReturnValue(builder) };

    await expect(listActivityLog(supabase as never)).rejects.toThrow(/db unavailable/);
  });
});
