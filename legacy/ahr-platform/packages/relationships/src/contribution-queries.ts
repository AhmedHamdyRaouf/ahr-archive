/**
 * Implements: Relationship Model (Phase 4) — Contribution is the core
 * Person ↔ Work/Project/Event relationship. This module provides the
 * read-side cross-entity queries every direction of that relationship
 * needs — Contribution writes themselves are already `@ahr/content`'s
 * responsibility (Package 04/CMS API's generic entity family, Milestone
 * 5); this package does not duplicate that write path.
 */

import type { RelationshipQueryClient } from "./types";

export interface ContributionRow {
  id: string;
  person_id: string;
  work_id: string | null;
  project_id: string | null;
  event_id: string | null;
  role: string;
  role_detail_ar: string | null;
  role_detail_en: string | null;
  credit_order: number | null;
}

async function queryContributionsByColumn(
  client: RelationshipQueryClient,
  column: "person_id" | "work_id" | "project_id" | "event_id",
  value: string,
): Promise<ContributionRow[]> {
  const { data, error } = await client.from("contribution").select("*").eq(column, value);
  if (error) {
    throw new Error(`Failed to query contributions by ${column}="${value}": ${error.message}`);
  }
  return (data ?? []) as ContributionRow[];
}

/** Every Contribution a given Person has made, across Works/Projects/Events. */
export function getContributionsForPerson(client: RelationshipQueryClient, personId: string) {
  return queryContributionsByColumn(client, "person_id", personId);
}

/** Every Contribution (and therefore Person) linked to a given Work. */
export function getContributionsForWork(client: RelationshipQueryClient, workId: string) {
  return queryContributionsByColumn(client, "work_id", workId);
}

export function getContributionsForProject(client: RelationshipQueryClient, projectId: string) {
  return queryContributionsByColumn(client, "project_id", projectId);
}

export function getContributionsForEvent(client: RelationshipQueryClient, eventId: string) {
  return queryContributionsByColumn(client, "event_id", eventId);
}

/**
 * Cross-entity convenience: every Person id credited on a given Work, via
 * their Contributions — a common read pattern (Work Detail's "Contributors"
 * section, UI/UX Specification Website UI doc 08) built on the same
 * underlying query rather than a separate one.
 */
export async function getPersonIdsForWork(
  client: RelationshipQueryClient,
  workId: string,
): Promise<string[]> {
  const contributions = await getContributionsForWork(client, workId);
  return [...new Set(contributions.map((c) => c.person_id))];
}
