/**
 * Implements: Sitemap (Phase 3) — Voice Training. Fixed editorial/
 * institutional copy for the Voice Training page (data owner spec,
 * 2026-07-26), replacing "Projects" in the primary nav. Every section's
 * content is scripted copy, centralized here so the section components
 * stay presentational only — mirrors the convention already established
 * by components/about/about-content.ts.
 *
 * Voice throughout is deliberately institutional ("Our Programs", "Our
 * Method", "under the supervision of Ahmed Hamdy Raouf") rather than
 * first-person ("I train...") — the academy trains through a
 * methodology, not through one person doing everything personally. The
 * Hero/Philosophy/"Why Your Voice Matters"/"Who We Train"/AI Voice Test
 * copy is adapted from the real, currently-live legacy page (content/
 * Master-Content-Dataset/12-Source-Files/Website-Archive/
 * Legacy-Website-Build/{en,ar}/training.html) rather than invented;
 * Vision, Mission, Training Programs, and Voice Assessment are new
 * sections per the redesign spec.
 */

export interface Bilingual {
  ar: string;
  en: string;
}

export interface PlaceholderContent {
  label: Bilingual;
  sublabel: Bilingual;
}

export const HERO_CONTENT = {
  badge: { ar: "التدريب الصوتي الاحترافي", en: "Professional Vocal Training" } satisfies Bilingual,
  headlineLine1: { ar: "نحن لا ندرّبك على الغناء.", en: "We Don't Train You to Sing." } satisfies Bilingual,
  headlineLine2: { ar: "نحن ندرّب صوتك.", en: "We Train Your Voice." } satisfies Bilingual,
  subheadline: {
    ar: "قبل أن يرى أحد وجهك، قبل أن يقرأ اسمك — يسمع صوتك. الصوت المدرَّب ليس رفاهية للفنانين فقط، بل أداة أساسية لكل إنسان يريد أن يُسمَع ويُحترَم.",
    en: "Before anyone sees your face, before they read your name — they hear your voice. A trained voice is not a luxury reserved for artists. It is an essential tool for every person who wants to be heard and respected.",
  } satisfies Bilingual,
  primaryCta: { ar: "ابدأ اختبارك الصوتي المجاني بالذكاء الاصطناعي", en: "Start Your Free AI Voice Test" } satisfies Bilingual,
  secondaryCta: { ar: "احجز تقييمك الصوتي", en: "Book a Voice Assessment" } satisfies Bilingual,
  stats: [
    { num: "25+", label: { ar: "سنة خبرة", en: "Years of Experience" } },
    { num: "500+", label: { ar: "متدرب حول العالم", en: "Trainees Worldwide" } },
    { num: "1000+", label: { ar: "صوت تم تطويره", en: "Voices Transformed" } },
  ] as Array<{ num: string; label: Bilingual }>,
  media: {
    label: { ar: "جلسة تدريب صوتي", en: "Voice Training Session" },
    sublabel: { ar: "(صورة استوديو)", en: "(Studio Image)" },
  } satisfies PlaceholderContent,
  signatureName: { ar: "أحمد حمدي رؤوف", en: "Ahmed Hamdy Raouf" } satisfies Bilingual,
  signatureRole: { ar: "مدرب أصوات · فنان · معلّم", en: "Vocal Coach · Artist · Educator" } satisfies Bilingual,
};

export const VISION_CONTENT = {
  icon: "👁️",
  heading: { ar: "رؤيتنا", en: "Our Vision" } satisfies Bilingual,
  tagline: { ar: "كل صوت يستحق أن يُسمَع.", en: "Every Voice Deserves to Be Heard." } satisfies Bilingual,
  summary: {
    ar: "نؤمن بأن كل صوت يستحق أن يُكتشف ويُصقل ويُسمع — الصوت المدرَّب ليس امتيازاً للمطربين وحدهم، بل أداة إنسانية أساسية للتواصل والثقة والأثر الذي يدوم.",
    en: "We believe every voice deserves to be discovered, developed, and heard — a trained voice is not a privilege for singers, but an essential human tool for communication, confidence, and lasting impact.",
  } satisfies Bilingual,
};

export const MISSION_CONTENT = {
  icon: "🎯",
  heading: { ar: "رسالتنا", en: "Our Mission" } satisfies Bilingual,
  tagline: { ar: "نبني أصواتاً. نصنع مستقبلاً.", en: "Building Voices. Creating Futures." } satisfies Bilingual,
  summary: {
    ar: "أن نبني أصواتاً واثقة وصحية ومعبِّرة، عبر منهجية مُحكَمة تُبنى حول المتدرب نفسه لا حول منهج ثابت — ليتواصل كل صوت بوضوح، ويؤدي بثقة، وينمو بهدف.",
    en: "To develop confident, healthy, and expressive voices through a structured methodology built around the individual, not a fixed curriculum — so every voice communicates with clarity, performs with confidence, and grows with purpose.",
  } satisfies Bilingual,
};

export const PHILOSOPHY_CONTENT = {
  icon: "🎙️",
  badge: { ar: "فلسفتنا في التدريب", en: "Our Training Philosophy" } satisfies Bilingual,
  tagline: { ar: "ندرّب صوتك، لا أغنيتك.", en: "We Train Your Voice, Not Your Song." } satisfies Bilingual,
  summary: {
    ar: "لا نعلّمك ماذا تغني. نحن ندرّب صوتك — تقنيته، وقوته، ومداه، وتعبيره — لتستخدمه في أي طريق، ولأي هدف، وفي أي مستقبل.",
    en: "We don't teach you what to sing. We train your voice — its technique, strength, range, and expression — so you can use it for any path, any purpose, any future.",
  } satisfies Bilingual,
  quote: {
    ar: "نحن لا نعلّمك ماذا تغني، ولا نُحدّد لك طريقك الفني، نحن ببساطة نمنحك صوتاً مدرَّباً جاهزاً لأي طريق تختاره.",
    en: "We don't teach you what to sing, we don't define your artistic path, we simply train your voice to be ready for whatever path you choose.",
  } satisfies Bilingual,
  subtext: {
    ar: "سواء كنت تريد الغناء الشرقي أو الغربي أو البوب أو الجاز أو لا تريد الغناء أصلاً — نحن لا نسألك. نحن فقط نصقل الأداة، وأنت تقرر كيف تستخدمها.",
    en: "Whether you want Arabic music, Western classical, Pop, Jazz, Voice Over, or no singing at all — we don't ask. We sharpen the tool. You decide how to use it.",
  } satisfies Bilingual,
};

export const WHY_VOICE_MATTERS_CONTENT = {
  heading: { ar: "لماذا يهمّ صوتك", en: "Why Your Voice Matters" } satisfies Bilingual,
  lead: {
    ar: "قبل أن يرى أحد وجهك، قبل أن يقرأ اسمك — يسمع صوتك. الصوت المدرَّب ليس رفاهية للفنانين فقط، بل أداة أساسية لكل إنسان يريد أن يُسمَع ويُحترَم.",
    en: "Before anyone sees your face, before they read your name, they hear your voice. A trained voice is not a privilege for singers — it is a tool every human being needs.",
  } satisfies Bilingual,
  items: [
    {
      icon: "🎙️",
      title: { ar: "الثقة والحضور", en: "Confidence" },
      body: {
        ar: "الصوت المدرَّب يمنحك حضوراً لا تستطيع إخفاءه — في الاجتماعات، على المسرح، وأمام الكاميرا.",
        en: "A trained voice gives you a presence that cannot be hidden — in meetings, on stage, and in front of any camera.",
      },
    },
    {
      icon: "🧠",
      title: { ar: "التواصل والإقناع", en: "Communication" },
      body: {
        ar: "طريقة الكلام غالباً أكثر تأثيراً من محتواه. صوت واثق ومدرَّب يُقنع قبل أن تنتهي الجملة.",
        en: "How you speak often carries more weight than what you say. A confident, trained voice communicates before the sentence ends.",
      },
    },
    {
      icon: "🎭",
      title: { ar: "التعبير", en: "Expression" },
      body: {
        ar: "الصوت هو الجسر بين مشاعرك والعالم. التدريب يُعلّمك كيف توصل ما تشعر به بدقة واحترافية.",
        en: "The voice is the bridge between feeling and the world. Training teaches precise, professional emotional delivery.",
      },
    },
    {
      icon: "💼",
      title: { ar: "المهنة", en: "Career" },
      body: {
        ar: "معلم، محامٍ، طبيب، مدير، خطيب — أي مهنة تتطلب التواصل البشري تتطلب صوتاً مدرَّباً.",
        en: "Teacher, lawyer, doctor, manager, speaker — any profession built on human communication depends on a trained voice.",
      },
    },
    {
      icon: "🎤",
      title: { ar: "الفن", en: "Art" },
      body: {
        ar: "الغناء، التمثيل، الإلقاء، البودكاست — كل هذه الفنون تبدأ من صوت واحد مُحكم ومدرَّب.",
        en: "Singing, acting, presenting, podcasting — every performing art begins with one precise, trained voice.",
      },
    },
    {
      icon: "🌱",
      title: { ar: "الصحة الصوتية", en: "Vocal Health" },
      body: {
        ar: "التدريب الصحيح يحمي صوتك من الإجهاد ويطيل عمره — لأن الصوت عضلة تحتاج إلى رعاية.",
        en: "Proper training protects the voice from strain and extends its working life — the voice is a muscle that needs care.",
      },
    },
  ] as Array<{ icon: string; title: Bilingual; body: Bilingual }>,
};

export const WHO_WE_TRAIN_CONTENT = {
  heading: { ar: "من ندرّب", en: "Who We Train" } satisfies Bilingual,
  lead: {
    ar: "برامجنا مصممة لكل صوت ولكل هدف.",
    en: "Our programs are designed for every voice and every goal.",
  } satisfies Bilingual,
  media: {
    label: { ar: "قيادة كورال", en: "Conducting a Choir" },
    sublabel: { ar: "(صورة)", en: "(Image)" },
  } satisfies PlaceholderContent,
  items: [
    { icon: "🎤", title: { ar: "المطربون والمؤدون", en: "Singers" } },
    { icon: "🎙️", title: { ar: "المتحدثون", en: "Speakers" } },
    { icon: "💼", title: { ar: "المحترفون", en: "Professionals" } },
    { icon: "🏫", title: { ar: "المعلمون", en: "Teachers" } },
    { icon: "🎼", title: { ar: "الأطفال والناشئة", en: "Children" } },
    { icon: "🎶", title: { ar: "الكورالات", en: "Choirs" } },
    { icon: "🏛️", title: { ar: "المؤسسات والهيئات", en: "Institutions" } },
  ] as Array<{ icon: string; title: Bilingual }>,
};

export const WHY_TRAIN_WITH_US_CONTENT = {
  heading: { ar: "لماذا التدريب معنا", en: "Why Train With Us" } satisfies Bilingual,
  lead: {
    ar: "تعمل الأكاديمية وفق منهجية احترافية واحدة، تحت الإشراف الفني والتعليمي لأحمد حمدي رؤوف. كل برنامج يسير وفق منهج أحمد حمدي رؤوف — بحيث يحصل كل متدرب على المعيار نفسه من الجودة.",
    en: "The academy operates through a single professional methodology, under the artistic and educational supervision of Ahmed Hamdy Raouf. Every program follows the Ahmed Hamdy Raouf Method — so every trainee receives the same standard of quality.",
  } satisfies Bilingual,
  checklist: [
    { ar: "أكاديمية رائدة في التدريب الصوتي", en: "A leading voice training academy" },
    { ar: "موطن منهج أحمد حمدي رؤوف", en: "Home of the Ahmed Hamdy Raouf Method" },
    { ar: "برامج للأفراد والمؤسسات والفرق الغنائية", en: "Programs for individuals, institutions, and choirs" },
    { ar: "كل برنامج يتكيف مع الصوت والهدف", en: "Every program adapts to the voice and the goal" },
  ] as Bilingual[],
  items: [
    {
      num: "25",
      title: { ar: "عاماً من الخبرة المؤسسية", en: "Years of Institutional Experience" },
      body: {
        ar: "تشكّلت عبر تدريب أصوات في أكبر البرامج الغنائية التابعة لوزارتي الثقافة والشباب المصريتين.",
        en: "Built through training delivered inside some of the largest choral and vocal programs under Egypt's Ministry of Culture and Ministry of Youth.",
      },
    },
    {
      num: "◈",
      title: { ar: "برامج مخصصة", en: "Personalized Programs" },
      body: {
        ar: "لا دورات جاهزة ولا مناهج مكررة — كل متدرب يحصل على خطة مبنية حول صوته وأهدافه.",
        en: "No ready-made courses, no repeated curricula — every trainee receives a plan built around their own voice and goals.",
      },
    },
    {
      num: "◈",
      title: { ar: "أساس أكاديمي وعملي", en: "Academic & Practical Foundation" },
      body: {
        ar: "قائم على تكوين أكاديمي من الكونسرفتوار بالقاهرة والمعهد العالي للموسيقى العربية — منهجية غربية وشرقية معاً.",
        en: "Rooted in academic training from the Cairo Conservatoire and the Higher Institute of Arabic Music — Western and Eastern methodology in one.",
      },
    },
    {
      num: "◈",
      title: { ar: "خبرة دولية", en: "International Reach" },
      body: {
        ar: "برامج تُقدَّم أونلاين وحضورياً، تصل إلى متدربين ومؤسسات وفرق غنائية في المنطقة والخارج.",
        en: "Programs delivered online and in person, reaching trainees, institutions, and choirs across the region and beyond.",
      },
    },
  ] as Array<{ num: string; title: Bilingual; body: Bilingual }>,
};

export const PROGRAMS_CONTENT = {
  heading: { ar: "برامجنا التدريبية", en: "Our Training Programs" } satisfies Bilingual,
  lead: { ar: "مخصصة. منظمة. فعّالة.", en: "Personalized. Structured. Effective." } satisfies Bilingual,
  items: [
    {
      title: { ar: "التدريب الصوتي الفردي", en: "Individual Voice Training" },
      body: { ar: "برامج مخصصة لكل صوت وكل هدف.", en: "Personalized programs for every voice and goal." },
      media: { label: { ar: "تدريب فردي", en: "Individual Training" }, sublabel: { ar: "(صورة)", en: "(Image)" } },
    },
    {
      title: { ar: "الكورالات والفرق", en: "Choirs & Groups" },
      body: { ar: "بناء الانسجام والأداء الجماعي المتماسك.", en: "Build harmony. Create impact. Perform together." },
      media: { label: { ar: "كورال", en: "Choir" }, sublabel: { ar: "(صورة)", en: "(Image)" } },
    },
    {
      title: { ar: "الإلقاء والأداء", en: "Speaking & Performance" },
      body: { ar: "تطوير الحضور والثقة في الحديث والتقديم.", en: "Develop presence. Speak with confidence." },
      media: { label: { ar: "إلقاء", en: "Speaking" }, sublabel: { ar: "(صورة)", en: "(Image)" } },
    },
    {
      title: { ar: "برامج الأطفال والناشئة", en: "Kids & Teens Programs" },
      body: { ar: "بناء الثقة والصوت لجيل أصغر سناً.", en: "Build confidence and voice for a brighter future." },
      media: { label: { ar: "برامج الأطفال", en: "Kids Programs" }, sublabel: { ar: "(صورة)", en: "(Image)" } },
    },
  ] as Array<{ title: Bilingual; body: Bilingual; media: PlaceholderContent }>,
};

export const AI_VOICE_TEST_CONTENT = {
  badge: { ar: "اكتشف صوتك", en: "Discover Your Voice" } satisfies Bilingual,
  heading: { ar: "نظرة أولى وفورية على صوتك", en: "A First, Instant Look at Your Voice" } satisfies Bilingual,
  lead: {
    ar: "اختبارنا الصوتي بالذكاء الاصطناعي يقدّم قراءة أولية وسريعة — خطوة للاكتشاف، وليس بديلاً عن التقييم الاحترافي.",
    en: "Our AI-powered voice test offers a quick, preliminary read on your voice — a discovery step, not a substitute for professional evaluation.",
  } satisfies Bilingual,
  features: [
    { ar: "تحليل صوتي أساسي", en: "Basic Voice Analysis" },
    { ar: "نقاط القوة", en: "Strengths" },
    { ar: "نقاط تحتاج تطويراً", en: "Areas to Improve" },
    { ar: "توصيات فورية", en: "Instant Recommendations" },
  ] as Bilingual[],
  cta: { ar: "ابدأ الاختبار الصوتي المجاني", en: "Start Free AI Voice Test" } satisfies Bilingual,
};

export const VOICE_ASSESSMENT_CONTENT = {
  badge: { ar: "خطوتك الحقيقية الأولى", en: "Your First Real Step" } satisfies Bilingual,
  media: {
    label: { ar: "تقييمك الصوتي", en: "Your Voice Assessment" },
    sublabel: { ar: "(صورة)", en: "(Image)" },
  } satisfies PlaceholderContent,
  heading: { ar: "احجز تقييمك الصوتي الاحترافي", en: "Book Your Professional Voice Assessment" } satisfies Bilingual,
  lead: {
    ar: "الاختبار بالذكاء الاصطناعي مجرد بداية. التقييم الصوتي الاحترافي — الذي يُجرى بمعرفة أحمد حمدي رؤوف أو أحد المتخصصين المعتمدين وفق منهجه — هو حيث تبدأ رحلة التدريب الحقيقية.",
    en: "The AI test is only the beginning. The Professional Voice Assessment — conducted by Ahmed Hamdy Raouf or a certified specialist trained in his method — is where the real training journey begins.",
  } satisfies Bilingual,
  items: [
    { ar: "تقييم صوتي شامل", en: "Full Voice Evaluation" },
    { ar: "تحديد المستوى والأهداف", en: "Level & Goal Identification" },
    { ar: "خارطة طريق تدريبية مخصصة", en: "A Personalized Training Roadmap" },
    { ar: "توجيه احترافي وفق المنهج", en: "Expert, Method-Based Guidance" },
  ] as Bilingual[],
  cta: { ar: "احجز تقييمك الصوتي", en: "Book Your Voice Assessment" } satisfies Bilingual,
};

export const FINAL_CTA_CONTENT = {
  heading: { ar: "لصوتك غاية. لنطلقها معاً.", en: "Your Voice Has a Purpose. Let's Unlock It." } satisfies Bilingual,
  lead: {
    ar: "لا تنتظر اللحظة المثالية — ابدأ بخطوة واحدة، إما بالاختبار المجاني أو بحجز تقييمك الصوتي.",
    en: "Don't wait for the perfect moment — take one step, either the free test or booking your voice assessment.",
  } satisfies Bilingual,
  cta: { ar: "ابدأ رحلتك", en: "Begin Your Journey" } satisfies Bilingual,
};
