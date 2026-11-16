# AHR Platform — Entity Lifecycles & State Transitions

## السؤال الذي تجيب عنه هذه الوثيقة
من يملك حق نقل أي كيان بين حالاته (Data Lifecycle — Phase 4)، وبأي شروط تجارية؟ هذه الوثيقة تكمل Data Lifecycle: تلك عرّفت الحالات نفسها، وهذه تعرّف **من ومتى يجوز الانتقال بينها**.

## شروط الانتقال حسب الحالة

| الانتقال | الشرط التجاري المطلوب |
|---|---|
| **Draft → Review** | اكتمال الحد الأدنى من البيانات المطلوبة للكيان (Metadata Model — Phase 4) |
| **Review → Verified** | استيفاء شروط Verification Logic ومراجعة من مسؤول مخوّل |
| **Verified → Published** | استيفاء شروط Publication Rules الإضافية (لا يكفي التحقق وحده) |
| **Published → Archived** | قرار من المالك المسؤول (Ownership Rules) أو نتيجة إجراء Moderation Logic |
| **Archived → Published (استرجاع)** | مراجعة تؤكد أن سبب الأرشفة لم يعد قائمًا |

## مبدأ عدم القفز بين الحالات

لا يجوز لأي كيان الانتقال مباشرة من Draft إلى Published، ولا من Review إلى Archived، متجاوزًا الحالات الوسيطة — التسلسل ثابت وفق Data Lifecycle، وهذه الوثيقة لا تضيف تسلسلًا جديدًا، بل شروط الدخول لكل خطوة فيه.

## الفرق بين هذه الوثيقة وData Lifecycle (Phase 4)

- **Data Lifecycle**: ما هي الحالات، وما تسلسلها البنيوي.
- **هذه الوثيقة**: من له حق تنفيذ كل انتقال، وبأي شرط عمل يتحقق فعليًا.

## ما لا تتضمنه هذه الوثيقة

- لا تعيد تعريف الحالات نفسها (Data Lifecycle).
- لا تحدد آلية تقنية لتنفيذ الانتقال (Technical Architecture).

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
Business Rules, Data Lifecycle (Phase 4)
