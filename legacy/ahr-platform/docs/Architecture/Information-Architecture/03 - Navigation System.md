# AHR Platform — Navigation System

## السؤال الذي تجيب عنه هذه الوثيقة
كيف يتنقل المستخدم بين الصفحات المعتمدة في Sitemap؟ ما مستويات التنقل الرسمية؟

هذه قواعد **بنيوية للتنقل**، لا تصميم فعلي للقوائم أو الأزرار (ذلك في UX/UI لاحقًا).

## مستويات التنقل

1. **تنقل أساسي (Primary Navigation)**: يضم الأقسام الرئيسية المباشرة من Home فقط (About, Works, Voice Training, Media, Recognition, Academy, Creative Network, Contact) — لا صفحات فرعية (مثل Work Detail) تظهر فيه مباشرة.
2. **تنقل سياقي (Contextual Navigation)**: داخل كل صفحة تفصيلية (Work Detail، Project Detail)، تظهر روابط للعناصر ذات الصلة (نفس الشخص، نفس المشروع، نفس الفترة الزمنية) بناءً على علاقات Contribution المعتمدة في Content Architecture.
3. **تنقل تذييلي (Footer Navigation)**: يضم روابط ثابتة لا تتغير بتغير المحتوى (سياسات، معلومات تواصل عامة، لا تكرار لعناصر Primary Navigation).

## قاعدة العمق الهرمي

لا يتجاوز عمق التنقل من Home مستويين اثنين للوصول لأي صفحة تفصيلية (Home → Works → Work Detail)، إلا في حالات استثنائية تُحسم عبر Information Governance.

## قاعدة الاتساق بين اللغتين

بنية التنقل (الترتيب، عدد المستويات، الأقسام الظاهرة) متطابقة تمامًا بين النسخة العربية والإنجليزية؛ يختلف فقط النص الظاهر، لا الهيكل.

## ما لا تتضمنه هذه الوثيقة

- لا تتضمن تصميم القوائم أو الأزرار الفعلي (UX/UI).
- لا تتضمن مسارات المستخدم الكاملة لتحقيق هدف معين (User Journeys).
- لا تتضمن الروابط التقنية (URL Structure).

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
Sitemap

---

**Amendment (2026-07-26, data owner request):** "Projects" removed from Primary Navigation, replaced by "Voice Training". The `project` entity, its Contextual Navigation (Project Detail), and its public routes are unaffected by this amendment — only its Primary Navigation link was removed. See "02 - Sitemap.md" for the corresponding sitemap update.
