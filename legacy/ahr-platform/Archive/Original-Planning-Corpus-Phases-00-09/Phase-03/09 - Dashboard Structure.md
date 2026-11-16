# AHR Platform — Dashboard Structure

## السؤال الذي تجيب عنه هذه الوثيقة
ما البنية المفاهيمية للوحات التحكم الداخلية (غير العامة) في AHR؟ هذه وثيقة مفاهيمية فقط — لا تصميم واجهة (UX/UI) ولا صلاحيات تقنية (Technical Architecture).

## لوحات التحكم الرسمية

| اللوحة | لمن | المحتوى المفاهيمي |
|---|---|---|
| **Administrator Dashboard** | المسؤول | إدارة كل أنواع المحتوى (نشر، أرشفة، تعديل)، مراجعة القرارات المعتمدة |
| **Trainer Dashboard** | المدرّب | إدارة تقييمات وبيانات طلابه فقط داخل Academy |
| **Student Dashboard** | الطالب | متابعة تقدّمه الشخصي وتقاريره فقط |
| **Creative Member Dashboard** | عضو Creative Network | إدارة ملفه المهني والتواصل ضمن الشبكة |

## مبدأ العزل حسب الدور

كل لوحة تعرض فقط البيانات المرتبطة بدور صاحبها (وفق Users — Phase 1)، ولا تتقاطع لوحة مع بيانات لوحة أخرى إلا عبر صلاحية Administrator الشاملة.

## علاقة اللوحات بالـ Sitemap العام

لوحات التحكم **خارج نطاق Sitemap العام** (غير مفهرسة للزوار، ولا تظهر في Navigation System العام). الوصول إليها يتم عبر مسار دخول مخصص، لا عبر التنقل العام للموقع.

## ما لا تتضمنه هذه الوثيقة

- لا تتضمن نموذج الصلاحيات التقني أو المصادقة (Technical Architecture).
- لا تتضمن تصميم شاشات اللوحة (UX/UI).

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
Users (Phase 1), Sitemap
