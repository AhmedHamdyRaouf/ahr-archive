/**
 * Implements: Relationship Model, Data Integrity Rules (Phase 4) — Award
 * always references a granting Organization (required) and optionally a
 * recipient Person.
 */

import type { RelationshipQueryClient } from "./types";

export interface AwardRow {
  id: string;
  title_ar: string;
  title_en: string;
  year: number | null;
  organization_id: string;
  person_id: string | null;
}

export async function getAwardsForOrganization(
  client: RelationshipQueryClient,
  organizationId: string,
): Promise<AwardRow[]> {
  const { data, error } = await client
    .from("award")
    .select("*")
    .eq("organization_id", organizationId);
  if (error) {
    throw new Error(
      `Failed to query awards for organization "${organizationId}": ${error.message}`,
    );
  }
  return (data ?? []) as AwardRow[];
}

export async function getAwardsForPerson(
  client: RelationshipQueryClient,
  personId: string,
): Promise<AwardRow[]> {
  const { data, error } = await client.from("award").select("*").eq("person_id", personId);
  if (error) {
    throw new Error(`Failed to query awards for person "${personId}": ${error.message}`);
  }
  return (data ?? []) as AwardRow[];
}
