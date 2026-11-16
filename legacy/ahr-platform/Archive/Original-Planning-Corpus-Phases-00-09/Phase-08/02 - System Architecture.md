# AHR Platform — System Architecture

## السؤال الذي تجيب عنه هذه الوثيقة
ما الأنظمة المنطقية الكبرى التي تتكون منها المنصة، وكيف تترابط؟ هذا تحويل تقني لطبقات High-Level Architecture (Phase 1) إلى أنظمة منطقية، لا اختيار بنية تحتية فعلية.

## الأنظمة المنطقية

| النظام | يقابل طبقة (Phase 1) | المسؤولية |
|---|---|---|
| **نظام البيانات المركزي** | Core Data Layer | تخزين وإدارة الكيانات المعتمدة (Entity Catalog — Phase 4) كمصدر حقيقة وحيد |
| **نظام الهوية والحوكمة** | Identity & Governance | تطبيق Identity Model وOwnership Rules وBusiness Rules عند أي وصول أو تعديل |
| **أنظمة المنتجات** | Product Layer | Archive، Academy، Creative Network — كل منها يستهلك نظام البيانات المركزي دون تكراره |
| **نظام تشغيل الذكاء الاصطناعي** | Intelligence Layer | تنفيذ AI Interaction Architecture وAI Decision Boundaries ضمن حدود معزولة |
| **نظام التجربة** | Experience Layer | تقديم UX/UI System (Phase 7) عبر أي واجهة عرض (ويب، تطبيق مستقبلي) |

## مبدأ الاتجاه الواحد بين الأنظمة

التبعية التقنية تسير من نظام التجربة نزولًا حتى نظام البيانات المركزي، بنفس مبدأ الاتجاه الواحد المعتمد في High-Level Architecture (Phase 1) — لا يعتمد نظام البيانات المركزي على تفاصيل أي نظام أعلى منه.

## حدود الاتصال بين الأنظمة

كل نظام يتواصل مع غيره عبر عقد منطقي محدد (Logical Contract) لا عبر وصول مباشر لبيانات نظام آخر الداخلية. يُفصَّل شكل هذا العقد أكثر في Service Architecture وIntegration Architecture.

## ما لا تتضمنه هذه الوثيقة

- لا تحدد حدود كل خدمة داخل كل نظام (Service Architecture).
- لا تحدد بروتوكول الاتصال الفعلي (Integration Architecture / تنفيذ لاحق).

---

**Status:**
🟡 Pending Architecture Review

**Phase:**
Phase 8

**Reviewed By:**
Claude

**Approved By:**
Pending

**Dependencies:**
Technical Architecture Principles، High-Level Architecture (Phase 1)، Entity Catalog (Phase 4)
