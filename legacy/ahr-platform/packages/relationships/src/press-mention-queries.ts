/**
 * Implements: Relationship Model, Data Integrity Rules (Phase 4) — Press
 * Mention's "exactly one subject" relationship (Person/Work/Event/
 * Organization). Read-side cross-entity queries; writes remain
 * `@ahr/content`'s responsibility (Milestone 5).
 */

import type { RelationshipQueryClient } from "./types";

export interface PressMentionRow {
  id: string;
  title_ar: string | null;
  title_en: string | null;
  publication_name: string;
  url: string | null;
  published_date: string | null;
  person_id: string | null;
  work_id: string | null;
  event_id: string | null;
  organization_id: string | null;
}

export type PressMentionSubjectType = "person" | "work" | "event" | "organization";

const SUBJECT_COLUMN: Record<PressMentionSubjectType, string> = {
  person: "person_id",
  work: "work_id",
  event: "event_id",
  organization: "organization_id",
};

/** Every Press Mention whose subject is the given entity — regardless of which of the four subject columns is set. */
export async function getPressMentionsForSubject(
  client: RelationshipQueryClient,
  subjectType: PressMentionSubjectType,
  subjectId: string,
): Promise<PressMentionRow[]> {
  const { data, error } = await client
    .from("press_mention")
    .select("*")
    .eq(SUBJECT_COLUMN[subjectType], subjectId);

  if (error) {
    throw new Error(
      `Failed to query press mentions for ${subjectType} "${subjectId}": ${error.message}`,
    );
  }
  return (data ?? []) as PressMentionRow[];
}
