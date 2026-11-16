# AHR Platform — Documentation Workflow

## 1. لا يوجد Version 1 أو Version 2
كل وثيقة جديدة تُنشأ من الآن هي **الوثيقة الرسمية الوحيدة** لموضوعها. لا تُسمّى "v1" أو "v2" أو "Final". أي تعديل مستقبلي يكون على نفس الملف، لا نسخة جديدة منه.

## 2. دورة اعتماد الوثيقة
```
① صاحب المشروع يكتب/يراجع ويعطي رأيه الهندسي
        ↓
② Claude يراجع، ينتقد، يقترح تحسينات
        ↓
③ صاحب المشروع يقارن ويعتمد القرار النهائي
```

## 3. القفل الرسمي 🔒
بعد الاعتماد، تُقفل الوثيقة رسميًا عبر تعليمة صريحة (Lock Prompt) تنص على:
- تم اعتماد الوثيقة رسميًا.
- تحديث كل المراجع الداخلية المرتبطة بها.
- اعتبارها المرجع الوحيد.
- عدم إنشاء نسخة جديدة — أي تعديل مستقبلي على نفس الملف فقط.

## 4. Package نهاية كل Phase
عند اكتمال Phase، تُجمَّع وثائقه المعتمدة فقط (بدون مسودات) في هيكل مثل:
```
Phase-XX/
├── [الوثائق المعتمدة النهائية].md
├── Notes.md
├── Decisions.md
├── Approved Decisions.md
└── README.md
```
ثم تُضغط باسم `Phase-XX.zip`.

## 5. الأرشيف النهائي
```
AHR Platform Documentation/
├── Phase-00.zip
├── Phase-01.zip
├── ...
└── Phase-10.zip
```

## 6. Decision Log في كل وثيقة
```
Approved By: [الاسم]
Reviewed By: Claude (و ChatGPT عند الإشراك)
Status: 🔒 Locked
Dependencies: [الوثائق التي تعتمد عليها هذه الوثيقة]
```

---

---

**Status:**
🔒 Locked

**Phase:**
Phase 0

**Reviewed By:**
Claude
ChatGPT

**Approved By:**
Ahmed Hamdy Raouf
