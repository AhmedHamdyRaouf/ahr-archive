# Database — AHR Master Archive

Supabase project `qgxagmbkgelxvzsphlrg`, schema `archive`. Apply in order on a fresh Postgres/Supabase:

1. `01_tables.sql` — tables, keys, constraints
2. `02_functions.sql` — dashboard API functions (`api_*`), helpers, triggers' functions
3. `03_security_triggers_indexes.sql` — indexes, triggers, RLS, policies, storage bucket
4. `04_reference_data.sql` — lookup values

Also needed: the `archive.staff` rows (who may log in) and the `archive_app` role (INSERT/SELECT/UPDATE on `archive`, EXECUTE on `archive.api_*`) used by `DATABASE_URL`.
Data itself: use the dashboard's "تصدير كل الأرشيف" JSON export (monthly). Old material: `../legacy/`.
