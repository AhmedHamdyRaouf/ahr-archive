# AHR Platform

This repository is the **single official source of truth** for AHR Platform — architecture, business rules, experience & design specifications, source code, content, and every governing decision made about the project to date.

It replaces every previous folder, ZIP export, or duplicate copy of this project. From this point forward, all new work — code, documentation, specifications, content — is added inside this repository only.

## What AHR Is

AHR is one platform, built around a single identity (Ahmed Hamdy Raouf) and one central database, running several connected products under shared governance: a documented digital **Archive**, **AHR Academy** (education), **AHR Creative Network** (collaboration — Release 2), and **AHR AI Platform** (an internal assistive layer). See `docs/Architecture/Foundational` for the full definition.

## How This Repository Is Organized

| Folder | Contents |
|---|---|
| `apps/` | The Next.js web application — the only deployable artifact |
| `packages/` | 12 independent, tested TypeScript packages (`@ahr/*`) plus the database migrations |
| `.github/` | CI workflow |
| `docs/` | All documentation, organized by domain — see `PROJECT_STRUCTURE.md` |
| `content/` | The actual content dataset, import templates, and the import pipeline |
| `Archive/` | Superseded source material, kept for traceability only — nothing here is authoritative |
| `assets/` | Reserved for binary brand assets once Blocking Issue B10 (visual identity) is resolved |

Full explanation of every subfolder: see `PROJECT_STRUCTURE.md`. Full index of every document: see `MASTER_INDEX.md`. Full history of how this repository was assembled: see `CONSOLIDATION_REPORT.md`.

## Using This Repository

**To read about the project** (what it is, why it exists, what's been decided): start at `docs/Architecture/Foundational/What is AHR.md`, then `docs/Program-Status/Gap-Analysis-and-Remaining-Work.md` for the current honest state of things.

**To develop:**
```bash
npm install
cp .env.example apps/web/.env.local   # fill in your Supabase project values
npm run dev
```
Full setup steps: `docs/Guides/`. Coding standards: `docs/Guides/Coding-Standards.md`.

**To deploy:** `docs/Deployment/Deployment-Guide.md`, then the checklists in the same folder.

**To operate as Administrator:** `docs/Guides/Administrator-Handbook.md`.

**To populate real content:** `content/Import-Pipeline/README.md`.

## Current Status (at time of consolidation)

The codebase is production-ready as code — clean build, all automated tests passing, Row-Level Security enforced and verified. What remains before a public launch is environment provisioning (a live Supabase/Vercel project), a small number of business decisions (canonical legacy data source, final visual identity values), and standard pre-launch operational steps (monitoring, backups, on-call). None of these are code problems. Full detail: `docs/Program-Status/Gap-Analysis-and-Remaining-Work.md` and `docs/Program-Status/CTO-Reviews/`.

## Versioning

This repository does not use version numbers in file or folder names. It always represents the current, approved state of the project. History and prior states are tracked in Git commits, not in filenames — see `git log`.
