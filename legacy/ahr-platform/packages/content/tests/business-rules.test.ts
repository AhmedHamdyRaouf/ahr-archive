import { describe, it, expect } from "vitest";
import {
  assertContributionHasTarget,
  assertPressMentionHasSubject,
  assertHasContributionBeforePublish,
  BusinessRuleError,
  CONTRIBUTION_REQUIRED_BEFORE_PUBLISH,
  type ContributionCheckClient,
} from "../src/business-rules";
import type { QueryBuilderLike, ListQueryResult } from "@ahr/cms-core";

/**
 * A minimal QueryBuilderLike mock — chainable AND awaitable, matching the
 * real Supabase/PostgREST query builder shape (@ahr/cms-core's own type).
 */
function makeQueryBuilder(result: ListQueryResult<unknown>): QueryBuilderLike {
  const builder: QueryBuilderLike = {
    range: () => builder,
    order: () => builder,
    eq: () => builder,
    or: () => builder,
    then: (onfulfilled) => Promise.resolve(result).then(onfulfilled as never),
  };
  return builder;
}

function createMockClient(result: ListQueryResult<unknown>): ContributionCheckClient {
  return {
    from: () => ({
      select: () => makeQueryBuilder(result),
    }),
  } as unknown as ContributionCheckClient;
}

describe("business-rules — Data Integrity Rules beyond generic validation (Milestone 5)", () => {
  it("assertContributionHasTarget passes when work_id is set", () => {
    expect(() => assertContributionHasTarget({ work_id: "w1" })).not.toThrow();
  });

  it("assertContributionHasTarget passes when only project_id is set", () => {
    expect(() => assertContributionHasTarget({ project_id: "p1" })).not.toThrow();
  });

  it("assertContributionHasTarget throws when none are set", () => {
    expect(() => assertContributionHasTarget({})).toThrow(BusinessRuleError);
  });

  it("assertPressMentionHasSubject passes with exactly one subject", () => {
    expect(() => assertPressMentionHasSubject({ person_id: "p1" })).not.toThrow();
  });

  it("assertPressMentionHasSubject throws with zero subjects", () => {
    expect(() => assertPressMentionHasSubject({})).toThrow(BusinessRuleError);
  });

  it("assertPressMentionHasSubject throws with two subjects (not just 'at least one')", () => {
    expect(() => assertPressMentionHasSubject({ person_id: "p1", work_id: "w1" })).toThrow(
      /exactly one subject/,
    );
  });

  it("CONTRIBUTION_REQUIRED_BEFORE_PUBLISH covers ONLY 'works' — not projects/events (scope discipline)", () => {
    expect(CONTRIBUTION_REQUIRED_BEFORE_PUBLISH.works).toBe("work_id");
    expect(CONTRIBUTION_REQUIRED_BEFORE_PUBLISH.projects).toBeUndefined();
    expect(CONTRIBUTION_REQUIRED_BEFORE_PUBLISH.events).toBeUndefined();
  });

  it("assertHasContributionBeforePublish throws MISSING_CONTRIBUTION when count is 0", async () => {
    const client = createMockClient({ data: [], count: 0, error: null });
    await expect(assertHasContributionBeforePublish(client, "work_id", "w1")).rejects.toThrow(
      /at least one Contribution/,
    );
  });

  it("assertHasContributionBeforePublish resolves when count >= 1", async () => {
    const client = createMockClient({ data: [], count: 2, error: null });
    await expect(
      assertHasContributionBeforePublish(client, "work_id", "w1"),
    ).resolves.toBeUndefined();
  });

  it("assertHasContributionBeforePublish surfaces a query error distinctly", async () => {
    const client = createMockClient({ data: null, count: null, error: { message: "db down" } });
    await expect(assertHasContributionBeforePublish(client, "work_id", "w1")).rejects.toThrow(
      /db down/,
    );
  });
});
