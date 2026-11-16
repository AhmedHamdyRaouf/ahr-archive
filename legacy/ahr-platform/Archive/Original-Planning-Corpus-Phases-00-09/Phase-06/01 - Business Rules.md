# AHR Platform — Business Rules

## السؤال الذي تجيب عنه هذه الوثيقة
ما القواعد التجارية الحاكمة العليا التي تحكم تشغيل المنصة؟ وكيف ترتبط وثائق Phase 6 ببعضها؟

هذه الوثيقة تجمع القواعد الأعلى مستوى (كما فعلت Data Integrity Rules للبيانات في Phase 4)، وتضع باقي وثائق Phase 6 في سياقها — دون تكرار تفاصيلها.

## خريطة وثائق Phase 6

| # | الوثيقة | تجيب عن |
|---|---|---|
| 02 | Business Processes | ما التدفقات التجارية الأساسية للمنصة؟ |
| 03 | Entity Lifecycles & State Transitions | من يملك حق نقل أي كيان بين حالاته، وبأي شروط؟ |
| 04 | Publication Rules | ما الشروط التجارية لنشر أي كيان؟ |
| 05 | Verification Logic | من يملك سلطة التحقق، وبأي دليل؟ |
| 06 | Moderation Logic | كيف تُدار البلاغات والتعارضات؟ |
| 07 | Ownership Rules | من المسؤول عن كل كيان، وكيف تنتقل المسؤولية؟ |
| 08 | Collaboration Logic | ما القواعد التجارية للتعاون داخل Creative Network؟ |
| 09 | Platform Policies & Exception Handling | ما السياسات العامة، وكيف تُدار الاستثناءات؟ |
| 10 | Future Business Services Mapping | كيف تتحول هذه القواعد لخدمات تجارية فعلية لاحقًا؟ |

## القواعد التجارية العليا

1. **لا نشر بلا مساءلة**: كل كيان منشور له مالك مسؤول محدد (Ownership Rules)، لا يوجد محتوى "بلا صاحب".
2. **لا تحقق بلا مراجعة بشرية**: أي قرار تحقق (Verification) يصدر عن إنسان مخوّل، لا عن الذكاء الاصطناعي وحده — اتساقًا مع AI Decision Boundaries (Phase 5).
3. **لا نقل حالة بلا شرط محقَّق**: أي انتقال بين حالات الكيان (Data Lifecycle — Phase 4) يشترط تحقق الشروط التجارية المحددة في Entity Lifecycles & State Transitions.
4. **لا تعاون بلا موافقة الطرفين**: أي تفاعل ضمن Creative Network يتطلب موافقة صريحة من كل الأطراف المعنية.
5. **الاستثناء إجراء موثّق، لا قاعدة بديلة**: أي خروج عن قاعدة معتمدة يمر عبر مسار استثناء موثّق (Platform Policies & Exception Handling)، ولا يصبح سابقة تلقائية لحالات مشابهة.
6. **قواعد الأعمال لا تتعارض مع ما سبق اعتماده**: أي قاعدة هنا تلتزم بـ Core Principles (Phase 1)، Data Integrity Rules (Phase 4)، وAI Decision Boundaries (Phase 5)، ولا تناقضها.

## ما لا تتضمنه هذه الوثيقة

- لا تتضمن تفاصيل كل قاعدة على حدة (موزّعة على باقي وثائق Phase 6).
- لا تتضمن أي تفاصيل تقنية أو واجهة (خارج نطاق المرحلة بأكملها).

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
Core Principles, Users (Phase 1), Data Integrity Rules, Data Lifecycle (Phase 4), AI Decision Boundaries (Phase 5)
