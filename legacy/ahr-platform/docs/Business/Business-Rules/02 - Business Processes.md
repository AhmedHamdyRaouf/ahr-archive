# AHR Platform — Business Processes

## السؤال الذي تجيب عنه هذه الوثيقة
ما التدفقات التجارية الأساسية التي تحدث فعليًا داخل المنصة؟ خطوات مفاهيمية فقط، لا شاشات أو أنظمة.

## العمليات الأساسية

### تسجيل شخص (Person Registration)
إدخال Person جديد → مراجعة أولية → ربطه بـ Identity (Identity Model — Phase 4) → حالة Draft حتى التحقق.

### تسجيل مساهمة (Contribution Registration)
ربط Person بـ Work/Project/Event عبر Contribution → تحديد طبيعة الدور → مراجعة → تحقق (Verification Logic).

### نشر عمل (Work Publication)
إنشاء Work → ربط Contribution واحدة على الأقل (إلزامي وفق Data Integrity Rules — Phase 4) → مراجعة واستيفاء شروط Publication Rules → نشر.

### تسجيل مؤسسة (Organization Registration)
إدخال Organization → التحقق من كونها جهة رسمية موثّقة → ربطها بما يخصها من Project/Award/Event.

### توثيق جائزة (Award Recording)
تسجيل Award مرتبطة بجهة مانحة (Organization) وPerson مستفيد → تحقق من مصدر التوثيق (Verification Logic).

### توثيق فعالية (Event Documentation)
تسجيل Event بتاريخ ومكان → ربط المشاركين عبر Contribution → ربط الوسائط الداعمة (Media).

### التسجيل في Academy (مفهوميًا)
طلب انضمام → مراجعة الأهلية → قبول → ربط الطالب بـ Person الموجود (لا إنشاء سجل مكرر، وفق Identity Model). تفاصيل تشغيل Academy الكاملة تُحدَّد في مرحلة مستقلة لاحقًا؛ هذه الوثيقة تغطي نقطة التماس التجارية مع المنصة المركزية فقط.

### طلب عضوية في Creative Network (مفهوميًا)
طلب انضمام → مراجعة سجل التوثيق الموجود لمقدّم الطلب (Archive) → قبول → تفعيل ملف تعاوني (يُفصَّل في Collaboration Logic).

## مبدأ التسلسل الموحّد

كل عملية أعلاه تمر بمرحلتين ثابتتين لا تتغيران: **إدخال** ثم **مراجعة قبل أي أثر منشور** — اتساقًا مع Data Lifecycle (Phase 4) وBusiness Rules (القاعدة الأولى).

## ما لا تتضمنه هذه الوثيقة

- لا تتضمن شروط التحقق التفصيلية (Verification Logic).
- لا تتضمن من يملك حق تنفيذ كل خطوة (Ownership Rules).

---

**Status:**
🔒 Approved & Locked

**Phase:**
Phase 6

**Reviewed By:**
Claude

**Approved By:**
Architecture Review

**Dependencies:**
Business Rules, Entity Catalog (Phase 4)
