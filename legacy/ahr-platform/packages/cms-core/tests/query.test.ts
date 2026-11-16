import { describe, it, expect } from "vitest";
import {
  applyListQuery,
  normalizePagination,
  buildPaginationMeta,
  MAX_PAGE_SIZE,
} from "../src/query";
import type { QueryBuilderLike, ListQueryResult } from "../src/query";

function createMockBuilder(): QueryBuilderLike & { calls: string[] } {
  const calls: string[] = [];
  const result: ListQueryResult<unknown> = { data: [], count: 0, error: null };

  const builder: QueryBuilderLike & { calls: string[] } = {
    calls,
    range(from, to) {
      calls.push(`range(${from},${to})`);
      return builder;
    },
    order(field, options) {
      calls.push(`order(${field},${options.ascending})`);
      return builder;
    },
    eq(field, value) {
      calls.push(`eq(${field},${value})`);
      return builder;
    },
    or(expr) {
      calls.push(`or(${expr})`);
      return builder;
    },
    then(onfulfilled) {
      return Promise.resolve(result).then(onfulfilled as never);
    },
  };
  return builder;
}

describe("query — Pagination/Filtering/Sorting/Search (Milestone 4)", () => {
  it("normalizePagination defaults to page 1, pageSize 20", () => {
    expect(normalizePagination({})).toEqual({ page: 1, pageSize: 20 });
  });

  it("normalizePagination caps pageSize at MAX_PAGE_SIZE (100)", () => {
    expect(normalizePagination({ pageSize: 500 })).toEqual({ page: 1, pageSize: MAX_PAGE_SIZE });
  });

  it("normalizePagination rejects non-positive page/pageSize by falling back to defaults", () => {
    expect(normalizePagination({ page: -5, pageSize: 0 })).toEqual({ page: 1, pageSize: 20 });
  });

  it("applyListQuery computes range() from page/pageSize correctly", () => {
    const builder = createMockBuilder();
    applyListQuery(builder, { pagination: { page: 2, pageSize: 10 } });
    expect(builder.calls).toContain("range(10,19)");
  });

  it("applyListQuery applies sort when provided", () => {
    const builder = createMockBuilder();
    applyListQuery(builder, {
      pagination: { page: 1, pageSize: 20 },
      sort: { field: "created_at", direction: "desc" },
    });
    expect(builder.calls).toContain("order(created_at,false)");
  });

  it("applyListQuery always chains a stable id tiebreaker after the requested sort, so ties in the sort field can't overlap pages", () => {
    const builder = createMockBuilder();
    applyListQuery(builder, {
      pagination: { page: 1, pageSize: 20 },
      sort: { field: "year", direction: "desc" },
    });
    expect(builder.calls).toEqual(["range(0,19)", "order(year,false)", "order(id,true)"]);
  });

  it("applyListQuery still adds the id tiebreaker even when no sort is requested", () => {
    const builder = createMockBuilder();
    applyListQuery(builder, { pagination: { page: 1, pageSize: 20 } });
    expect(builder.calls).toContain("order(id,true)");
  });

  it("applyListQuery applies each filter as eq(), skipping undefined values", () => {
    const builder = createMockBuilder();
    applyListQuery(builder, {
      pagination: { page: 1, pageSize: 20 },
      filters: { status: "published", verificationStatus: undefined },
    });
    expect(builder.calls).toContain("eq(status,published)");
    expect(builder.calls.some((c) => c.includes("verificationStatus"))).toBe(false);
  });

  it("applyListQuery applies an or() search filter across the given fields", () => {
    const builder = createMockBuilder();
    applyListQuery(builder, {
      pagination: { page: 1, pageSize: 20 },
      search: "hello",
      searchFields: ["name_ar", "name_en"],
    });
    expect(builder.calls).toContain("or(name_ar.ilike.%hello%,name_en.ilike.%hello%)");
  });

  it("applyListQuery does not call or() when search is provided but searchFields is empty", () => {
    const builder = createMockBuilder();
    applyListQuery(builder, {
      pagination: { page: 1, pageSize: 20 },
      search: "hello",
      searchFields: [],
    });
    expect(builder.calls.some((c) => c.startsWith("or("))).toBe(false);
  });

  it("buildPaginationMeta computes totalPages correctly, minimum 1", () => {
    expect(buildPaginationMeta({ page: 1, pageSize: 20 }, 0)).toMatchObject({ totalPages: 1 });
    expect(buildPaginationMeta({ page: 1, pageSize: 20 }, 45)).toMatchObject({ totalPages: 3 });
  });
});
