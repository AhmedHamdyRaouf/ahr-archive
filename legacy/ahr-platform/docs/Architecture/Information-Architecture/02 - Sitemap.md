# AHR Platform — Sitemap

## السؤال الذي تجيب عنه هذه الوثيقة
ما هي الصفحات والأقسام الفعلية للواجهة العامة (Website) وكيف تترتب هرميًا؟

هذه خريطة **مفاهيمية للصفحات**، لا تتضمن روابط تقنية (URL Structure) ولا تصميم الواجهة (UX/UI لاحقًا). تغطي هذه الوثيقة واجهة العرض العامة (Website)؛ أما واجهات Academy وCreative Network الداخلية فستُحدَّد بخرائط مستقلة عند بدء تفصيلها التنفيذي.

## الخريطة الهرمية

```
Home
│
├── About                      (Foundational Personal Brand — السيرة والمسيرة)
│
├── Works                      (قائمة الأعمال)
│     └── Work Detail          (صفحة عمل مفرد — قالب متكرر)
│
├── Voice Training              (صفحة تعريفية مؤسسية بأكاديمية التدريب الصوتي ومنهجها)
│
├── Media                      (الأرشيف البصري/السمعي)
│
├── Recognition                (الجوائز والتكريمات والعضويات الرسمية)
│
├── Academy                    (مدخل عام لـ AHR Academy، يوجّه لمنصتها التعليمية)
│
├── Creative Network           (مدخل عام لـ AHR Creative Network)
│
└── Contact
```

> **تحديث 2026-07-26 (طلب مالك المنتج):** أُزيلت "Projects" من التنقّل الأساسي (Primary Navigation) واستُبدلت بصفحة "Voice Training" الجديدة. كيان `project` نفسه، وصفحاته العامة (`/projects`، `/projects/[slug]`)، وشاشات إدارته في CMS **لم تُحذف** — تبقى موجودة وقابلة للوصول والفهرسة (sitemap.xml)، لكنها لم تعد مرتبطة من القائمة العلوية. راجع "03 - Navigation System.md" للتفاصيل.

## قاعدة القوالب المتكررة (Templates)

أي صفحة مفردة لكيان محتوى (Work Detail، Project Detail، وما شابه مستقبلاً مثل Person Detail أو Organization Detail) تُبنى كقالب واحد يُعاد استخدامه لكل عنصر من نفس النوع، لا كصفحة مستقلة لكل عنصر.

## علاقة الصفحات بأنواع المحتوى

كل صفحة في هذه الخريطة تعرض نوع محتوى واحدًا أو أكثر من الأنواع المعتمدة في Content Architecture. لا تُنشأ صفحة جديدة لعرض نوع محتوى لم يُعتمد هناك أولاً.

## ما لا تتضمنه هذه الوثيقة

- لا تتضمن الروابط الفعلية (URL Structure).
- لا تتضمن كيفية الوصول بين الصفحات (Navigation System).
- لا تتضمن تصميم تخطيط الصفحة (UX/UI لاحقًا).

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
Content Architecture, Brand Hierarchy
