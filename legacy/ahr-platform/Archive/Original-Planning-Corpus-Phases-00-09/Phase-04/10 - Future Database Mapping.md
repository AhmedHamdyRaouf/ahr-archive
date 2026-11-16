# AHR Platform — Future Database Mapping

## السؤال الذي تجيب عنه هذه الوثيقة
كيف يمكن لهذا النموذج المفاهيمي أن يتحول لاحقًا إلى قاعدة بيانات فعلية (علائقية أو غير علائقية)؟ هذه وثيقة توضيحية للمسار المستقبلي فقط — **لا تنفيذ فعلي هنا**.

## مبدأ التحويل العام

كل عنصر في هذه المرحلة له مقابل مفاهيمي واضح في أي تقنية قاعدة بيانات مستقبلية، دون أن تفرض هذه الوثيقة تقنية بعينها:

| المفهوم في Phase 4 | المقابل المحتمل مستقبلاً |
|---|---|
| Entity (Person, Work...) | جدول أو مجموعة وثائق (Table / Collection) |
| Relationship | مفتاح خارجي أو جدول ربط (Foreign Key / Join Table) أو مرجع مضمّن (Embedded Reference) |
| Metadata Model | أعمدة أو حقول مشتركة تُطبَّق على كل الكيانات (Shared Columns / Mixin) |
| Internal / Permanent ID | مفتاح أساسي ثابت (Primary Key) |
| Public ID | حقل مفهرس منفصل (Indexed Slug Field) |
| Data Lifecycle Status | حقل حالة مُعرَّف بقيم محددة (Enumerated Status Field) |
| Archive Model | جدول تاريخ منفصل أو نظام إصدارات (History Table / Versioning System) |

## معيار اختيار التقنية لاحقًا

اختيار محرك قاعدة البيانات الفعلي (علائقي مثل PostgreSQL، أو غير علائقي، أو هجين) يتم لاحقًا في **Technical Architecture (Phase 8)**، ويُقاس مقابل مدى قدرته على تنفيذ:
- العلاقات المعتمدة في Relationship Model دون فقدان التكامل.
- قواعد Data Integrity Rules كقيود فعلية أو منطق تطبيقي.
- نموذج الأرشفة في Archive Model دون حذف بيانات تاريخية.

## قاعدة الحياد التقني

هذه الوثيقة لا تُفضّل تقنية على أخرى. أي قرار تقني فعلي يُتخذ في Phase 8 بناءً على معايير الأداء والتكلفة والتوافق، لا على ما ورد هنا.

## ما لا تتضمنه هذه الوثيقة

- لا SQL فعلي، ولا تعريف جداول.
- لا اختيار نهائي لمحرك قاعدة بيانات.
- لا أنواع بيانات تقنية (VARCHAR، INTEGER، JSON).

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
Entity Catalog, Relationship Model, Metadata Model, Identifier Strategy, Archive Model
