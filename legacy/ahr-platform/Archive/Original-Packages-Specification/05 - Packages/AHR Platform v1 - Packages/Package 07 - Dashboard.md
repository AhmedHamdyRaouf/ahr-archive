# Package 07 — Dashboard

**Status:** 🟡 Working — pending review
**Package Type:** Admin shell — hosts every authenticated package

## 1. Package Overview

Dashboard is the authenticated shell every admin-facing package lives inside: navigation, layout, the platform settings editor, the activity log viewer, and the moderation queue overview. It is the "container," not a content package itself.

## 2. Objectives

- Give the Administrator one consistent entry point and navigation frame for all admin work.
- Own the two remaining tables no other package clearly owns: `platform_settings` and `activity_log`.
- Surface the moderation queue (`moderation_report`) at a glance.

## 3. Scope

**In scope:** Dashboard shell/navigation, Settings editor (`platform_settings`), Activity Log viewer (`activity_log`), Moderation queue overview (list/detail of `moderation_report`, with resolution actions).
**Out of scope:** The entity-specific CRUD forms themselves (Package 02/05 own those); AI suggestion logic (Package 06); media upload mechanics (Package 08).

## 4. Features

- Persistent navigation shell (CMS, Contacts & Organizations, Media Library, Search admin view, Settings, Activity Log, Moderation Queue).
- Settings editor: list/edit `platform_settings` key-value pairs, grouped by category (site info, SEO, social, AI configuration, email configuration, branding, feature flags, maintenance mode).
- Activity Log viewer: paginated, filterable by actor/action/date.
- Moderation Queue: list of open/in-review/escalated `moderation_report` rows, with resolve/escalate actions (Moderation Logic, Phase 6).

## 5. User Stories

- As the Administrator, I land on a dashboard home after login and can reach every admin tool from consistent navigation.
- As the Administrator, I can change the site name, contact info, or toggle maintenance mode without a code deployment.
- As the Administrator, I can see a chronological log of every login and content action.
- As the Administrator, I can see and resolve open moderation reports in one place.

## 6. Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | Every `/dashboard/*` route must require an authenticated Administrator session (Package 01). |
| FR-2 | Settings editor must read/write `platform_settings` without requiring a schema change to add a new key. |
| FR-3 | Activity Log view must be read-only — no UI path may edit or delete a row (append-only, Database Architecture §7/§10). |
| FR-4 | Moderation Queue actions must transition `moderation_report.status` following report → review → escalate → resolve, matching Moderation Logic (Phase 6). |

## 7. Non-Functional Requirements

- Navigation must clearly indicate current section (Navigation Architecture, Phase 7).
- Settings that gate visible behavior (e.g. Maintenance Mode) must take effect without a deploy — read live from `platform_settings` on each relevant request.

## 8. Pages

| Page | Path | Notes |
|---|---|---|
| Dashboard home | `/{locale}/dashboard` | Summary counts (open reports, recent activity) |
| Settings | `/{locale}/dashboard/settings` | Grouped key-value editor |
| Activity Log | `/{locale}/dashboard/activity` | Filterable, paginated, read-only |
| Moderation Queue | `/{locale}/dashboard/moderation` | List + detail/resolve view |

## 9. Components

- `DashboardShell` (navigation + layout wrapper, used by every admin package's pages)
- `SettingsGroupEditor`
- `ActivityLogTable`
- `ModerationQueueTable`, `ModerationReportDetail`

## 10. Navigation Flow

```
/login → /dashboard (home) → Settings | Activity Log | Moderation Queue
                            → CMS (Package 02) | Contacts & Organizations (Package 05)
                            → Media Library (Package 08) | Search admin view (Package 09)
```

## 11. Complete Workflow (Moderation Queue example)

```
① A moderation_report is created (via a future public "report" action, or an
   Administrator flagging something internally — the creation trigger itself
   is Package 02/03's concern, not Dashboard's)
② Report appears in the Moderation Queue as 'open'
③ Administrator opens it, moves it to 'in_review'
④ Administrator resolves it (status → 'resolved', resolution_notes recorded)
   or escalates it (status → 'escalated') — V1 has only one Administrator,
   so "escalation" in practice means flagging for later, not routing to
   a different person; the state still matters for the audit trail
```

## 12. Roles & Permissions

Administrator only (Database Architecture §7). `platform_settings` has a partial public-read exception (site info, SEO, branding, social links are publicly readable so Website, Package 03, can render them) — write is always Administrator-only, and `ai_configuration`/`email_configuration` keys are administrator-read-only too (Database Architecture §8).

## 13. Database Tables Used

`platform_settings` (read/write), `activity_log` (read-only), `moderation_report` (read/write, status transitions only — never hand-edited outside the defined workflow, per Package 02's equivalent rule for `entity_state_transition`).

## 14. APIs Required

- `getSettings(group?)` / `updateSetting(key, value)` — Server Actions.
- `listActivityLog(filters, page)` — read-only query.
- `listModerationReports(filters)` / `transitionReportStatus(id, toStatus, notes)` — Server Actions.

## 15. Validation Rules

- `platform_settings.value` must validate against an expected shape per key (e.g. `social_media_links` must be a JSON object, `maintenance_mode` must be boolean) — validated in code before writing the `jsonb` value, since the database itself only guarantees valid JSON, not valid *shape*.
- Moderation status transitions follow the fixed sequence (§11); no arbitrary status values.

## 16. Business Rules

- Activity Log is append-only — enforced at the RLS layer (Database Architecture §8), not just by omitting an edit button.
- Settings changes are themselves logged to `activity_log` (`action = 'settings_change'`), per your original requirement.

## 17. Security Considerations

- `ai_configuration`/`email_configuration` keys are never rendered to a non-administrator session, even in read-only contexts.
- Maintenance Mode, when enabled, should still allow Administrator access — it locks out Visitors, not the Administrator (otherwise there'd be no way to turn it back off).

## 18. Edge Cases

- Enabling Maintenance Mode while the Administrator is mid-edit elsewhere → should not log the Administrator out; it affects Visitor-facing rendering only.
- A moderation report referencing an entity that has since been archived → detail view should still render (using `entity_table`/`entity_id`, per Database Architecture §3), showing the entity's current state, not erroring out.

## 19. Error Handling

| Scenario | Behavior |
|---|---|
| Invalid settings value shape | Rejected with a field-level error, not silently coerced |
| Moderation status transition out of sequence | Rejected with an explanatory message |

## 20. Acceptance Criteria

- [ ] Dashboard shell + navigation works across every admin package.
- [ ] Settings can be read and updated without a schema change for new keys.
- [ ] Activity Log is visible, filterable, and provably read-only.
- [ ] Moderation Queue supports the full report → review → escalate → resolve flow.

## 21. Dependencies

- **Depends on:** Package 01 (Authentication), Database Architecture (Frozen v1) — specifically `platform_settings`, `activity_log`, `moderation_report`.
- **Depended on by:** Package 02, 05, 06, 08, 09 (all render inside this shell).

## 22. Future Improvements (Post v1)

- Role-scoped navigation once Trainer/Editor roles exist (Release 2).
- Richer dashboard-home analytics.
- Assignable moderation reports once more than one Administrator exists.

## 23. Testing Checklist

- [ ] Every admin package's pages render correctly inside the shell.
- [ ] Settings validation rejects malformed values per key.
- [ ] Activity Log cannot be edited through any UI path.
- [ ] Moderation Queue transitions follow the fixed sequence only.

## 24. UX Notes

- Open moderation report count should be visible from the dashboard home without navigating in — this is the Administrator's "what needs my attention" view.

## 25. Developer Notes

- `platform_settings` validation-by-key logic should live in one shared module, not scattered per settings-group component (Coding Standards, "one place for business rules").

---

**Status:**
🟡 Working

**Package:**
07 — Dashboard

**Reviewed By:**
Claude

**Approved By:**
Pending

**Dependencies:**
Package 01 (Authentication), Database Architecture (Frozen v1), Moderation Logic (Phase 6), Dashboard Structure (Phase 3)
