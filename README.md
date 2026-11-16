# AHR Master Archive — لوحة التحكم

Next.js 15 + Supabase (schema `archive`). مفيش أي ربط بـ AHR Platform القديم أو بجداول `public`.

## المعمارية
- تسجيل الدخول: Supabase Auth (إيميل + كلمة سر).
- الصلاحيات: جدول `archive.staff` (owner / editor / viewer).
- الخادم يكلّم قاعدة البيانات بمستخدم محدود `archive_app`: يقرا ويكتب في `archive` فقط، ومن غير حذف.
  - `/api/sql` قراءة فقط (transaction READ ONLY).
  - `/api/fn` يستدعي دوال `archive.api_*` فقط، واسم المحرّر بيجي من حساب الموظف.
- الملفات: Supabase Storage bucket خاص `archive-files`.

## متغيرات البيئة (Vercel > Settings > Environment Variables)
انظر `.env.example`. المتغيرات التلاتة مطلوبة: `NEXT_PUBLIC_SUPABASE_URL`، `NEXT_PUBLIC_SUPABASE_ANON_KEY`، `DATABASE_URL`.

## تشغيل محلي
npm install && cp .env.example .env.local && npm run dev

## Repository map
- `app/`, `dash/`, `lib/`, `middleware.js` — the deployed dashboard
- `database/` — full schema (apply in order) — see `database/README.md`
- `content/life-story/` — life-story review package (chronology, links, conflicts, open questions, change log, restore script)
- `docs/BASELINE.md` — reference state of the whole system (read this first before any update)
- `legacy/ahr-platform/` — old platform repo (specs, docs, content dataset, migrations, old packages)
- `legacy/ahr-data/` — old AHR Data repo (xlsx v10.5, CSVs, migrations, scripts, old dashboard)
