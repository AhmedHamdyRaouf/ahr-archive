# AHR Platform v1 — Frontend Specification

**Status:** 🔒 Final (CTO Deliverable, v1.0)
**Runtime:** Next.js App Router, single application (`apps/web`), TypeScript strict mode, Tailwind CSS.

This document covers how the frontend is built and how it talks to the backend. It does not cover visual design tokens, brand values, or page-by-page UX flows (owned by the UI/UX Specification and Design System, outside CTO/engineering scope) — only the engineering rules that make those specifications buildable consistently.

---

## 1. Application Shape

One deployable application renders two registers from the same codebase:

```
apps/web/app/[locale]/
  (site)/          — Public Website route group
  login/           — Public authentication entry point
  dashboard/       — Authenticated Administrator route group
```

`[locale]` is `ar` or `en` — the frozen bilingual routing mechanism (path segment, not subdomain, not a query parameter). Full route tree: `13-Deployment-and-DevOps.md` §2.

## 2. Rendering Model

- **Server Components by default.** Public Website pages fetch published+public data server-side, keeping the visibility filter server-enforced rather than trusted to client code.
- **Client Components only where interactivity genuinely requires them** — forms, the AI suggestion panel, filter controls.
- Server Components call the underlying domain package function directly (in-process), not their own Route Handler over HTTP — this avoids a needless network hop for server-rendered pages without changing the documented API contract for genuinely external callers (see `07-API.md`).

## 3. Component Source of Truth

Every component built matches an entry in the UI/UX Specification's Components Library index — its name, listed variants/states, and which module(s) consume it. Status/verification badges are rendered by exactly one shared component used identically across every module — never a per-module reimplementation.

## 4. Bilingual Field Rendering

- Every component displaying a bilingual field pair (`titleAr`/`titleEn`) receives both values and the current locale.
- Public Website components render only the current locale's value.
- CMS forms always render both language fields together, editable side by side — never as two separate pages or tabs that risk silently discarding one language's content.
- No component ever drops the untranslated-locale value.

## 5. Design Tokens, Not Hardcoded Values

No component hardcodes a color, font size, or spacing value. Every value is a named Design System token reference. Actual token *values* (brand palette, typography) are an open product decision outside this document's scope — components are built against token *names* today so that decision, whenever it lands, is a token-definition change, not a component rewrite.

## 6. AI Suggestion Distinctness

Any component rendering AI-generated content uses a single, consistent visual contract (distinct background/border) that never resembles already-saved content — a hard rule, not a styling preference. See `14-AI-Integration.md` for the underlying suggestion lifecycle this renders.

## 7. Forms

- Field-level validation in every form mirrors the corresponding API endpoint's validation rules exactly (`07-API.md`) — a form must never accept something the API will reject.
- Error copy uses the same error-code vocabulary as the API (`12-Error-Codes` in `07-API.md`), never invented per-feature error text.
- Bilingual field pairs are one form's state, not two independent forms — an incomplete Arabic field and a complete English field are both part of one validation pass.

## 8. Loading / Empty / Error States

Every list/detail screen implements Loading, Empty, and Error states as specified per module in the UI/UX Specification — these are required behavior, not optional polish.

## 9. State Management

| State category | Where it lives |
|---|---|
| Server state (entities, lists, settings, moderation reports) | Owned by the server; fetched via Server Components or the shared client fetch layer (§10) — never duplicated into a global client store |
| UI state that should survive a refresh (list filters, pagination) | URL query string |
| Transient UI state (open/closed panels, unsubmitted form input) | Local component state |
| AI suggestion pending/accepted/rejected state | Local to the form it's embedded in — never persisted across navigation (suggestions are ephemeral, see `14-AI-Integration.md`) |
| Session/authentication state | Resolved server-side per request; the client never maintains an independent "am I logged in" flag that could drift — `GET /api/auth/session` is the single source of truth when a client-side check is needed |

**No global client-side state management library is used in v1.** Given the platform is primarily server-rendered and form/table-driven, React's built-in state plus the URL fully covers v1's scope. This is a scope decision proportional to what's built, not a permanent prohibition — revisited only if a genuine cross-cutting client-state need emerges that URL/local state cannot express.

## 10. API Integration Rules (Client Side)

- **One shared fetch layer per resource family** (mirroring the API's generic entity families) — never ad hoc `fetch()` calls scattered across components. It attaches the session cookie automatically, parses the `{ data, error, meta }` envelope, and surfaces typed errors matching the error-code catalog.
- **Error surfacing** maps every API error code to a specific, pre-written user-facing message — new error codes are added to the shared mapping table before they are used anywhere.
- **Pagination** state (`page`/`pageSize`) lives in the URL query string for admin list views, so a refresh or shared link preserves the view.
- **No optimistic UI** for status transitions or destructive actions (archive, resolve) — these always wait for the server response, so a rejected transition is visibly rejected rather than silently rolled back after a flash of success.
- **AI suggestion calls** are always triggered by an explicit user action, never automatic or background, and always non-blocking to the rest of the form — routed through exactly one integration point. No component calls an AI provider directly.
- **Locale-aware requests**: since the API always returns both language fields (locale-agnostic), the frontend's only locale responsibility is *selecting which field to display* — never filtering the request by locale.

## 11. Route Protection (Frontend-Visible Behavior)

Unauthenticated navigation to any `/dashboard/*` path redirects to `/{locale}/login` — enforced centrally by `apps/web/middleware.ts`, not re-checked per page at the UI layer (full mechanics: `08-Authentication-and-Authorization.md`).

## Backlog

- A global client-side state library, if a genuine cross-cutting need emerges that URL/local state cannot express.
- Optimistic UI for non-destructive, low-risk actions, if user feedback identifies a specific latency pain point.
- Final Design System token values (brand palette, typography) — outside CTO/engineering scope; blocks visual polish, not code-completeness.

---

**Prepared By:** CTO Office
**Approved By:** Pending Platform Owner sign-off
**Dependencies:** UI/UX Specification (Design System, Components Library); Development Specification 03, 07, 08, 09
