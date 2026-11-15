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
