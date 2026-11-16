# AHR Platform v1 — Integrations Specification

**Status:** 🔒 Final (CTO Deliverable, v1.0)

This document catalogs every external system AHR Platform v1 depends on, the abstraction boundary around each, and the integration principles that govern all of them. It does not restate schema (`02-Database.md`), security control detail (`10-Security.md`), or AI runtime specifics (`14-AI-Integration.md`) — it cross-references them.

---

## 1. Integration Principles (Apply to Every Provider Below)

1. **Contract before implementation.** Any two components communicate through a predefined logical contract (what's sent, what's returned) — never an implicit dependency on the other side's implementation details.
2. **One abstraction module per external provider.** No package calls a third-party SDK directly from more than one place; every provider sits behind exactly one adapter/client module.
3. **Isolated failure.** A single external provider failing (e.g., the email provider) never stops an unrelated capability (e.g., content publishing) from working.
4. **External data is a signal, not a source of truth.** External references (press coverage, legacy identifiers) are integrated as documented signals, never as a substitute source of truth for AHR's own Core Data.

## 2. Provider Inventory

| Provider | Role | Abstraction module | Package |
|---|---|---|---|
| Supabase (Postgres) | Primary database | Generated types + repository functions | `@ahr/database`, `@ahr/cms-core` |
| Supabase Auth | Authentication | Supabase server/client factories | `@ahr/auth` |
| Supabase Storage | File storage (media) | `StorageAdapter` interface, `SupabaseStorageAdapter` implementation | `@ahr/media` |
| Vercel | Hosting / deployment target | N/A (infrastructure, not code-level) | `13-Deployment-and-DevOps.md` |
| GitHub | Source control, CI | N/A (infrastructure) | `13-Deployment-and-DevOps.md` |
| OpenAI | AI provider | `aiClient` abstraction (provider-agnostic interface) | Planned — see `14-AI-Integration.md` |
| HTTP email API (Resend/SendGrid/Postmark-shaped) | Notification delivery (email channel) | `NotificationProvider` interface, `HttpEmailProvider` implementation | `@ahr/notifications` |

## 3. Supabase (Postgres, Auth, Storage)

Supabase is the sole Backend-as-a-Service provider for v1 — one project provides the database, authentication, and file storage. No parallel credential store, no separate file-storage vendor. Full schema: `02-Database.md`. Full auth mechanics: `08-Authentication-and-Authorization.md`. Storage path convention and versioning intent: `02-Database.md` §11.

**Provisioning status:** as of this document, environment provisioning is an operational readiness item tracked in `13-Deployment-and-DevOps.md` — not a schema or code concern.

## 4. Email Notification Provider

`@ahr/notifications`' `email-provider.ts` calls a configurable HTTP email API through `HttpEmailProvider`. Operational, non-secret configuration (which provider, sender identity) lives in `platform_settings.email_configuration`; the actual API key lives in a server-side environment variable named by that configuration — never in the database, never client-visible.

**Wired-up events (v1):** `moderation_report_opened`, `moderation_report_escalated`, `moderation_report_resolved`, `content_published`. Only events with a real, already-built trigger point are wired — nothing speculative. One channel's failure never blocks another channel or the primary action that triggered dispatch (`06-Dashboard.md` §6).

**Templates:** bilingual (ar/en) subject + body per event type, with placeholder substitution — templates are data, not per-event bespoke code.

## 5. AI Provider (OpenAI)

OpenAI is frozen as the sole AI provider for v1, accessed exclusively through a provider-agnostic abstraction (`aiClient`) so a second provider can be added later without touching call sites. The OpenAI API key lives server-side only. Full scope, decision boundaries, and current implementation status: `14-AI-Integration.md`.

## 6. External Content References (Press, Legacy Sources)

Press coverage (`press_mention`) and any external reference tied to legacy-source migration (`13-Deployment-and-DevOps.md` §Migration) are integrated as documented, verified signals — never as an alternate source of truth competing with AHR's own Core Data. Any externally-sourced data passes through the owning content package for validation before being linked to an entity.

## 7. What Is Explicitly Not Integrated in v1

- No social sign-on provider.
- No SMS/push notification channel — email is the only wired-up notification channel.
- No CDN provider distinct from what Vercel/Supabase Storage already provide.
- No analytics/telemetry third-party product — operational monitoring principles are covered in `11-Performance.md`, without naming a specific tool (per the platform's technology-neutral observability principle, resolved technically only where explicitly frozen).
- No second AI provider — the abstraction exists precisely so this can be added later without a rewrite, but nothing beyond OpenAI is wired up now.

## Backlog

- Second AI provider behind the existing `aiClient` abstraction.
- SMS/push notification channels behind the existing `NotificationProvider` abstraction.
- A dedicated CDN/edge-cache provider, if a specific, measured performance need emerges (`11-Performance.md`).
- Social sign-on provider integration.

---

**Prepared By:** CTO Office
**Approved By:** Pending Platform Owner sign-off
**Dependencies:** Integration Architecture (Phase 8); `01-Architecture.md` §2; `02-Database.md` §11; `08-Authentication-and-Authorization.md`; `14-AI-Integration.md`; package READMEs (`@ahr/media`, `@ahr/notifications`)
