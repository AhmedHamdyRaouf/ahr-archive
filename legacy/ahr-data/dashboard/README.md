# AHR Dashboard

Private web dashboard for the AHR data record (Supabase master, CSV copy in this repo).

- Login: the owner's account only (database policies enforce it; see `supabase-policies.sql`).
- Arabic RTL / English LTR switch in the header; every table, search, add, edit, delete.
- "Gaps" screen lists blank cells per column; "Download Excel" exports all tables.
- Every save copies that table to `data/csv/<Table>.csv` in this repo (needs `GITHUB_TOKEN`).

## Run
```
cp .env.example .env.local   # fill GITHUB_TOKEN to enable the GitHub copy
npm install
npm run dev
```
Deploy: import this repo in Vercel (root directory `dashboard`), add the same variables.
Supabase Auth: set the site URL to the deployed address so the confirmation link returns there.

## Screens added 2026-11-11
- 💿 Albums: every project of "Ongoing Projects" as a group (album row first, then its songs; a song opens its work).
- ❓ Needs confirmation: records with confidence MEDIUM/PENDING, or evidence not USER-CONFIRMED.
- Record screen: a "change history of this record" panel (from `change_log`).
- Integrity check: two new sections compare a work's year with the dates of its linked events / project items (review only).
- Works table: "Links" filter (no link at all, or missing a given platform).
