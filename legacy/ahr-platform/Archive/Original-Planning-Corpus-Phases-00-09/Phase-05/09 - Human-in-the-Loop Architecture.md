# AHR Platform — Human-in-the-Loop Architecture

## السؤال الذي تجيب عنه هذه الوثيقة
كيف تُدمَج المراجعة البشرية بنيويًا في كل تدفق يُشارك فيه الذكاء الاصطناعي؟ هذه وثيقة تُجمّع مبادئ الوثائق السابقة في Phase 5 ضمن تدفق عمل واحد متسق.

## نقاط المراجعة البشرية الإلزامية

بناءً على AI Decision Boundaries، توجد نقطة مراجعة بشرية إلزامية عند:
- أي تغيير في Verification Status.
- أي نشر أو أرشفة أو حذف نهائي لكيان.
- أي تحديد أو تعديل لدور (Role).
- أي تمثيل علني باسم براند.

## تدفق المراجعة الموحّد

```
① الذكاء الاصطناعي يولّد توصية (AI Recommendation Model)
        ↓
② تُرفَق بالأساس المنطقي ومستوى الثقة (AI Explainability, AI Confidence Model)
        ↓
③ تُعرَض على المستخدم/المراجع البشري المخوّل (Users — Phase 1)
        ↓
④ قرار بشري: قبول / تعديل / رفض
        ↓
⑤ عند القبول فقط: يُطبَّق الأثر على الكيان المستهدف (Data Lifecycle — Phase 4)
```

## قاعدة عدم التجاوز

لا يجوز لأي مكوّن تقني مستقبلي (Technical Architecture) تنفيذ اختصار لهذا التدفق دون المرور بخطوة ④ إلزاميًا، إلا ضمن استثناء الأثر المنخفض المحدد صراحة في AI Decision Boundaries.

## من يملك سلطة المراجعة

سلطة المراجعة البشرية تُمنح وفق الدور (Role) المخوّل في سياق الكيان المعني (مدرّب لبيانات طلابه، مسؤول لكل البيانات) — التفاصيل الدقيقة لهذه الصلاحيات تُحسم في Business Logic (Phase 6)، لا هنا.

## ما لا تتضمنه هذه الوثيقة

- لا تحدد من يملك كل صلاحية بالتفصيل (Business Logic — Phase 6).
- لا تتضمن تصميم واجهة المراجعة (UX/UI لاحقًا).

---

**Status:**
🟡 Pending Architecture Review

**Phase:**
Phase 5

**Reviewed By:**
Claude

**Approved By:**
Pending

**Dependencies:**
AI Decision Boundaries, AI Recommendation Model, AI Confidence Model, AI Explainability
