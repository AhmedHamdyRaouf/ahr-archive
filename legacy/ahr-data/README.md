# AHR Data — Ahmed Hamdy Raouf

> مستودع **خاص (Private)** — لا يُنشر ولا يُشارك. فيه بيانات داخلية وصور أشخاص وأطفال.

المرجع الواحد لبيانات أحمد حمدي رؤوف: أعماله، الأشخاص، الأحداث، الصحافة، قصص الحياة، وصوره. منفصل تماماً عن مستودع AHR Platform.

## الهيكل

| المسار | المحتوى |
|---|---|
| `data/` | ملف الإكسل النهائي v10.5 (22 ورقة، مطابق لسوبا بيز؛ Value_Lists مرجع داخل المستودع فقط؛ بدون الكلمات الخاصة وبدون صور) + نسخ الرجوع في `data/snapshots/` |
| `data/csv/` | كل ورقة كملف CSV بترميز UTF-8 (نسخة احتياطية قابلة للقراءة آلياً) |
| `migrations/phase1/` | مرحلة 1 (بنية العلاقات بين الأعمال): النسخة الاحتياطية 000 وmigrations 001–009 (UP/DOWN) والاختبارات وسجل التصحيحات `CORRECTIONS.md` — منفّذة على Supabase |
| `docs/` | القواعد والقرارات الحاكمة |
| `photos/works/` | صور الأعمال والأفيشات |
| `photos/people/` | صور الأشخاص |
| `photos/events/` | الحفلات والعروض والفعاليات |
| `photos/ahmed/` | صور أحمد الشخصية والمهنية |
| `photos/press/` | قصاصات وصور صحفية |
| `photos/misc/` | أي صور أخرى |

## المصدر الأصلي
قاعدة البيانات الحية في Supabase (مشروع «AHR Data - Ahmed Hamdy Raouf»). الملفات هنا نسخة محفوظة منها؛ عند أي اختلاف تُعتمد Supabase ثم تُحدَّث الملفات.

## ما لا يدخل هذا المستودع
- كلمات الأغاني الخاصة (ورقة Lyrics_Private) — أقصى خصوصية.
- صور الكارنيهات والبطاقات الشخصية ووثائق الهوية.
- أي بيانات بنكية أو أرقام حسابات.

راجع `docs/RULES.md` و`photos/README.md`.

## Keeping Supabase, CSV and Excel identical
`node scripts/sync-check.mjs` compares Supabase (master) with `data/csv/*.csv` and `data/AHR_Data_v10.5.xlsx` for the 20 synced tables; `--fix` rewrites CSV and Excel from Supabase. Run it after every migration. Needs `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in the environment and `pip install openpyxl` (details in the script header).
