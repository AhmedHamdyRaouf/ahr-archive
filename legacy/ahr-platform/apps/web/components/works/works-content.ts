export interface Bilingual {
  ar: string;
  en: string;
}

export const WORKS_HERO_CONTENT = {
  eyebrow: { ar: "الأرشيف", en: "The Archive" } satisfies Bilingual,
  title: { ar: "الأعمال", en: "Works" } satisfies Bilingual,
  intro: {
    ar: "مجموعة من الأعمال الموسيقية، والإنتاجات، والتعاونات الفنية على مدار سنوات من العمل الإبداعي.",
    en: "A collection of compositions, productions, collaborations and artistic projects spanning years of creative work.",
  } satisfies Bilingual,
  statLabel: { ar: "عمل", en: "Works" } satisfies Bilingual,
};

export const EDITORIAL_INTRO_CONTENT = {
  heading: { ar: "مسيرة عمر من الإبداع", en: "A Lifetime of Creation" } satisfies Bilingual,
  body: {
    ar: "كل عمل يمثل فصلاً في رحلة فنية مستمرة تمتد بين الموسيقى، والتعليم، والأثر الثقافي.",
    en: "Every work represents a chapter in an ongoing artistic journey spanning music, education and cultural impact.",
  } satisfies Bilingual,
};

export const CURATED_SELECTION_CONTENT = {
  eyebrow: { ar: "مختارات", en: "Curated" } satisfies Bilingual,
  heading: { ar: "مختارات منسقة", en: "Curated Selection" } satisfies Bilingual,
};

export const ARCHIVE_CONTENT = {
  eyebrow: { ar: "الأرشيف الكامل", en: "Full Archive" } satisfies Bilingual,
  heading: { ar: "كل الأعمال", en: "All Works" } satisfies Bilingual,
  searchPlaceholder: { ar: "ابحث عن أعمال، فنانين، مشاريع...", en: "Search works, artists, projects..." } satisfies Bilingual,
  sortLabel: { ar: "ترتيب حسب", en: "Sort by" } satisfies Bilingual,
  filtersLabel: { ar: "الفلاتر", en: "Filters" } satisfies Bilingual,
  editorialView: { ar: "تحريري", en: "Editorial" } satisfies Bilingual,
  gridView: { ar: "شبكة", en: "Grid" } satisfies Bilingual,
  viewWork: { ar: "عرض العمل", en: "View Work" } satisfies Bilingual,
  loadMore: { ar: "عرض المزيد", en: "Load more" } satisfies Bilingual,
  noResults: { ar: "لا توجد أعمال مطابقة لبحثك.", en: "No works match your search." } satisfies Bilingual,
  endOfArchive: { ar: "وصلت لنهاية الأرشيف.", en: "You’ve reached the end of the archive." } satisfies Bilingual,
};

export const SORT_OPTIONS: Array<{ value: string; label: Bilingual }> = [
  { value: "year_desc", label: { ar: "الأحدث", en: "Latest" } },
  { value: "year_asc", label: { ar: "الأقدم", en: "Oldest" } },
  { value: "title_asc", label: { ar: "العنوان (أ-ي)", en: "Title (A-Z)" } },
];

export const WORK_TYPE_FILTERS: Array<{ value: string; label: Bilingual }> = [
  { value: "all", label: { ar: "الكل", en: "All" } },
  { value: "song", label: { ar: "أغاني", en: "Songs" } },
  { value: "album", label: { ar: "ألبومات", en: "Albums" } },
  { value: "film", label: { ar: "أفلام", en: "Film" } },
  { value: "tv_series", label: { ar: "مسلسلات", en: "TV" } },
  { value: "theatre", label: { ar: "مسرح", en: "Theatre" } },
  { value: "choir", label: { ar: "كورالات", en: "Choirs" } },
  { value: "soundtrack", label: { ar: "موسيقى تصويرية", en: "Soundtrack" } },
  { value: "arrangement", label: { ar: "توزيعات", en: "Arrangements" } },
  { value: "concert", label: { ar: "حفلات", en: "Concerts" } },
];

export const WORK_TYPE_LABELS: Record<string, Bilingual> = Object.fromEntries(
  WORK_TYPE_FILTERS.filter((f) => f.value !== "all").map((f) => [f.value, f.label]),
);

export const FINAL_CTA_CONTENT = {
  heading: { ar: "القصة مستمرة...", en: "The story continues..." } satisfies Bilingual,
  body: {
    ar: "استكشف المشاريع القادمة، وتعرّف أكتر على الرحلة الفنية لأحمد حمدي رؤوف.",
    en: "Explore the projects underway, and get to know more of Ahmed Hamdy Raouf's artistic journey.",
  } satisfies Bilingual,
  exploreProjects: { ar: "استكشف المشاريع", en: "Explore Projects" } satisfies Bilingual,
  meetAhmed: { ar: "تعرّف على أحمد", en: "Meet Ahmed" } satisfies Bilingual,
};
