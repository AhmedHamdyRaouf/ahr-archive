import { describe, it, expect } from "vitest";
import {
  globalSearch,
  archiveSearch,
  organizationSearch,
  cmsSearch,
  mediaSearch,
} from "../src/search-service";
import { createMockSearchClient } from "./mock-search-client";
import type { SearchParams } from "../src/types";

const baseParams: SearchParams = {
  query: "ahmed",
  locale: "en",
  pagination: { page: 1, pageSize: 20 },
};

describe("search-service — unified Search API (Milestone 9)", () => {
  it("globalSearch merges results across all 5 entity types", async () => {
    const client = createMockSearchClient({
      person: {
        rows: [
          {
            id: "p1",
            public_id: "ahmed-person",
            name_ar: "أحمد",
            name_en: "Ahmed",
            status: "published",
            verification_status: "verified",
            updated_at: "2026-06-01T00:00:00Z",
          },
        ],
        count: 1,
      },
      work: {
        rows: [
          {
            id: "w1",
            public_id: "ahmed-song",
            title_ar: "",
            title_en: "Ahmed's Song",
            status: "published",
            verification_status: "pending",
            updated_at: "2026-01-01T00:00:00Z",
          },
        ],
        count: 1,
      },
    });

    const result = await globalSearch(client, baseParams);
    expect(result.data.length).toBe(2);
    expect(result.meta.totalItems).toBe(2);
  });

  it("globalSearch ranks an exact match above a partial match, by default", async () => {
    const client = createMockSearchClient({
      person: {
        rows: [
          {
            id: "p1",
            public_id: "ahmed",
            name_ar: "",
            name_en: "Ahmed",
            status: "published",
            verification_status: "pending",
            updated_at: "2020-01-01T00:00:00Z",
          },
        ],
        count: 1,
      },
      work: {
        rows: [
          {
            id: "w1",
            public_id: "song",
            title_ar: "",
            title_en: "A song about Ahmed's life",
            status: "published",
            verification_status: "verified",
            updated_at: "2026-01-01T00:00:00Z",
          },
        ],
        count: 1,
      },
    });

    const result = await globalSearch(client, baseParams);
    // Exact match ("Ahmed") should outrank a substring match even though
    // the substring match has better verification/recency signals —
    // match quality is the dominant signal (relevance.ts's own design).
    expect(result.data[0]?.id).toBe("p1");
  });

  it("globalSearch enforces published+public visibility (query construction)", async () => {
    const client = createMockSearchClient({ person: { rows: [], count: 0 } });
    await globalSearch(client, { ...baseParams, filters: { entityTypes: ["persons"] } });
    const eqCalls = client.calls.filter((c) => c.method === "eq");
    expect(eqCalls.some((c) => c.args[0] === "status" && c.args[1] === "published")).toBe(true);
    expect(eqCalls.some((c) => c.args[0] === "visibility" && c.args[1] === "public")).toBe(true);
  });

  it("globalSearch respects an entityTypes filter, searching only the requested types", async () => {
    const client = createMockSearchClient({
      person: {
        rows: [
          {
            id: "p1",
            public_id: "x",
            name_ar: "",
            name_en: "Ahmed",
            status: "published",
            verification_status: "pending",
            updated_at: "2026-01-01T00:00:00Z",
          },
        ],
        count: 1,
      },
      work: {
        rows: [
          {
            id: "w1",
            public_id: "y",
            title_ar: "",
            title_en: "Ahmed",
            status: "published",
            verification_status: "pending",
            updated_at: "2026-01-01T00:00:00Z",
          },
        ],
        count: 1,
      },
    });
    const result = await globalSearch(client, {
      ...baseParams,
      filters: { entityTypes: ["persons"] },
    });
    expect(result.data.every((item) => item.entityType === "persons")).toBe(true);
  });

  it("archiveSearch restricts to works/projects/events only", async () => {
    const client = createMockSearchClient({
      person: {
        rows: [
          {
            id: "p1",
            public_id: "x",
            name_ar: "",
            name_en: "Ahmed",
            status: "published",
            verification_status: "pending",
            updated_at: "2026-01-01T00:00:00Z",
          },
        ],
        count: 1,
      },
      work: {
        rows: [
          {
            id: "w1",
            public_id: "y",
            title_ar: "",
            title_en: "Ahmed",
            status: "published",
            verification_status: "pending",
            updated_at: "2026-01-01T00:00:00Z",
          },
        ],
        count: 1,
      },
    });
    const result = await archiveSearch(client, baseParams);
    expect(result.data.every((item) => item.entityType !== "persons")).toBe(true);
  });

  it("organizationSearch scopes to organizations only", async () => {
    const client = createMockSearchClient({
      organization: {
        rows: [
          {
            id: "o1",
            public_id: "org-1",
            name_ar: "",
            name_en: "Ahmed Foundation",
            status: "published",
            verification_status: "verified",
            updated_at: "2026-01-01T00:00:00Z",
          },
        ],
        count: 1,
      },
    });
    const result = await organizationSearch(client, baseParams);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.entityType).toBe("organizations");
  });

  it("cmsSearch does NOT filter by status/visibility (admin sees everything)", async () => {
    const client = createMockSearchClient({
      work: {
        rows: [
          {
            id: "w1",
            public_id: "draft-work",
            title_ar: "",
            title_en: "Ahmed Draft",
            status: "draft",
            verification_status: "pending",
            updated_at: "2026-01-01T00:00:00Z",
          },
        ],
        count: 1,
      },
    });
    const result = await cmsSearch(client, "works", baseParams);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.status).toBe("draft");
    const eqCalls = client.calls.filter((c) => c.method === "eq" && c.args[0] === "visibility");
    expect(eqCalls).toHaveLength(0); // never applies the public-visibility filter
  });

  it("cmsSearch applies an explicit status filter when given one", async () => {
    const client = createMockSearchClient({ work: { rows: [], count: 0 } });
    await cmsSearch(client, "works", { ...baseParams, filters: { status: "review" } });
    const eqCalls = client.calls.filter((c) => c.method === "eq" && c.args[0] === "status");
    expect(eqCalls.some((c) => c.args[1] === "review")).toBe(true);
  });

  it("mediaSearch matches captions and enforces published+public", async () => {
    const client = createMockSearchClient({
      media_asset: {
        rows: [
          {
            id: "m1",
            media_type: "image",
            caption_ar: "",
            caption_en: "Ahmed at the piano",
            status: "published",
            updated_at: "2026-01-01T00:00:00Z",
          },
        ],
        count: 1,
      },
    });
    const result = await mediaSearch(client, baseParams);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.captionEn).toBe("Ahmed at the piano");
    const eqCalls = client.calls.filter((c) => c.method === "eq");
    expect(eqCalls.some((c) => c.args[0] === "visibility" && c.args[1] === "public")).toBe(true);
  });

  it("propagates a query error clearly", async () => {
    const client = createMockSearchClient({
      organization: { rows: [], count: 0, error: { message: "db down" } },
    });
    await expect(organizationSearch(client, baseParams)).rejects.toThrow(/db down/);
  });
});
