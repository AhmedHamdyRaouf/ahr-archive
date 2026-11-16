# AHR Platform — Identity & Access Architecture

## السؤال الذي تجيب عنه هذه الوثيقة
كيف تُحقَّق مفاهيم Identity Model (Phase 4) وOwnership Rules (Phase 6) تقنيًا، دون اختيار بروتوكول أو أداة مصادقة بعينها؟

## المكونات المفاهيمية

| المفهوم | التحقيق التقني المفاهيمي |
|---|---|
| **Identity** (Phase 4) | سجل هوية مركزي واحد لكل Person، تستهلكه كل الخدمات دون تكراره |
| **Authentication** (مفهوم من Phase 4) | آلية تحقق من هوية طالب الوصول قبل منح أي جلسة استخدام |
| **Authorization** (مفهوم من Phase 4) | نقطة قرار تُحدِّد ما يُسمح للجلسة الحالية فعله، بناءً على Role (Users — Phase 1) وOwnership (Phase 6) |
| **نقطة إنفاذ الصلاحية (Policy Enforcement Point)** | موضع تقني عند حدود كل خدمة يتحقق من القرار قبل تنفيذ أي فعل مؤثر |

## مبدأ أقل الصلاحيات (Least Privilege)

أي جلسة وصول تُمنح الحد الأدنى فقط من الصلاحيات اللازمة لدورها الحالي (Role)، ولا صلاحيات إضافية "احتياطية". الوصول المحدود بالسياق (AI Data Access Model — Phase 5) ينطبق تقنيًا بنفس المبدأ على كل مستخدم أو خدمة.

## مبدأ الفصل بين الهوية والصلاحية

قرار "من أنت" (Authentication/Identity) منفصل تقنيًا عن قرار "ماذا يحق لك" (Authorization) — تغيّر الأدوار (Role) لا يتطلب تغيير الهوية الأساسية للشخص.

## مبدأ عدم التفويض الضمني

لا تُورَّث صلاحية تلقائيًا بين الخدمات؛ كل خدمة تتحقق من الصلاحية بشكل مستقل عند حدودها الخاصة (اتساقًا مع مبدأ إنفاذ القواعد عند الحدود — Technical Architecture Principles).

## ما لا تتضمنه هذه الوثيقة

- لا تحدد بروتوكول مصادقة بعينه (لا OAuth ولا JWT ولا غيره بالاسم).
- لا تحدد آلية تخزين بيانات الاعتماد فعليًا (Phase 9).

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
Identity Model (Phase 4)، Users، Ownership Rules (Phase 6)، AI Data Access Model (Phase 5)
