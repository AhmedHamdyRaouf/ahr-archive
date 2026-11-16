# Package 05 — Contacts & Organizations

**Status:** 🟡 Working — pending review, **contains unresolved schema gaps (see §13, §21)**
**Package Type:** Admin authoring tool (part of the Archive ecosystem), lives inside the Dashboard shell

## 1. Package Overview

Manages `organization` records — institutions, companies, venues, festivals, media outlets, brands, and government entities — related to Ahmed Hamdy Raouf's professional archive, plus their relationships to other Archive entities (via `award`, `project`, `event`, `press_mention`).

**This package is scoped strictly to the frozen Database Architecture (v1).** Several requested capabilities exceed what the frozen schema currently stores — those are called out explicitly below, not silently implemented with invented tables/columns.

## 2. Objectives

- Provide a single place to manage every Organization AHR's archive references.
- Surface an organization's full relationship history (awards granted, projects sponsored, events organized, press published) by querying existing foreign keys — not by inventing a new relationship table.

## 3. Scope

**In scope (fully supported by frozen schema):** Organization CRUD, lifecycle (Draft→...→Published/Archived), viewing an organization's linked Awards/Projects/Events/Press Mentions.
**In scope, but blocked pending a schema decision (see §13):** Structured contact information, internal notes, external links, tags/categories on organizations.
**Out of scope:** Academy, Students, Courses, Training, CRM Leads, Sales Pipelines, or any Release 2 feature — none of these appear anywhere in this package.

## 4. Features

- Organization list + create/edit form (name, description, bilingual, lifecycle status).
- "Related records" view per organization: every `award`, `project`, `event`, `press_mention` row that references it.
- ⚠️ Contact info / notes / tags / categories / external links — **requested but not buildable against the frozen schema as-is** (§13).

## 5. User Stories

- As the Administrator, I can create an Organization and see it in Draft.
- As the Administrator, I can view every Award, Project, Event, and Press Mention linked to an Organization in one place.
- As the Administrator, I want to record a contact phone/email, internal notes, and a website link for an Organization — **not currently possible without a schema change (§13).**
- As the Administrator, I want to tag/categorize Organizations the way Works and Projects are tagged — **not currently possible without a schema change (§13), since no `organization_tag`/`organization_category` join table exists.**

## 6. Functional Requirements

| ID | Requirement | Status |
|---|---|---|
| FR-1 | The system must support create/edit/list of `organization` rows with full lifecycle. | ✅ Supported |
| FR-2 | The system must show all records referencing a given Organization via existing foreign keys. | ✅ Supported |
| FR-3 | The system must store structured contact information per Organization. | 🔴 **Blocked — no column exists (§13)** |
| FR-4 | The system must support tagging and categorizing Organizations. | 🔴 **Blocked — no join tables exist (§13)** |
| FR-5 | The system must support internal notes and external links per Organization. | 🔴 **Blocked — no column exists (§13)** |

## 7. Non-Functional Requirements

Same bilingual/accessibility/audit expectations as every other CMS-adjacent package (see Package 02, §7).

## 8. Pages

| Page | Path | Notes |
|---|---|---|
| Organization list | `/{locale}/dashboard/contacts` | Filter by lifecycle status |
| Organization detail/edit | `/{locale}/dashboard/contacts/[id]` | Includes "Related Records" panel |

## 9. Components

- `OrganizationForm` (bilingual name/description, lifecycle controls — reuses `EntityForm` shape from Package 02)
- `RelatedRecordsPanel` (lists linked Award/Project/Event/Press Mention rows)

## 10. Navigation Flow

```
Dashboard shell → Contacts & Organizations → list → detail
                                                    → related records (read-only, links out to CMS for the related item)
```

## 11. Complete Workflow

```
① Administrator creates an Organization (status=draft)
② Administrator completes name_ar/name_en/description_ar/description_en
③ Administrator moves it through the standard lifecycle (Package 04's shared function)
④ Once Published, other packages (Package 02: Award/Project/Event forms) can reference it
⑤ Administrator can view, at any time, everything that currently references this Organization
```

## 12. Roles & Permissions

Administrator only (Database Architecture §7) — same as every other admin package in V1.

## 13. Database Tables Used — and the Schema Gap

**Tables that exist and are used as-is:** `organization` (core fields only: `name_ar`, `name_en`, `description_ar`, `description_en`, plus the standard audit/lifecycle columns), `award`, `project`, `event`, `press_mention` (read-only, to populate the Related Records panel — this package does not own their schemas).

**Requested features with no supporting column/table in the Frozen v1 schema:**

| Requested feature | What would be needed | Currently exists? |
|---|---|---|
| Contact information (phone, email, address) | Structured columns or a `jsonb` field on `organization` | ❌ No |
| Internal notes | A `notes` text column on `organization` | ❌ No |
| External links (website, social) | A structured field on `organization`, similar in spirit to `platform_settings`'s `social_media_links` key | ❌ No |
| Tags on Organizations | An `organization_tag` join table (parallel to `work_tag`/`project_tag`) | ❌ No |
| Categories on Organizations | An `organization_category` join table (parallel to `work_category`/`project_category`) | ❌ No |

**This document does not invent these**, per your explicit instruction. They are listed here as a required decision before this package can be considered complete — see §21 and the recommendation in §22.

## 14. APIs Required

- Organization CRUD Server Actions, built on Package 04's shared entity patterns.
- A read-only "related records" query joining `award`/`project`/`event`/`press_mention` on `organization_id`.

## 15. Validation Rules

Same as any Archive entity (Package 04): `name_ar`/`name_en` required; lifecycle transitions cannot skip a stage.

## 16. Business Rules

- An Organization cannot be deleted, only archived (No Hard Delete, Phase 1) — and since `award.organization_id` is `NOT NULL` with `ON DELETE RESTRICT`, an Organization referenced by any Award cannot even be archived-and-forgotten without those Awards being considered first (a UI warning, not a database error, should surface this).

## 17. Security Considerations

Standard Administrator-only write access, Row Level Security backstop (Database Architecture §8) — identical posture to Package 02.

## 18. Edge Cases

- An Organization with zero related records (newly created) — Related Records panel should render an empty state, not an error.
- Attempting to archive an Organization that is the sole `organization_id` for a Published Award — should warn, per §16.

## 19. Error Handling

Same pattern as Package 02 (§19): inline field errors, explanatory lifecycle-transition errors.

## 20. Acceptance Criteria

- [ ] Organization CRUD works end to end with lifecycle transitions.
- [ ] Related Records panel correctly aggregates Award/Project/Event/Press Mention.
- [ ] Contact info / notes / tags / external links are explicitly documented as **not implemented in V1** wherever they appear in any UI mockup or user-facing text — not silently dropped without explanation.

## 21. Dependencies

- **Depends on:** Package 04 (Archive, for shared entity/lifecycle mechanics), Database Architecture (Frozen v1).
- **Depended on by:** Package 02 (Award/Project/Event forms reference Organizations created here).
- **Blocked by:** A Database Architecture amendment decision (§13) — this package cannot fully satisfy your stated scope (contact info, notes, tags, external links) without one.

## 22. Future Improvements (Post v1) — and a Recommendation for Now

Recommended path, for your decision, not assumed here: add a single `jsonb` column, `organization.contact_details` (holding phone/email/address/external links/notes as one structured object — mirroring the `platform_settings.value` key-value pattern already frozen), plus two new join tables `organization_category`/`organization_tag`, in a **Database Architecture Review Round 2**, before this package is built. This keeps the schema-change surface small and consistent with patterns already frozen, rather than one-off columns.

## 23. Testing Checklist

- [ ] Organization CRUD + lifecycle.
- [ ] Related Records aggregation correctness across all four referencing tables.
- [ ] (Once §13's gap is resolved) contact info / tags / notes CRUD.

## 24. UX Notes

Until §13 is resolved, the Organization form should not display empty, non-functional fields for contact info/notes/tags — better to omit them from the UI entirely than show inputs that silently don't save.

## 25. Developer Notes

**Do not add ad hoc columns to `organization` to unblock this package without going through a Database Architecture review round** — the Frozen v1 status of that document (per its own closing line) means further structural changes require an explicit new review, the same process used for `platform_settings`/`activity_log`/`moderation_report`.

---

**Status:**
🟡 Working — schema gap unresolved

**Package:**
05 — Contacts & Organizations

**Reviewed By:**
Claude

**Approved By:**
Pending

**Dependencies:**
Package 04 (Archive), Database Architecture (Frozen v1) — **pending amendment, see §13**
