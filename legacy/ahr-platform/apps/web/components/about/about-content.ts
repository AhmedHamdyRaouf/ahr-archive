/**
 * Implements: Sitemap (Phase 3) — About. Fixed editorial/narrative copy
 * for the cinematic About page rebuild (data owner spec, 2026-07-23) —
 * this page intentionally does not read `person.bio_ar/bio_en`; every
 * section's content is scripted copy, centralized here so the nine
 * section components stay presentational only.
 */

export interface Bilingual {
  ar: string;
  en: string;
}

export interface PlaceholderContent {
  label: Bilingual;
  sublabel: Bilingual;
}

/**
 * Stable Asset Library `image_key` values this page looks up (Asset
 * Library infrastructure, 2026-07-24; wired up here 2026-07-25). Publish
 * an asset under one of these keys via /dashboard/asset-library and it
 * replaces the matching placeholder below automatically — no code change
 * needed per image swap.
 */
export const ABOUT_IMAGE_KEYS = {
  heroPortrait: "about-hero-portrait",
  whereMusicFoundMe: "about-where-music-found-me",
  rootsLegacy: "about-roots-legacy",
  signatureWorksSongs: "about-signature-works-songs",
  signatureWorksFilmScores: "about-signature-works-film-scores",
  signatureWorksTheatre: "about-signature-works-theatre",
  signatureWorksVoiceTraining: "about-signature-works-voice-training",
  lookingAheadBackground: "about-looking-ahead-background",
  manifestoImage: "about-manifesto-writing-hand",
} as const;

/**
 * Named (not positional) so section components never index an array by
 * number — `SECTION_META.heroSection.id`, not `TIMELINE_SECTIONS[0]`.
 */
export const SECTION_META = {
  hero: { id: "discover-ahmed", number: "01" },
  whereMusicFoundMe: { id: "where-music-found-me", number: "02" },
  rootsLegacy: { id: "roots-legacy", number: "03" },
  twoMusicalWorlds: { id: "two-musical-worlds", number: "04" },
  signatureWorks: { id: "signature-works", number: "05" },
  beyondMusic: { id: "beyond-the-music", number: "06" },
  recognition: { id: "recognition", number: "07" },
  lookingAhead: { id: "looking-ahead", number: "08" },
  manifesto: { id: "manifesto", number: "09" },
} as const;

export const TIMELINE_SECTIONS: Array<{ id: string; number: string; label: Bilingual }> = [
  { ...SECTION_META.hero, label: { ar: "اكتشف أحمد", en: "Discover Ahmed" } },
  { ...SECTION_META.whereMusicFoundMe, label: { ar: "حيث وجدتني الموسيقى", en: "Where Music Found Me" } },
  { ...SECTION_META.rootsLegacy, label: { ar: "الجذور والإرث", en: "Roots & Legacy" } },
  { ...SECTION_META.twoMusicalWorlds, label: { ar: "عالمان موسيقيان", en: "Two Musical Worlds" } },
  { ...SECTION_META.signatureWorks, label: { ar: "أعمال موقَّعة", en: "Signature Works" } },
  { ...SECTION_META.beyondMusic, label: { ar: "أبعد من الموسيقى", en: "Beyond The Music" } },
  { ...SECTION_META.recognition, label: { ar: "التكريمات", en: "Recognition" } },
  { ...SECTION_META.lookingAhead, label: { ar: "نحو المستقبل", en: "Looking Ahead" } },
  { ...SECTION_META.manifesto, label: { ar: "بيان فني", en: "Manifesto" } },
];

export const HERO_CONTENT = {
  eyebrow: { ar: "اكتشف أحمد", en: "Discover Ahmed" } satisfies Bilingual,
  name: { ar: "أحمد حمدي رؤوف", en: "Ahmed Hamdy Raouf" } satisfies Bilingual,
  roles: [
    { ar: "مؤلف موسيقي", en: "Composer" },
    { ar: "منتج موسيقي", en: "Music Producer" },
    { ar: "مدرب أصوات", en: "Voice Coach" },
    { ar: "مدير فني", en: "Artistic Director" },
  ] as Bilingual[],
  statement: {
    ar: "حياة مكتوبة على شكل ألحان — من أول نغمة طفل إلى إرث لا يزال يُكتب.",
    en: "A life composed in movements — from a child's first melody to a legacy still being written.",
  } satisfies Bilingual,
  primaryCta: { ar: "استكشف رحلتي", en: "Explore My Journey" } satisfies Bilingual,
  secondaryCta: { ar: "أعمال مختارة", en: "Selected Works" } satisfies Bilingual,
  musicCta: { ar: "استمع أثناء التصفح", en: "Listen While Exploring" } satisfies Bilingual,
  portrait: {
    label: { ar: "بورتريه رئيسي", en: "Portrait Placeholder" },
    sublabel: { ar: "(صورة البطل)", en: "(Hero Image)" },
  } satisfies PlaceholderContent,
};

export const WHERE_MUSIC_FOUND_ME_CONTENT = {
  image: {
    label: { ar: "شارع الترعة — الإسكندرية", en: "Canal Street — Alexandria" },
    sublabel: { ar: "(الصورة الرئيسية)", en: "(Hero Image)" },
  } satisfies PlaceholderContent,
  heading: { ar: "حيث وجدتني الموسيقى", en: "Where Music Found Me" } satisfies Bilingual,
  paragraphOne: {
    ar: "قبل المسارح والاستوديوهات بزمن طويل، كان هناك شارع في الإسكندرية — هواء مالح، شبابيك مفتوحة، وبيانو لم يكن مضبوطًا تمامًا يومًا. وكان هذا كافيًا.",
    en: "Long before stages and studios, there was a street in Alexandria — salt air, open windows, and a piano that never quite stayed in tune. That was enough.",
  } satisfies Bilingual,
  quote: {
    ar: "«الموسيقى لم تأتِ. كانت موجودة بالفعل، تنتظر أن يُلتفت إليها.»",
    en: "“Music didn’t arrive. It was already there, waiting to be noticed.”",
  } satisfies Bilingual,
  paragraphTwo: {
    ar: "طفل أنصت قبل أن يعرف اسم ما يسمعه، كبر ليصبح رجلًا يقضي عمره في ترجمة الصمت إلى صوت.",
    en: "A child who listened before he could name what he heard grew into a man who spends his life translating silence into sound.",
  } satisfies Bilingual,
  continueCta: { ar: "تابع الرحلة", en: "Continue The Journey" } satisfies Bilingual,
};

export const ROOTS_LEGACY_CONTENT = {
  image: {
    label: { ar: "أحمد وحمدي رؤوف", en: "Ahmed & Hamdy Raouf" },
    sublabel: { ar: "(أرشيف العائلة)", en: "(Family Archive)" },
  } satisfies PlaceholderContent,
  blocks: [
    {
      heading: { ar: "الجذور", en: "Roots" },
      body: {
        ar: "ابن المؤلف المسرحي المصري الكبير حمدي رؤوف، نشأ أحمد داخل غرف التدريبات، وحفر الأوركسترا، وأوراق نوتة لم تكتمل بعد.",
        en: "Son of legendary Egyptian theatre composer Hamdy Raouf, Ahmed grew up inside rehearsal rooms, orchestra pits, and half-finished scores.",
      },
    },
    {
      heading: { ar: "الإرث", en: "Legacy" },
      body: {
        ar: "قبل سن العاشرة، كان قد ألّف ووزّع عملاً موسيقيًا كاملاً — 14 أغنية، وموسيقى متكاملة، دليلاً على أن الإرث قد يكون غريزة لا تقليدًا.",
        en: "By nine, he had already composed and arranged a full musical production — 14 songs, a complete score, proof that inheritance can be instinct, not imitation.",
      },
    },
    {
      heading: { ar: "فصل جديد", en: "New Chapter" },
      body: {
        ar: "تخرّج من الكونسرفتوار بالقاهرة والمعهد العالي للموسيقى العربية، ليبني لغته الخاصة — هارموني غربي يجاوب المقام الشرقي.",
        en: "Trained at the Cairo Conservatoire and the Higher Institute of Arabic Music, he built his own language — Western harmony answering Eastern maqam.",
      },
    },
  ] as Array<{ heading: Bilingual; body: Bilingual }>,
  quote: {
    ar: "«بعض الرجال يرثون الموسيقى، أما أحمد فقد وُلد داخلها.»",
    en: "“Some men inherit music. Ahmed was born inside it.”",
  } satisfies Bilingual,
  legacyLine: { ar: "1953 — 2013 — اليوم", en: "1953 — 2013 — Today" } satisfies Bilingual,
};

export const TWO_MUSICAL_WORLDS_CONTENT = {
  heading: { ar: "عالمان موسيقيان", en: "Two Musical Worlds" } satisfies Bilingual,
  paragraph: {
    ar: "هارموني غربي. مقام شرقي. نظامان نادرًا ما يتحدثان اللغة نفسها — إلى أن يلتقيا داخل صمت واحد، مقصود.",
    en: "Western harmony. Eastern maqam. Two systems that rarely speak the same language — until they meet inside a single, deliberate silence.",
  } satisfies Bilingual,
  quote: {
    ar: "«بين عالمين، بنى عالمًا ثالثًا — خاصًا به وحده.»",
    en: "“Between two worlds, he built a third — entirely his own.”",
  } satisfies Bilingual,
  monogram: "AHR",
};

export const SIGNATURE_WORKS_CONTENT = {
  heading: { ar: "أعمال موقَّعة", en: "Signature Works" } satisfies Bilingual,
  intro: { ar: "أربعة مجالات. توقيع واحد.", en: "Four disciplines. One signature." } satisfies Bilingual,
  discoverCta: { ar: "اكتشف القصة", en: "Discover The Story" } satisfies Bilingual,
  posters: [
    {
      title: { ar: "أغاني", en: "Songs" },
      description: {
        ar: "ألحان حملت أصواتًا عربية استثنائية عبر جيل كامل.",
        en: "Melodies that carried some of the greatest Arab voices across a generation.",
      },
      placeholder: {
        label: { ar: "بوستر — أغاني", en: "Songs Poster" },
        sublabel: { ar: "(بوستر)", en: "(Poster Placeholder)" },
      },
      imageKey: ABOUT_IMAGE_KEYS.signatureWorksSongs,
    },
    {
      title: { ar: "موسيقى تصويرية", en: "Film Scores" },
      description: {
        ar: "موسيقى تصويرية صُنعت لتُشعَر قبل أن تُسمع.",
        en: "Cinematic scores built to be felt before they are heard.",
      },
      placeholder: {
        label: { ar: "بوستر — موسيقى تصويرية", en: "Film Score Poster" },
        sublabel: { ar: "(بوستر)", en: "(Poster Placeholder)" },
      },
      imageKey: ABOUT_IMAGE_KEYS.signatureWorksFilmScores,
    },
    {
      title: { ar: "مسرح", en: "Theatre" },
      description: {
        ar: "إنتاجات مسرحية ترث علاقة عائلية عمرها أجيال بالمسرح.",
        en: "Stage productions inheriting a family's lifelong relationship with the theatre.",
      },
      placeholder: {
        label: { ar: "بوستر — مسرح", en: "Theatre Poster" },
        sublabel: { ar: "(بوستر)", en: "(Poster Placeholder)" },
      },
      imageKey: ABOUT_IMAGE_KEYS.signatureWorksTheatre,
    },
    {
      title: { ar: "تدريب صوتي", en: "Voice Training" },
      description: {
        ar: "منهج بُني ليصقل الجيل القادم من الأصوات العربية.",
        en: "A discipline built to shape the next generation of Arab voices.",
      },
      placeholder: {
        label: { ar: "بوستر — تدريب صوتي", en: "Voice Training Poster" },
        sublabel: { ar: "(بوستر)", en: "(Poster Placeholder)" },
      },
      imageKey: ABOUT_IMAGE_KEYS.signatureWorksVoiceTraining,
    },
  ] as Array<{
    title: Bilingual;
    description: Bilingual;
    placeholder: PlaceholderContent;
    imageKey: string;
  }>,
};

export const BEYOND_MUSIC_CONTENT = {
  heading: { ar: "أبعد من الموسيقى", en: "Beyond The Music" } satisfies Bilingual,
  discoverCta: { ar: "اكتشف", en: "Discover" } satisfies Bilingual,
  cards: [
    {
      title: { ar: "مدرب أصوات", en: "Voice Coach" },
      description: {
        ar: "تدريب شخصي للمطربين والممثلين وفناني الأداء لبناء صوت يدوم.",
        en: "Personalized training for singers, actors, and performers building a voice that lasts.",
      },
    },
    {
      title: { ar: "بناء الكورالات", en: "Choir Builder" },
      description: {
        ar: "تجميع وقيادة فرق غنائية قائمة على الانضباط والتناغم.",
        en: "Assembling and directing vocal ensembles built on discipline and blend.",
      },
    },
    {
      title: { ar: "مرشد فني", en: "Mentor" },
      description: {
        ar: "توجيه الملحنين والمطربين الناشئين خلال أصعب القرارات الأولى.",
        en: "Guiding emerging composers and vocalists through the earliest, hardest decisions.",
      },
    },
    {
      title: { ar: "مشاريع ثقافية", en: "Cultural Projects" },
      description: {
        ar: "مبادرات تصل التراث الموسيقي العربي بجمهور معاصر.",
        en: "Initiatives connecting Arabic musical heritage to a contemporary audience.",
      },
    },
  ] as Array<{ title: Bilingual; description: Bilingual }>,
};

export const RECOGNITION_CONTENT = {
  heading: { ar: "التكريمات", en: "Recognition" } satisfies Bilingual,
  cards: [
    { ar: "الإقامة الذهبية", en: "Golden Visa" },
    { ar: "الجوائز", en: "Awards" },
    { ar: "الظهور الإعلامي", en: "Media" },
    { ar: "الشهادات", en: "Certificates" },
    { ar: "العضويات", en: "Memberships" },
    { ar: "التكريم الحكومي", en: "Government Recognition" },
    { ar: "الصحافة", en: "Press" },
    { ar: "أعمال مميزة", en: "Featured Works" },
  ] as Bilingual[],
};

export const LOOKING_AHEAD_CONTENT = {
  heading: { ar: "نحو المستقبل", en: "Looking Ahead" } satisfies Bilingual,
  background: {
    label: { ar: "إضاءة المسرح", en: "Stage Light" },
    sublabel: { ar: "(خلفية)", en: "(Background Placeholder)" },
  } satisfies PlaceholderContent,
  columns: [
    {
      title: { ar: "التعليم", en: "Education" },
      body: {
        ar: "بناء تدريب صوتي وموسيقي منظم ومتاح للجميع.",
        en: "Building structured, accessible vocal and musical training.",
      },
    },
    {
      title: { ar: "شبكة إبداعية", en: "Creative Network" },
      body: {
        ar: "ربط الملحنين والمؤدين والمؤسسات عبر المنطقة.",
        en: "Connecting composers, performers, and institutions across the region.",
      },
    },
    {
      title: { ar: "مشاريع قادمة", en: "Future Projects" },
      body: {
        ar: "أعمال جديدة، مسارح جديدة، وتعاونات تتشكل بالفعل.",
        en: "New scores, new stages, new collaborations already taking shape.",
      },
    },
    {
      title: { ar: "رسالة واحدة", en: "One Mission" },
      body: {
        ar: "أن تبقى الموسيقى العربية صادقة، طموحة، ومسموعة.",
        en: "To keep Arabic music honest, ambitious, and heard.",
      },
    },
  ] as Array<{ title: Bilingual; body: Bilingual }>,
};

export const MANIFESTO_CONTENT = {
  image: {
    label: { ar: "يد تكتب", en: "Writing Hand" },
    sublabel: { ar: "(صورة)", en: "(Image Placeholder)" },
  } satisfies PlaceholderContent,
  heading: { ar: "لنصنع شيئًا ذا معنى معًا", en: "Let's Create Something Meaningful Together" } satisfies Bilingual,
  body: {
    ar: "كل تعاون يبدأ بالطريقة نفسها — بنغمة واحدة، وسؤال مفتوح، واستعداد للجلوس داخل الصمت حتى يقول شيئًا يستحق أن يبقى. هذه هي الطريقة الوحيدة التي وُلد بها أي عمل ذو معنى.",
    en: "Every collaboration begins the same way — with a single note, an open question, and the willingness to sit inside silence until it says something worth keeping. That is the only way anything meaningful has ever been made.",
  } satisfies Bilingual,
  collaborateCta: { ar: "تعاون", en: "Collaborate" } satisfies Bilingual,
  contactCta: { ar: "تواصل", en: "Contact" } satisfies Bilingual,
};
