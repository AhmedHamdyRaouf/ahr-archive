# AHR Platform — Data Architecture

## الغرض (Purpose)
تحويل بنية المعلومات المعتمدة في Phase 3 إلى نموذج بيانات مفاهيمي رسمي، مستقل تمامًا عن أي تقنية أو محرك قاعدة بيانات. هذه الوثيقة تؤسس لغة مشتركة تُبنى عليها كل الوثائق اللاحقة في Phase 4.

## النطاق (Scope)
تغطي هذه المرحلة: الكيانات المعتمدة (Entity Catalog)، علاقاتها (Relationship Model)، نموذج الهوية (Identity Model)، دورة حياة البيانات (Data Lifecycle)، قواعد التكامل (Data Integrity Rules)، نموذج الأرشفة (Archive Model)، البيانات الوصفية المشتركة (Metadata Model)، واستراتيجية المُعرِّفات (Identifier Strategy).

**لا تغطي** هذه المرحلة: قواعد العمل التشغيلية (Business Logic — Phase 6)، منطق الذكاء الاصطناعي (AI Architecture — Phase 5)، أو أي تطبيق تقني فعلي (Technical Architecture — Phase 8).

## المبادئ الحاكمة
تلتزم كل وثيقة في هذه المرحلة بمبادئ Core Principles المعتمدة في Phase 1، وتحديدًا:
- **لا حذف نهائي**: ينعكس في Data Lifecycle وArchive Model كأرشفة لا حذف.
- **الدقة قبل الاكتمال**: ينعكس في Metadata Model عبر حقل Verification Status.
- **هوية واحدة، أدوار متعددة**: ينعكس في Identity Model.
- **المحتوى يُدار مرة واحدة**: ينعكس في بنية الكيانات المركزية الواحدة (Entity Catalog).

## مجالات البيانات (Data Domains)

| المجال | الكيانات |
|---|---|
| **مجال الهوية المركزي** | Person, Contribution |
| **مجال الأعمال والأنشطة** | Work, Project, Event |
| **المجال المؤسسي** | Organization, Award |
| **مجال التوثيق والوسائط** | Media, Press |
| **مجال التصنيف** | Category, Tag |

## العلاقة بالمراحل السابقة
تبني هذه المرحلة مباشرة على أنواع المحتوى المعتمدة في Content Architecture وContent Taxonomy (Phase 3)، ولا تعيد تعريفها — بل تحوّلها من مفهوم معلوماتي إلى نموذج بيانات مفاهيمي بمسؤوليات وعلاقات محددة.

## ما لا تتضمنه هذه الوثيقة
- لا SQL ولا هجرات (Migrations).
- لا اختيار لمحرك قاعدة بيانات.
- لا حقول بيانات أو أنواعها التقنية.

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
Content Architecture, Content Taxonomy (Phase 3), Core Principles (Phase 1)
