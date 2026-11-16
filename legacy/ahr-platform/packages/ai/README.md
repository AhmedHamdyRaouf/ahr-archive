# @ahr/ai

**Status:** 🟢 Built (Development Audit — Development track). Implements Packages Specification Package 06 / `14-AI-Integration.md`'s in-scope v1 capability: Archive-scoped, human-reviewed-only suggestions for Category/Tag assignment and draft bilingual summary/description text on Work/Project entities.

**Not in this package:** any UI. Wiring a suggestion panel into the CMS forms (`04-Frontend.md` §6's UX contract — a suggestion must never look like already-saved content) is Experience & Design track work, out of scope for the Development-only audit that built this package. This package exposes exactly what a future UI needs to call (`requestSuggestion`) and nothing about how it should look.

## What This Package Does

1. `prompt-builder.ts` builds a bounded prompt from only the specific entity's own fields (`EntityContext`) — never a bulk export of the database (`14-AI-Integration.md` §2 item 3).
2. `openai-client.ts` sends that prompt to OpenAI (the sole frozen provider, `01-Architecture.md` §2) via the `AiClient` interface — the one, sole implementation for v1, but not the only possible one (`14-AI-Integration.md` §6: adding a second provider means implementing this same interface, never touching a call site).
3. `validation.ts` parses and strictly validates the model's JSON response — any missing field, wrong type, or (for category suggestions) a category outside the caller-supplied available list is treated as a whole-response failure, never partially applied (`14-AI-Integration.md` §10).
4. `suggestion-service.ts` ties the above together behind two functions (`suggestCategoriesAndTags`, `suggestSummary`) plus one dispatching entry point (`requestSuggestion`), logging every call's outcome to the technical log stream (`14-AI-Integration.md` §8) since no persistence table exists yet (`docs/blocked-persistence.md`).

## What This Package Deliberately Does Not Do

- **No autonomous write.** Every function returns a suggestion; nothing in this package calls `@ahr/cms-core`, `@ahr/content`, or any Supabase client. Applying a suggestion is entirely the caller's (a CMS form's save action) responsibility, through the exact same validation path as manually-typed content (`14-AI-Integration.md` §7).
- **No persistence.** See `docs/blocked-persistence.md`.
- **No bulk/background calls.** Every exported function is request-scoped, called once per explicit Administrator action — there is no scheduler, queue, or batch entry point anywhere in this package.
- **No direct database access.** This package has zero Supabase dependency — it is pure request/response logic, which is also why its own tests need no database mock beyond a fake `AiClient`.

## Security

`OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) are read from server-side environment configuration only, via `createOpenAiClientFromEnv` — never from a `NEXT_PUBLIC_*` variable, matching `10-Security.md` §5 and the exact precedent already set by `@ahr/auth`'s `requireEnv`.

## Permissions

`GET`/`POST /api/ai/suggest` (the Route Handler consuming this package, in `apps/web`) requires the `ai:suggest` capability, added to `@ahr/auth`'s `Capability` type during this same Development Audit — the Permissions Matrix already specified "AI: Administrator (suggestion requests only)" in `08-Authentication-and-Authorization.md` §5 before this package existed; only the capability value itself and this package were missing.

## Testing

Every test mocks the `AiClient` interface (a fake `complete()` returning a fixed string) — no real OpenAI call is ever made in the test suite, and no live API key is required to run it.
