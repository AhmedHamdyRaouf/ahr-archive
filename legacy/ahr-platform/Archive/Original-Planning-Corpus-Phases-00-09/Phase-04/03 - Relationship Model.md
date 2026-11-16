# AHR Platform — Relationship Model

## السؤال الذي تجيب عنه هذه الوثيقة
كيف ترتبط الكيانات المعتمدة في Entity Catalog ببعضها مفاهيميًا؟

## العلاقات الأساسية

```
Person ──────┐
             │
             ▼
        Contribution ──────┬──── Work
             │              ├──── Project
             │              └──── Event
             │
             ▼
       (يحدد طبيعة المساهمة: ملحّن، مؤدٍّ، مخرج، مدرّب...)
```

```
Work ─────── Media          (عمل له وسائط داعمة)
Work ─────── Press          (عمل له تغطية إعلامية)
Work ─────── Category/Tag   (عمل مصنّف)

Project ─────── Organization   (نشاط ترعاه جهة)
Project ─────── Media
Project ─────── Category/Tag

Event ─────── Organization      (فعالية تنظّمها جهة)
Event ─────── Media
Event ─────── Contribution      (من شارك في الفعالية)

Organization ─────── Award       (الجهة المانحة للجائزة)
Award ─────── Person             (عبر Contribution أو ارتباط مباشر)

Media ─────── Person / Work / Project / Event   (لا يوجد Media معزول)
Press ─────── Person / Work / Event / Organization
```

## نوع العلاقات

| النوع | الوصف | مثال |
|---|---|---|
| **علاقة إلزامية (Mandatory)** | لا يوجد الكيان التابع بدونها | Contribution لا توجد بلا Person |
| **علاقة اختيارية (Optional)** | قد توجد أو لا توجد | Project قد يرتبط بـ Organization أو لا |
| **علاقة متعددة (Many-to-Many)** | كيان واحد يرتبط بأكثر من كيان من نفس النوع | Work واحد قد يرتبط بعدة Contributions من أشخاص مختلفين |

## مبدأ الاتجاه

كل علاقة موصوفة هنا لها اتجاه مفاهيمي واضح (من يملك الإشارة إلى من)، لكن هذا لا يعني اتجاه مفتاح تقني (Foreign Key) — ذلك يُحسم لاحقًا في Future Database Mapping.

## ما لا تتضمنه هذه الوثيقة

- لا تتضمن نوع العلاقة التقني (One-to-Many فعليًا في جداول، Foreign Keys).
- لا تتضمن قواعد التكامل التفصيلية (Data Integrity Rules).

---

**Status:**
🟡 Pending Architecture Review

**Phase:**
Phase 4

**Reviewed By:**
Claude

**Approved By:**
Pending

**Dependencies:**
Entity Catalog
