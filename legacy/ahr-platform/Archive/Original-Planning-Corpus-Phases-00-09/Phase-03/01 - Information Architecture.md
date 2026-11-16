# AHR Platform — Information Architecture

## السؤال الذي تجيب عنه هذه الوثيقة
ما الذي تحكمه "معمارية المعلومات" في AHR، وكيف ترتبط وثائق Phase 3 ببعضها؟

هذه وثيقة إطارية (Framing Document)، لا تكرر محتوى أي وثيقة أخرى في Phase 3.

## ما تحكمه معمارية المعلومات

معمارية المعلومات تحدد **كيف يُنظَّم المحتوى ويُكتشَف ويُتنقَّل بينه** عبر المنصة — الصفحات، التصنيف، الروابط، البحث، ومسارات المستخدم — بمعزل عن التخزين التقني (Database Architecture) والتصميم البصري (UX/UI لاحقًا).

معمارية المعلومات **لا تحكم**:
- بنية قاعدة البيانات أو الجداول (Database Architecture — Phase 4).
- الشكل البصري أو مكونات الواجهة (UX/UI System — Phase 7).
- منطق العمل والقواعد التشغيلية (Business Logic — Phase 6).

## خريطة وثائق Phase 3

| # | الوثيقة | تجيب عن |
|---|---|---|
| 02 | Sitemap | ما هي صفحات/أقسام المنصة وكيف تترتب هرميًا؟ |
| 03 | Navigation System | كيف يتنقل المستخدم بين الأقسام؟ |
| 04 | User Journeys | ما المسارات الأساسية التي يسلكها كل نوع مستخدم لتحقيق هدفه؟ |
| 05 | Content Architecture | ما أنواع المحتوى الأساسية وعلاقتها ببعضها؟ |
| 06 | Content Taxonomy | ما تصنيفات ووسوم كل نوع محتوى؟ |
| 07 | URL Structure | ما القواعد البنيوية لتشكيل الروابط؟ |
| 08 | Search Architecture | ما الذي يجب أن يحققه البحث، وماذا يغطي؟ |
| 09 | Dashboard Structure | ما البنية المفاهيمية للوحات التحكم الداخلية؟ |
| 10 | Information Governance | من يملك صلاحية تعديل بنية المعلومات؟ |

## علاقتها بالمراحل السابقة

تبني هذه المرحلة مباشرة على Ecosystem وUsers (Phase 1) وBrand Hierarchy/Naming System (Phase 2) — كل تسمية أو تصنيف هنا يلتزم بما اعتُمد هناك، ولا يُعيد تعريفه.

---

**Status:**
🔒 Approved & Locked

**Phase:**
Phase 3

**Reviewed By:**
Claude

**Approved By:**
Architecture Review

**Dependencies:**
Ecosystem, Users (Phase 1), Brand Hierarchy, Naming System (Phase 2)
