# AHR Platform v1.0 — Administrator Handbook

**Audience:** The Administrator role (the only active role in v1.0 — `trainer`/`student`/`creative_member` are reserved for Release 2 and not yet usable).
**Status:** 🔒 Final — describes only features that actually exist in the codebase as of this document; nothing here describes a planned-but-unbuilt feature.

---

## 1. Signing In

Go to `/{locale}/login` (e.g. `/en/login` or `/ar/login`). Enter your email and password. If you've forgotten your password, use "Forgot Password" on the same screen — you'll receive a reset link by email.

## 2. The Dashboard Home

After signing in, you land on the Dashboard (`/{locale}/dashboard`). It shows:
- **Moderation Queue card** — how many reports are currently open. If there are none, it says "No open reports — all clear."
- **Recent Activity card** — the 5 most recent actions taken on the platform, with a link to the full Activity Log.
- Quick links to Media Library and Settings.

## 3. Managing Content (CMS)

Every content type — People, Works, Projects, Events, Awards, Categories, Tags — is managed the same way, at `/{locale}/dashboard/cms/{entityType}`:

- **List view:** filter by status, search, paginate.
- **Create:** a "Create" button on the list screen.
- **Edit:** click any row to open its edit screen. Fill in the bilingual fields (Arabic and English side by side) — both are expected, even if one is a placeholder until real translation is ready.
- **Status:** every record moves through Draft → Review → Verified → Published → Archived. The available "next status" buttons only show the moves that are actually allowed from the current status — you cannot skip a step.
- **Categories & Tags (Work/Project only):** on a Work or Project's edit screen, a "Categories & Tags" panel below the form lets you check which existing Categories/Tags apply. Categories are scoped — a Work can only take `work_type` categories, a Project only `project_type` categories.

### AI-Assisted Suggestions (Work/Project only)

On a Work or Project's edit screen, you'll see a small "✨ Suggest description" link under the Description field, and a "✨ Suggest categories & tags" link in the Categories & Tags panel. Clicking either asks the AI for a suggestion based on the title and existing content — it never invents facts, only suggests likely category/tag names or a draft summary. Every suggestion appears in a clearly different-looking panel (dashed border) so it's never mistaken for already-saved content. You choose **Accept** (fills the field immediately — you can still edit it before saving) or **Reject** (discards it, no trace kept).

## 4. Media Library

At `/{locale}/dashboard/media`. Shows every uploaded file with its status. Click **Upload** to add a new file:
1. Choose the owner first — search by name among People/Works/Projects/Events (you must pick one before the file field becomes usable).
2. Choose the file.
3. Optionally add a bilingual caption.
4. Click Upload.

## 5. Moderation Queue

At `/{locale}/dashboard/moderation`. Shows every moderation report, filterable by status. Click into a report to review it and change its status (e.g. resolve it).

## 6. Activity Log

At `/{locale}/dashboard/activity`. A read-only, paginated, filterable record of every action taken by every Administrator — you cannot edit or delete an entry here; it exists specifically so nothing is silently undone.

## 7. Settings

At `/{locale}/dashboard/settings`. Every platform setting (site info, SEO, AI configuration, email configuration, feature flags) is listed as a raw value you can edit directly — this is intentionally simple (a JSON value) rather than a dedicated form per setting, so a new setting can be added without a code change. Enter a string in quotes (`"like this"`), a number or boolean plainly, or an object/array in JSON syntax.

## 8. Things Not Yet Built (Do Not Expect These)

- A search box inside the CMS list screens (use the URL's `?q=` parameter directly, or the admin Search feature, for now).
- A friendlier Settings form (it's raw JSON today, by design, until each setting's shape is worth its own form).
- Bulk actions (multi-select archive/categorize).
- A general notification inbox (only the Moderation Queue count is a live indicator today).
- Contact info, notes, or media ownership for Organizations.
- Detail pages for Person/Event/Organization on the public Website (only Work and Project have one today).

See the Gap Analysis & Remaining Work Report for the complete list and why each is deferred.
