# AHR Platform — Migration Strategy

## السؤال الذي تجيب عنه هذه الوثيقة
كيف تُنقَل الأصول الموجودة فعليًا (الأرشيف القديم المُراجَع في Phase 0) إلى نموذج البيانات المعتمد (Entity Catalog — Phase 4)؟

## مصادر الترحيل المعروفة

استنادًا لـ Existing Assets Inventory وAudit Report (Phase 0): وثائق AHR_Final_Stack_v2 (المعمارية والمحتوى الجاهز)، 9 نسخ CRM (تحتاج توحيد أولاً قبل الترحيل)، نسخة الموقع الحية، أرشيف الصور المصنَّف.

## مبادئ الترحيل

1. **التوحيد قبل الترحيل**: أي مصدر له نسخ متعددة متعارضة (نسخ CRM، نسخ صفحات الموقع) يُحسَم إلى نسخة واحدة معتمدة (وفق Information Governance — Phase 3) **قبل** بدء ترحيلها، لا أثناءه.
2. **لا فقدان بيانات أثناء الترحيل**: أي بيانات لا تجد مكانًا مباشرًا في Entity Catalog تُحفَظ كمرجع قديم (Legacy Reference — Identifier Strategy، Phase 4) بدل حذفها أو تجاهلها.
3. **حالة تحقق أولية حذرة**: أي كيان مُرحَّل من الأرشيف القديم يبدأ بحالة "self_reported" أو "قيد المراجعة" (Data Lifecycle — Phase 4)، لا "موثّق" تلقائيًا لمجرد وجوده في الأرشيف القديم.
4. **الترحيل المرحلي حسب طبقات Solution Decomposition**: يبدأ الترحيل بالكيانات الأساسية (Person، Work، Organization) قبل المحتوى الثانوي (Press، Media الداعمة).
5. **الحفاظ على المصدر الأصلي**: كل كيان مُرحَّل يحتفظ بإشارة لمصدره الأصلي في الأرشيف القديم (Source Preservation — Archive Model، Phase 4)، لإمكانية التتبع لاحقًا.

## مسار التعامل مع التعارضات المكتشفة أثناء الترحيل

أي تعارض يظهر أثناء الترحيل (بيانات متضاربة بين نسختين قديمتين) يُعامَل كحالة تحتاج قرار Information/Business Governance، لا يُحسم تلقائيًا باختيار عشوائي بين النسختين.

## ما لا تتضمنه هذه الوثيقة

- لا أدوات أو سكربتات ترحيل تقنية فعلية (Phase 10).
- لا جدول زمني لعملية الترحيل.

---

**Status:**
🟡 Pending Architecture Review

**Phase:**
Phase 9

**Reviewed By:**
Claude

**Approved By:**
Pending

**Dependencies:**
Existing Assets Inventory، Audit Report (Phase 0)، Identifier Strategy، Archive Model، Data Lifecycle (Phase 4)، Information Governance (Phase 3)
