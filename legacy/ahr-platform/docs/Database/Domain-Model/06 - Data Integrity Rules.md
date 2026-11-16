# AHR Platform — Data Integrity Rules

## السؤال الذي تجيب عنه هذه الوثيقة
ما القواعد المعمارية التي تضمن سلامة العلاقات بين الكيانات؟ قواعد فقط، لا قيود SQL فعلية.

## القواعد

1. **لا يوجد Work بلا Contribution واحدة على الأقل.** عمل بلا أي شخص مرتبط به غير مكتمل معماريًا.
2. **Media تنتمي دائمًا لكيان آخر.** لا يوجد ملف وسائط مستقل بذاته دون ربط بـ Work أو Person أو Project أو Event.
3. **Contribution تُشير دائمًا لشخص واحد (Person) بالضبط.** ولواحد على الأقل من (Work / Project / Event).
4. **Award يُشير دائمًا لجهة مانحة (Organization) واحدة على الأقل.** لا توجد جائزة بلا مصدر مؤسسي موثّق.
5. **Categories are organized according to the platform taxonomy model.** The taxonomy implementation may support hierarchical or more advanced classification structures as the platform evolves.
6. **Tag لا يفرض بنية هرمية، ولا يُشترط له أب.**
7. **لا يُعاد إنشاء Person لنفس الفرد.** أي فرد موجود مسبقًا يُشار إليه عبر Identity القائمة، لا يُنشأ له سجل مكرر (اتساقًا مع مبدأ "هوية واحدة، أدوار متعددة").
8. **لا كيان بحالة Published دون مرور مسبق بحالة Verified أو Review** وفق التسلسل المعتمد في Data Lifecycle.

## معيار إضافة قاعدة جديدة

أي قاعدة تكامل جديدة تُضاف فقط إذا كانت تمنع حالة بيانات غير متسقة يمكن أن تحدث فعليًا ضمن العلاقات المعتمدة في Relationship Model، لا كقيد نظري غير مرتبط بكيان قائم.

## ما لا تتضمنه هذه الوثيقة

- لا قيود SQL (CHECK, FOREIGN KEY, UNIQUE) فعلية.
- لا تحدد من يملك صلاحية كسر أو تجاوز قاعدة معينة إداريًا (Business Logic).

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
Entity Catalog, Relationship Model, Data Lifecycle
