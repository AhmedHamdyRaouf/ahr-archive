# AHR Platform v1 — Deployment Guide

**Added:** Phase 3 CTO Audit (Deployment & Production Readiness Review). No deployment guide existed in the project before this document.
**Scope:** How to actually deploy `apps/web` to Vercel with a provisioned Supabase project, matching the frozen architecture in `01-Architecture.md` §2 and `13-Deployment-and-DevOps.md`. This document does not reopen any architecture decision — it operationalizes the ones already made.

---

## 1. Prerequisites

- A Supabase project (Blocking Issue B4 must be resolved before this step — see the Final CTO Approval Report).
- A Vercel project connected to this repository's `main` branch (Production) and `staging` branch (Preview/Staging), per `13-Deployment-and-DevOps.md` §3–§4.
- Node.js version matching `.nvmrc` (currently `20`).

## 2. One-Time Supabase Project Setup

1. Create the Supabase project. Record the Project URL and both API keys (`anon` and `service_role`).
2. Apply every migration in `packages/database/migrations/`, **in filename order**, using the Supabase SQL editor, the Supabase CLI, or `psql` directly against the project's connection string:
   ```bash
   for f in packages/database/migrations/*.sql; do
     psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$f"
   done
   ```
   This includes `20260719120000_row_level_security.sql` (Phase 2 CTO Audit) — do not skip it. Supabase provisions `auth.uid()`, and the `anon`/`authenticated`/`service_role` roles itself; no shim is needed against a real project (the shim in `packages/database/docs/local-rls-verification.md` is for local testing only).
3. Create the `media` Storage bucket referenced by `02-Database.md` §11 (`packages/media`'s `MEDIA_BUCKET` constant). Set its public/private access to match the platform's own visibility model: public objects readable directly, restricted/hidden objects reachable only via signed URL (already handled in application code — this is a bucket-level access setting, not a code change).
4. Seed the first Administrator manually (per `08-Authentication-and-Authorization.md` §7 — "Administrators are seeded directly, never self-registered"):
   - Create the `auth.users` row via Supabase Auth (invite or direct creation).
   - Insert the corresponding `person` row.
   - Insert the corresponding `platform_user` row with `id` = the `auth.users.id` and `role = 'administrator'`.
5. Run both database smoke tests against the real project once, before accepting it as ready:
   ```bash
   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f packages/database/tests/smoke-test.sql
   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f packages/database/tests/rls-smoke-test.sql
   ```
   Both wrap themselves in a transaction and roll back — safe to run against the real project, including production, without leaving data behind.

## 3. Environment Variables

| Variable                                                     | Where it's used                                                                                                                                       | Required for                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                                   | `@ahr/auth`'s request-scoped client, `apps/web/middleware.ts`, `apps/web/next.config.js` (image remote pattern)                                       | Every environment                                                                                                                                                                                                                                                                                       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`                              | Same as above                                                                                                                                         | Every environment                                                                                                                                                                                                                                                                                       |
| `SUPABASE_SERVICE_ROLE_KEY`                                  | `@ahr/auth`'s service-role client (migration scripts, first-time `platform_user` provisioning only — see `08-Authentication-and-Authorization.md` §6) | Every environment, but never exposed client-side                                                                                                                                                                                                                                                        |
| `NEXT_PUBLIC_APP_ENV`                                        | Informational only                                                                                                                                    | Every environment                                                                                                                                                                                                                                                                                       |
| _(email provider API key, name chosen by the Administrator)_ | `@ahr/notifications`'s `EmailConfiguration.apiKeyEnvVar`                                                                                              | Only once an Administrator has configured `platform_settings.email_configuration` via the Dashboard — **the env var name is not fixed** by design (`09-Integrations.md` §4); whatever name the Administrator enters in Settings must exist as an actual environment variable in the deployment platform |

There is currently no OpenAI API key variable, because `14-AI-Integration.md` correctly documents AI Integration as not yet built (§4 of that document) — nothing to configure yet.

Set all of the above as Vercel Project Environment Variables, scoped per environment (Development/Preview/Production), never committed to the repository (`.env.example` documents the shape only, with no real values, matching `10-Security.md` §5).

## 4. Vercel Project Configuration

No `vercel.json` exists or is needed — this is a standard, zero-config Next.js App Router project. Vercel auto-detects the build command (`npm run build` inside `apps/web`, resolved automatically via the monorepo's workspace structure) and the output. Confirm in the Vercel dashboard:

- **Root Directory**: repository root (Vercel's monorepo support handles resolving into `apps/web` automatically once the framework preset detects it; if it does not, set Root Directory to `apps/web` explicitly and Install Command to `npm install` run from the repository root).
- **Build Command**: `npm run build` (already correctly resolves to `apps/web`'s build via the root `package.json` script, per `13-Deployment-and-DevOps.md` §1).
- **Node.js Version**: matches `.nvmrc` (`20.x`).
- **Production Branch**: `main`. **Preview/Staging**: `staging`, per `13-Deployment-and-DevOps.md` §3–§4's fixed promotion order.

## 5. First Deployment Checklist

1. Confirm CI (`.github/workflows/ci.yml`) is green on the branch being deployed — both the `verify` job and the `database-verify` job.
2. Confirm all Environment Variables (§3) are set in Vercel for the target environment.
3. Confirm the Supabase project (§2) has every migration applied, RLS verified, the `media` bucket created, and the first Administrator seeded.
4. Deploy. Immediately after the first successful deploy, sign in as the seeded Administrator and confirm: the Dashboard loads, the Settings page reads `platform_settings` correctly, and a test CMS entity can be created and transitioned through its lifecycle.
5. Confirm the security headers are present on the live deployment: `curl -sI https://<your-domain>/` should show `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security` (added Phase 3 CTO Audit — see the Security & Performance Final Review Report).

## 6. Subsequent Deployments

Every subsequent deployment follows the same branch-based promotion already documented in `13-Deployment-and-DevOps.md` §3–§4: `feature/* → staging → main`, no direct commits to `staging` or `main`, every merge to `main` already passed staging. No new migration is ever skipped or applied out of order — apply new migrations to staging's Supabase project first, verify, then apply the same migration to production's Supabase project before or immediately after the corresponding code deploys to `main` (never after a code deploy that already depends on the new column/table, and never leaving a migration applied to production without its corresponding code, or vice versa, for longer than necessary).

See `Release-Checklist.md` and `Rollback-Plan.md` (this same `docs/` folder) for the step-by-step procedure for each release.
