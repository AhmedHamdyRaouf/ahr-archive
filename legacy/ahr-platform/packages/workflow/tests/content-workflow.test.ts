import { describe, it, expect } from "vitest";
import * as contentWorkflow from "../src/content-workflow";
import * as cmsCore from "@ahr/cms-core";
import * as relationships from "@ahr/relationships";

describe("content-workflow — re-exports, not duplicates (Milestone 10)", () => {
  it("re-exports @ahr/cms-core's exact status graph functions, not a copy", () => {
    expect(contentWorkflow.assertValidTransition).toBe(cmsCore.assertValidTransition);
    expect(contentWorkflow.getAllowedNextStatuses).toBe(cmsCore.getAllowedNextStatuses);
    expect(contentWorkflow.genericTransitionStatus).toBe(cmsCore.genericTransitionStatus);
    expect(contentWorkflow.STATUS_VALUES).toBe(cmsCore.STATUS_VALUES);
  });

  it("re-exports @ahr/relationships' exact history-reading functions, not a copy", () => {
    expect(contentWorkflow.getStateHistory).toBe(relationships.getStateHistory);
    expect(contentWorkflow.getCurrentStatusFromHistory).toBe(
      relationships.getCurrentStatusFromHistory,
    );
  });
});
