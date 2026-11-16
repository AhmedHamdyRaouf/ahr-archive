# AHR Platform — AI Features Backlog

**Purpose:** AI feature ideas selected 2026-07-21, to build on top of the existing `packages/ai` infrastructure (`suggestion-service`, `ai_recommendation_log`, prompt-builder) and its existing AI Decision Boundaries principle: AI suggests, a human reviews — never direct automatic writes.

**Status of each item below:** items 1–5 ✅ done (see notes); items 6–7 🔲 Not started.

## Group 1 — same pattern as existing suggestion-service (new prompt only, zero new infrastructure)
1. ✅ **Done (2026-07-22).** Auto-translation suggestion for missing ar/en fields.
   `@ahr/ai`: `TranslationContext`/`TranslationSuggestion` types, `buildTranslationPrompt`,
   `parseTranslationResponse`, `suggestTranslation`, dispatched via `requestSuggestion`.
   Wired end-to-end: `POST /api/ai/suggest` accepts `kind: "translation-suggestion"`;
   `AISuggestionPanel` shows the suggestion inline on `BilingualTextField` whenever
   exactly one locale is filled; accepted suggestions write directly into the empty
   locale's field; outcome recorded via `ai_recommendation_log` same as the other kinds.
2. ✅ **Done (2026-07-22).** Automatic journalism article summarization.
   `press_mention` has no article-body or summary field (only `title`/`publication_name`/
   `url`/`published_date`), so this is deliberately ephemeral: the Administrator pastes
   the article text into a one-off textarea on the Press Mention edit form (gated by
   `isArticleSummarySupported = entityType === "press-mentions"` in `edit-client.tsx`,
   same pattern as the existing Work/Project `isAiSupported` gate) — nothing is fetched
   from the `url` field, nothing new is persisted. `@ahr/ai`: `ArticleSummaryContext`
   type, `buildArticleSummaryPrompt`, `parseArticleSummaryResponse` (delegates to
   `parseSummaryResponse` — identical response shape), `suggestArticleSummary`, kind
   `"article-summary-suggestion"` added to `requestSuggestion`'s dispatch. Accept copies
   the bilingual summary to the clipboard (`navigator.clipboard.writeText`) rather than
   writing into a field, since there's nothing to write into; the outcome is still
   logged via `ai_recommendation_log` like the other three kinds. `AISuggestionPanel`
   was refactored so its internal suggestion state carries its own `kind` tag (not just
   content shape) — needed because `summary-suggestion` and `article-summary-suggestion`
   both produce a `{summaryAr, summaryEn}`-shaped result, which a structural
   `"summaryAr" in content` check alone can't tell apart.
3. ✅ **Done (2026-07-22).** Auto classification/tagging for new Works and Contributions.
   Work's category/tag suggestion (`category-tag-suggestion`) already existed and needed
   nothing new — it's already available the moment a new Work is created (creating a
   Work redirects straight to its edit page, where the panel already renders). The real
   gap was **Contribution**: that table has no category/tag concept at all in the schema
   (`chk_contribution_role` is a fixed 9-value enum, not a taxonomy) and no descriptive
   text — only foreign keys (`person_id`, `work_id`/`project_id`/`event_id`) and `role`.
   So this became "AI suggests the `role` value" instead of category/tag, confirmed with
   the data owner before building: `@ahr/ai` gets `ContributionRoleContext`
   (`personName`/`subjectLabel`/`subjectType`/`roleDetail`/`availableRoles`),
   `buildContributionRolePrompt`, `parseContributionRoleResponse` (rejects any role
   outside the caller-supplied `availableRoles` list — same domain-mismatch guard as
   `parseCategoryTagResponse`), `suggestContributionRole`, kind
   `"contribution-role-suggestion"` added to `requestSuggestion`'s dispatch.
   Since a Contribution record only holds raw ids, not names, `edit-client.tsx`'s
   `resolveContributionRoleContext` fetches the related Person and Work/Project/Event's
   display name via the existing `GET /api/cms/{entityType}/{id}` at the moment the
   Administrator requests a suggestion — nothing new persisted, nothing fetched ahead of
   time. `availableRoles` comes from `contributionDefinition`'s own `role` field options,
   never hardcoded a second time. `AISuggestionPanel`'s `resolveContext` was widened to
   allow an async resolver (`Promise<T | null> | T | null`) to support this fetch —
   existing sync resolvers (translation, article-summary) are unaffected. Accept writes
   the suggested value straight into the `role` `<select>` (same "write into the live
   DOM field" pattern as the other kinds that have somewhere to write to).
   Items 1–3 all need `packages/database/migrations/20260722100000_ai_recommendation_log_translation.sql`
   (widens `ai_recommendation_log`'s `kind`/`entity_type` check constraints to include
   `translation-suggestion`, `article-summary-suggestion`, and
   `contribution-role-suggestion` — no new table/column) applied to the real Supabase
   project before any of the three is live; not yet run there as of this writing.
   `npm run typecheck`, `npm run lint`, `npm run build` (all `apps/web`),
   `npm run typecheck`/`npm run lint --workspace=packages/ai`, and
   `npx vitest run --root packages/ai` (49/49) all pass.

## Group 2 — needs new infrastructure (embeddings/vector similarity), built once and reused
4. ✅ **Done (2026-07-22).** Similar/duplicate Work detection (admin-only, lowest risk
   first use of embeddings). This is the first schema change in the entire Phase 2/3
   backlog — explicitly flagged in `Database-Architecture-Overview.md` §14 as needing a
   "Database Architecture Review Round," approved by the data owner before anything was
   written: `packages/database/migrations/20260722120000_work_search_embedding.sql` adds
   the `pgvector` extension, one additive `work.search_embedding vector(1536)` column
   (nullable — populated only once an Administrator has requested a check for that row,
   never automatically/in the background, per 14-AI-Integration.md §7), and a
   `match_similar_works(query_embedding, exclude_work_id, match_count)` SQL function
   returning the nearest other Works by ascending cosine distance.
   Embedding model: OpenAI `text-embedding-3-small` (1536-dim), matching the existing
   "OpenAI only, frozen" provider decision. `@ahr/ai` gets a new `EmbeddingClient`
   interface (deliberately separate from `AiClient` — a different OpenAI endpoint/
   capability) implemented by `OpenAiClient.embed()`, and `similarity-service.ts`'s
   `generateEmbedding` (a thin logged wrapper, same error-handling shape as
   `suggestion-service.ts` but *not* part of it — an embedding isn't a reviewable
   suggestion with a rationale/confidence, it's an intermediate vector the caller stores
   and queries with).
   New Route Handler `POST /api/ai/similar-works` (capability `ai:suggest`): fetches the
   Work's title/description, generates its embedding, updates `search_embedding`, calls
   `match_similar_works` via `supabase.rpc(...)`, returns up to 5 matches with an
   approximate similarity percentage. **Deliberately not logged to
   `ai_recommendation_log`** — that table's shape (one suggested value, one accept/
   reject outcome) doesn't fit a "here are N candidates to look through yourself" lookup;
   every OpenAI call is still traced via `generateEmbedding`'s own interim logger
   (14-AI-Integration.md §8). New `SimilarWorksPanel` component (Work edit form only,
   `isSimilarWorksSupported = entityType === "works"`) is read-only — a "Check for
   similar Works" button and a list of linked candidate matches, no Accept/Reject
   (nothing here is a value to accept; the Administrator opens a match and decides
   manually, matching "AI never autonomously modifies governed state").
   Also updated `Database-Architecture-Overview.md` §14 and its own Backlog table to
   reflect that `work.search_embedding` is no longer deferred (items 5–6 still are).
   `npm run typecheck`, `npm run lint`, `npm run build` (all `apps/web`),
   `npm run typecheck`/`npm run lint --workspace=packages/ai`, and
   `npx vitest run --root packages/ai` (56/56) all pass. Needs
   `packages/database/migrations/20260722120000_work_search_embedding.sql` applied to
   the real Supabase project (in addition to the still-unrun
   `20260722100000_ai_recommendation_log_translation.sql` from items 1–3) before this is
   live.
5. ✅ **Done (2026-07-23).** "Similar content" generator on Work pages.
   Confirmed scope with the data owner first: the public site has no Person detail page
   at all (only works/projects/media/recognition/about/contact/search exist), and item
   4's embeddings were built for `work` only — so this is Work-only; a public Person
   version is deferred until a public Person page exists.
   Deliberately makes **zero new OpenAI calls** — the public Work page
   (`(site)/works/[slug]/page.tsx`) only reads whatever `search_embedding` an
   Administrator already generated via item 4's "Check for similar Works" button; a Work
   with no embedding yet simply shows no "Similar Works" section (never triggers
   generation itself, per 14-AI-Integration.md §7's "explicit Administrator action only"
   boundary — a public visitor is not an Administrator). Reuses `match_similar_works`
   directly via `supabase.rpc(...)` from the same request-scoped client the rest of the
   page already uses for its RLS-enforced `getWork` query — the function runs SECURITY
   INVOKER (the migration's default), so an anonymous visitor's session automatically
   restricts matches to published+public Works only, no extra filtering code needed.
   Renders with the existing `EntityCard` (same component the Works list page uses),
   under a "Similar Works"/"أعمال مشابهة" heading.
   **Found and fixed while building this:** `match_similar_works` only returned `id`
   (the Dashboard's route param), not `public_id` (the public site's route slug) —
   linking a public match with `id` would have 404'd. Widened the still-unrun
   `20260722120000_work_search_embedding.sql` to also return `public_id`; the
   Dashboard's own `SimilarWorksPanel` (item 4) is unaffected, it already used `id`
   correctly. **Also discovered while verifying this:** neither
   `work.search_embedding` nor `match_similar_works` exist on the real Supabase project
   yet — both pending migrations (this one and `20260722100000_...`) are still unrun,
   confirmed by a live read-only check, not just assumed. Item 5's code is safe to ship
   as-is regardless (degrades to "no section shown," never errors, if the column/
   function don't exist yet), but items 4 and 5 are both code-complete-not-live until
   the data owner applies both migrations.
   `npm run typecheck`, `npm run lint`, `npm run build` (all `apps/web`) all pass.
   **Unrelated bug fixed in the same session (reported live by the data owner):** editing
   a Work's `parent_work_id` (a `relation`-type field, rendered as a bare id textbox —
   `work.ts`'s own doc comment already flags "no picker UI yet") with non-uuid text
   caused a raw Postgres error ("invalid input syntax for type uuid") to leak through as
   an opaque 500, because `genericUpdate` never validated its input at all — only
   `genericCreate` did. Fixed generically in `@ahr/cms-core`, not just for Work: added a
   `relation`-type check to `validateField` (rejects non-uuid text with a friendly field
   error) and a new `validatePartialResource`/`assertValidPartialResource` pair — a
   partial-update-safe validator that only checks fields actually present in the input,
   so it doesn't wrongly reject Inline Edit's genuinely-partial single-field PATCHes for
   "missing" required fields they never touched. Wired into `genericUpdate`. Applies to
   every `relation` field on every entity, not just `work.parent_work_id`. Full monorepo
   `npm run typecheck`, `npm run lint`, `npm test` (all workspaces), and `npm run build`
   all pass.
   **Second bug found live-testing the fix above (2026-07-24, full site walkthrough with
   the data owner's own test admin account, public + dashboard, via a headless-browser
   review):** saving a Work with a populated `Year` (a `number` field) or a checked
   `Featured` toggle (a `boolean` field) now failed with "must be a number" / "must be
   true or false" — a regression from wiring validation into `genericUpdate` for the
   first time. Root cause was pre-existing, not new: a real `<form>` submission
   (`FormData`) only ever produces strings — a checked checkbox's value is the literal
   string `"on"`, never a JS `boolean`; a number input's value is a digit string, never a
   JS `number`. `validateField`'s `number`/`boolean` checks compared against
   `typeof value === "number"/"boolean"`, which no native form submission can ever
   satisfy. This same flaw already existed in `genericCreate`'s validation (unchanged
   since Milestone 4) but was apparently never exercised by an actual filled-in Create
   form before — all 94 Works were bulk-imported directly into Postgres, bypassing
   `genericCreate` entirely. Fixed by accepting the real wire representations
   (numeric strings; `"on"`/`"off"`/`"true"`/`"false"`) alongside already-typed values
   (structured callers like `@ahr/media`'s service still pass real numbers/booleans).
   Verified live after the fix: saving a Work with `Year` populated now succeeds
   ("Work saved."); the Parent Work fix above still correctly blocks invalid uuids.
   Also verified live in this same walkthrough (no other issues found): public
   works list, a Work detail page (Similar Works section correctly renders nothing,
   no error, since the embeddings migration isn't applied yet), projects, media,
   recognition, about, contact, search pages all render correctly with no console
   errors; dashboard Works list; Contribution's "Suggest role" panel end-to-end
   (OpenAI call succeeds, `ai_recommendation_log` write fails silently as designed
   since its migration is still unrun — never blocks the suggestion shown to the
   Administrator); Press Mention's "Suggest article summary" panel end-to-end
   including Accept's clipboard copy. Full monorepo `npm run typecheck`,
   `npm run lint`, `npm test`, and `npm run build` all pass after this fix too.
   **2026-07-24 — both pending migrations applied to the real Supabase project**, at the
   data owner's explicit request (direct Postgres connection via the connection pooler —
   the direct `db.<ref>.supabase.co` host is IPv6-only and didn't resolve from this
   network). `20260722100000_ai_recommendation_log_translation.sql` and
   `20260722120000_work_search_embedding.sql` both applied and verified against live
   `information_schema`/`pg_proc`/`pg_constraint`. Re-tested live afterward: "Check for
   similar Works" now succeeds end-to-end (embeds, stores, a second Work run
   immediately afterward correctly surfaced the first as a 34% match); Contribution's
   role-suggestion now logs to `ai_recommendation_log` and its Accept/Reject resolves
   successfully (`PATCH .../resolve` 200). **Items 1–5 are now fully live, not just
   code-complete.**
6. Semantic Search on the public site (same infra, but public-facing — needs wider testing before opening to visitors)

## Group 3 — separate technical track (vision model)
7. Image archiving assistant (auto alt-text for uploaded photos) — tied to the still-pending real photo upload work

---

**Decided On:** 2026-07-21
**Next step:** implement in the priority order above, one item at a time, with review after each group before continuing.
