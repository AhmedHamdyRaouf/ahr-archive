# AHR Platform — Service Architecture

## السؤال الذي تجيب عنه هذه الوثيقة
ما حدود كل خدمة منطقية داخل الأنظمة المعتمدة في System Architecture، وما مسؤولية كل واحدة؟

## الخدمات المنطقية

| الخدمة | المسؤولية الوحيدة | مبنية على |
|---|---|---|
| **خدمة الهوية** | إدارة Person وIdentity وUser (بلا خلط بينها) | Identity Model (Phase 4) |
| **خدمة المحتوى** | إدارة الكيانات الأساسية (Work، Project، Organization، Award، Event) ودورة حياتها | Entity Catalog، Data Lifecycle (Phase 4) |
| **خدمة الوسائط**| تخزين وربط Media وPress بالكيانات المرتبطة | Data Integrity Rules (Phase 4) |
| **خدمة التحقق** | تنفيذ Verification Logic وتتبع حالته | Verification Logic (Phase 6) |
| **خدمة الإشراف** | تنفيذ دورة Moderation Logic (بلاغ → مراجعة → حسم) | Moderation Logic (Phase 6) |
| **خدمة البحث** | تنفيذ Search Architecture (Phase 3) كفهرسة واسترجاع | Search Architecture (Phase 3) |
| **خدمة الإشعارات** | تنفيذ Notification Experience كمنطق إرسال وتجميع | Notification Experience (Phase 7) |
| **خدمة تشغيل الذكاء الاصطناعي** | تنفيذ التوصيات والتفسير ضمن AI Decision Boundaries | AI Recommendation Model (Phase 5) |
| **خدمة التعاون** | تنفيذ Collaboration Logic (طلب، موافقة، تسجيل) | Collaboration Logic (Phase 6) |

## مبدأ المسؤولية الواحدة

كل خدمة أعلاه مسؤولة عن مجال واحد فقط. لا خدمة تُنفِّذ منطق خدمة أخرى (مثال: خدمة المحتوى لا تتخذ قرار تحقق، بل تستدعي خدمة التحقق).

## مبدأ عدم مشاركة التخزين المباشر

لا تصل خدمة لبيانات داخلية لخدمة أخرى مباشرة؛ أي تبادل بيانات يمر عبر عقد منطقي محدد (تفاصيله في Integration Architecture)، لمنع الاعتماد الخفي بين الخدمات.

## ما لا تتضمنه هذه الوثيقة

- لا تحدد بروتوكول الاتصال أو تنسيق البيانات المتبادلة فعليًا (Integration Architecture / Phase 9).
- لا تحدد كيف تُستضاف كل خدمة تقنيًا (Future Technical Evolution / Phase 9).

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
System Architecture، Business Rules (Phase 6)، Entity Catalog (Phase 4)
