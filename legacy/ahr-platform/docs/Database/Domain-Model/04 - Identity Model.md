# AHR Platform — Identity Model

## السؤال الذي تجيب عنه هذه الوثيقة
ما الفرق المفاهيمي بين Person وUser وIdentity وRole وProfile وVerification وAuthentication وAuthorization؟ (مفاهيم فقط — لا تطبيق تقني).

هذه الوثيقة تُفصّل الملاحظة التي أُضيفت سابقًا في Content Architecture (Phase 3) حول علاقة Person بـ User.

## المفاهيم

### Person
كيان محتوى يمثّل فردًا داخل منظومة المعرفة الخاصة بـ AHR (كما هو معتمد في Entity Catalog). قد يكون له حساب على المنصة أو لا.

### Identity
مجموع البيانات التي تُعرِّف Person بشكل فريد وموحّد (اسم، سيرة، مُعرِّف مركزي)، بصرف النظر عن وجود حساب مستخدم. Identity واحدة لكل Person، لا تتكرر مهما تعددت أدواره.

### User
تفعيل Person لقدرة الوصول للمنصة (تسجيل دخول). ليس كل Person له User، لكن كل User مرتبط بـ Person واحد بالضبط.

### Role
الصفة الوظيفية التي يحملها Person/User في سياق معين (فنان، طالب، مدرّب، عضو، مسؤول) — كما اعتُمد في Users (Phase 1). شخص واحد قد يحمل عدة أدوار في نفس الوقت.

### Profile
الواجهة المعلوماتية المعروضة لـ Person ضمن سياق دور معين (مثال: Profile داخل Academy يختلف عرضه عن Profile داخل Creative Network)، لكنه يستمد بياناته الأساسية من Identity نفسها لا من نسخة منفصلة.

### Verification
حالة التحقق من دقة البيانات المرتبطة بـ Person أو Contribution (موثّق، مُبلَّغ ذاتيًا، قيد المراجعة، مؤرشف) — مفهوم حالة، لا آلية تقنية.

### Authentication (مفهوم فقط)
التأكد من أن من يصل للمنصة هو فعلاً صاحب User المرتبط بـ Person معيّن. آلية التنفيذ التقنية خارج نطاق هذه الوثيقة بالكامل.

### Authorization (مفهوم فقط)
تحديد ما يُسمح لـ User فعله بناءً على أدواره (Role). آلية التنفيذ التقنية (صلاحيات، جداول أذونات) خارج نطاق هذه الوثيقة بالكامل.

## العلاقة الهرمية بين المفاهيم

```
Person (كيان محتوى، دائم الوجود)
   │
   ├── Identity (بيانات التعريف الموحّدة)
   │
   ├── User (اختياري — تفعيل الوصول)
   │      └── Authentication / Authorization (مفهوميًا فقط)
   │
   ├── Role(s) (متعددة، سياقية)
   │
   ├── Profile(s) (عرض حسب السياق/الدور)
   │
   └── Verification Status (حالة موثوقية البيانات)
```

## ما لا تتضمنه هذه الوثيقة

- لا نموذج مصادقة تقني (بروتوكولات، رموز دخول) — Technical Architecture.
- لا نموذج صلاحيات تقني (جداول أذونات) — Technical Architecture.
- لا قواعد عمل تحدد من يملك دورًا معينًا وكيف يُمنح — Business Logic.

---

**Status:**
🔒 Approved & Locked

**Phase:**
Phase 4

**Reviewed By:**
Claude

**Approved By:**
Architecture Review

**Dependencies:**
Entity Catalog, Users (Phase 1), Content Architecture (Phase 3)
