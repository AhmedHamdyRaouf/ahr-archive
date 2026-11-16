import type { Metadata } from "next";
import Link from "next/link";
import { genericList } from "@ahr/cms-core";
import { workDefinition } from "@ahr/content";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { getPersonPhotoUrl } from "@/lib/person-photo";
import { buildPageMetadata } from "@/lib/page-seo";

export async function generateMetadata({
  params,
}: {
  params: { locale: "ar" | "en" };
}): Promise<Metadata> {
  const seo = await buildPageMetadata(params.locale, `/${params.locale}`);
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonicalUrl, languages: seo.alternateUrls },
    openGraph: { title: seo.title, description: seo.description, locale: seo.ogLocale },
  };
}

const SUBJECT_PUBLIC_ID = "ahmed-hamdy-raouf";

/**
 * Implements: Sitemap (Phase 3) — Home; UI/UX Specification, Website UI
 * (doc 08) — "hero + featured Works/Recognition sections."
 *
 * Rewritten 2026-07-21 to match the live site's own content, order, and
 * section structure exactly (Hero → Story → Featured Works → Dandana
 * teaser → Vocal Training → Gallery → Streaming Platforms → Contact),
 * using the classNames from site-legacy.css (the live site's own CSS,
 * scoped under `.site-theme`) so it renders visually identical, not just
 * textually similar. Source: content/Master-Content-Dataset/
 * 12-Source-Files/Website-Archive/Legacy-Website-Build/{en,ar}/home.html.
 *
 * "Featured Works" cards are still wired to real `work` rows (unlike the
 * live static site's hardcoded 3 cards) — prefers `is_featured` rows,
 * falls back to the 3 most recent published works so the section is
 * never empty while nothing has been marked featured yet.
 *
 * Gallery/hero images are still the live site's own hotlinked URLs
 * (https://ahmedhamdyraouf.com/wp-content/uploads/...) — swap for
 * uploaded local Media Library assets once each has been re-uploaded
 * through /dashboard/media/upload (see Merge Report, MED-0038a–k).
 */
export default async function HomePage({ params }: { params: { locale: "ar" | "en" } }) {
  const isAr = params.locale === "ar";
  const supabase = createRouteHandlerSupabaseClient();

  const { data: featured } = await genericList(
    workDefinition,
    { supabase: supabase as never, actorId: "" },
    {
      pagination: { page: 1, pageSize: 3 },
      filters: { status: "published", visibility: "public", is_featured: true },
    },
  );
  let works = featured;
  if (works.length === 0) {
    const { data: recent } = await genericList(
      workDefinition,
      { supabase: supabase as never, actorId: "" },
      {
        pagination: { page: 1, pageSize: 3 },
        filters: { status: "published", visibility: "public" },
        sort: { field: "created_at", direction: "desc" },
      },
    );
    works = recent;
  }

  const { data: person } = await supabase
    .from("person")
    .select("id")
    .eq("public_id", SUBJECT_PUBLIC_ID)
    .maybeSingle();
  const heroPhoto = person
    ? await getPersonPhotoUrl(supabase, String(person.id), { publicOnly: true })
    : null;

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-sub">{isAr ? "الموقع الرسمي" : "Official Website"}</div>
          <h1>{isAr ? "أحمد حمدي رؤوف" : "Ahmed Hamdy Raouf"}</h1>
          <p>
            {isAr
              ? "مؤلف موسيقي، منتج، ومدرب أصوات مصري، صاحب تجربة فنية تمتد بين الموسيقى التصويرية، الأعمال المسرحية، الأغاني، والتجارب الموسيقية السينمائية الحديثة."
              : "Egyptian Composer, Music Producer, Vocal Coach, and Soundtrack Creator known for musical collaborations, cinematic compositions, theatre productions, and professional vocal training experiences."}
          </p>
          <div className="hero-buttons">
            <Link href={`/${params.locale}/works`} className="btn gold">
              {isAr ? "استكشف الأعمال" : "Explore Works"}
            </Link>
            <Link href={`/${params.locale}/contact`} className="btn">
              {isAr ? "تواصل الآن" : "Contact"}
            </Link>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section id="about">
        <div className="container">
          <div className="about-cinematic">
            <div className="about-content">
              <div className="hero-sub">{isAr ? "القصة" : "The Story"}</div>
              <h2>
                {isAr
                  ? "بعض الرجال يرثون الموسيقى، أما أحمد حمدي رؤوف فقد وُلد داخلها."
                  : "Some men inherit music. Ahmed Hamdy Raouf was born inside it."}
              </h2>
              <p>
                {isAr
                  ? "ابن المؤلف المسرحي المصري الكبير حمدي رؤوف، كتب ووزع أحمد أول عمل موسيقي كامل له قبل سن العاشرة — 14 أغنية كاملة، وموسيقى متكاملة، ورؤية فنية استمرت لأكثر من ربع قرن."
                  : "Son of legendary Egyptian theater composer Hamdy Raouf, Ahmed composed and arranged his first full musical production before the age of ten — 14 songs, a complete score, and a vision that would define the next quarter century."}
              </p>
              <p>
                {isAr
                  ? "تخرج في معهد الكونسرفتوار بالقاهرة، والمعهد العالي للموسيقى العربية، ليصنع لنفسه توازناً نادراً بين الهارموني الغربي والمقام الشرقي — ويحول الاثنين إلى هوية موسيقية خاصة به وحده."
                  : "Trained at the Cairo Conservatoire and the Higher Institute of Arabic Music, he built a rare double foundation — Western harmony and Eastern maqam — and made it entirely his own."}
              </p>
              <p>
                {isAr
                  ? "وعلى مدار أكثر من 25 عاماً، وصلت موسيقاه إلى أصوات عربية استثنائية مثل: محمد منير، علي الحجار، مدحت صالح — وشاركت أعماله في تشكيل الصوت الموسيقي للمسرح، والدراما، والأغنية العربية الحديثة."
                  : "Over 25 years, his compositions reached the greatest voices of the Arab world: Mohamed Mounir, Ali El-Haggar, Medhat Saleh — and shaped how those voices were heard across stages, screens, and generations."}
              </p>
              <Link href={`/${params.locale}/works`} className="btn gold">
                {isAr ? "استكشف الأعمال" : "Explore Works"}
              </Link>
            </div>
            <div className="about-image">
              {heroPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroPhoto}
                  alt={isAr ? "أحمد حمدي رؤوف — مؤلف موسيقي وموزع" : "Ahmed Hamdy Raouf — composer and arranger"}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="https://ahmedhamdyraouf.com/wp-content/uploads/2026/05/2-scaled.jpeg"
                  alt={isAr ? "أحمد حمدي رؤوف — مؤلف موسيقي وموزع" : "Ahmed Hamdy Raouf — composer and arranger"}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED WORKS */}
      <section id="works">
        <div className="container">
          <div className="section-title">
            <h2>{isAr ? "أبرز الأعمال" : "Featured Works"}</h2>
            <p>
              {isAr
                ? "مختارات من الأعمال الموسيقية، والموسيقى التصويرية، والإنتاجات المسرحية، والتجارب الفنية خلال رحلة أحمد حمدي رؤوف الفنية."
                : "A selected collection of musical works, dramatic scores, theatre productions, and artistic collaborations throughout Ahmed Hamdy Raouf's artistic journey."}
            </p>
          </div>
          <div className="works-grid">
            {works.map((work) => (
              <Link
                key={String(work.id)}
                href={`/${params.locale}/works/${work.public_id}`}
                className="work-card"
              >
                <div className="work-card-content">
                  <h3>{isAr ? String(work.title_ar ?? "") : String(work.title_en ?? work.title_ar ?? "")}</h3>
                  <p>{isAr ? String(work.description_ar ?? "") : String(work.description_en ?? "")}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DANDANA */}
      <section className="dandana" id="dandana">
        <div className="container">
          <div className="dandana-box">
            <h2>{isAr ? "مشروع الدندنة" : "Dandana Project"}</h2>
            <p>
              {isAr
                ? "«الدندنة» هي سلسلة موسيقية معاصرة ابتكرها أحمد حمدي رؤوف لإعادة تقديم الأغاني الشهيرة بروح أبسط، وأكثر قرباً، وإحساس بصري وموسيقي حديث."
                : '"Dandana" is a contemporary musical series created by Ahmed Hamdy Raouf to reinterpret well-known songs through simplified arrangements, intimate performance aesthetics, emotional delivery, and modern harmonic experimentation.'}
            </p>
            <p>
              {isAr
                ? "يركز المشروع على الحفاظ على روح الأغنية الأصلية مع تقديمها في قالب أكثر حميمية وبتجارب توزيع حديثة ومعالجة سينمائية."
                : "The project focuses on preserving the emotional essence of music while presenting it in a lighter, more personal, and visually cinematic artistic format."}
            </p>
            <p>
              {isAr
                ? "من خلال آلات بسيطة، وأداء حي، وتجارب هارمونية جديدة، تحولت «الدندنة» إلى هوية فنية مستقلة تجمع بين الموسيقى، والأداء، والسرد البصري الحديث."
                : "Using minimalist instrumentation, live performance energy, and expressive reinterpretation, \"Dandana\" became an evolving artistic identity connecting music, performance, and digital storytelling."}
            </p>
          </div>
        </div>
      </section>

      {/* VOCAL TRAINING */}
      <section id="training">
        <div className="container">
          <div className="section-title">
            <h2>{isAr ? "التدريب الصوتي الاحترافي" : "Professional Vocal Training"}</h2>
            <p>
              {isAr
                ? "تجربة تدريبية متكاملة للمطربين، والممثلين، وفناني الأداء، وكل من يسعى لبناء صوت قوي، وحضور فني، وهوية أدائية مميزة."
                : "A professional vocal development experience designed for singers, performers, actors, and aspiring artists seeking stronger technique, artistic confidence, and expressive vocal identity."}
            </p>
          </div>
          <div className="training-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://ahmedhamdyraouf.com/wp-content/uploads/2026/05/IMG_0928.jpeg"
              alt={isAr ? "جلسة تدريب صوتي مع أحمد حمدي رؤوف" : "Ahmed Hamdy Raouf vocal training session"}
            />
          </div>
          <div className="training-grid">
            <div className="training-card">
              <h3>{isAr ? "تقنيات الصوت" : "Vocal Technique"}</h3>
              <p>
                {isAr
                  ? "التحكم في النفس، ومخارج الصوت، والرنين، والثبات، والإسقاط الصوتي الاحترافي."
                  : "Breathing control, voice placement, resonance development, projection, and vocal stability training."}
              </p>
            </div>
            <div className="training-card">
              <h3>{isAr ? "الأداء والتعبير" : "Performance & Expression"}</h3>
              <p>
                {isAr
                  ? "التعبير العاطفي، والثقة على المسرح، والتفسير الفني، وسيكولوجية الأداء."
                  : "Emotional delivery, stage confidence, artistic interpretation, and performance psychology."}
              </p>
            </div>
            <div className="training-card">
              <h3>{isAr ? "جلسات التقييم" : "Evaluation Sessions"}</h3>
              <p>
                {isAr
                  ? "جلسات مخصصة لاكتشاف نقاط القوة، والتحديات التقنية، وتحديد الاتجاه الفني المناسب."
                  : "Personalized vocal evaluation sessions to identify strengths, technical challenges, and artistic direction."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery">
        <div className="container">
          <div className="section-title">
            <h2>{isAr ? "المعرض" : "Gallery"}</h2>
            <p>
              {isAr
                ? "أرشيف بصري سينمائي يوثق الهوية الفنية، وأجواء الاستوديو، واللحظات الموسيقية في رحلة أحمد حمدي رؤوف."
                : "A cinematic visual archive capturing artistic identity, studio atmosphere, musical storytelling, and moments from Ahmed Hamdy Raouf's creative journey."}
            </p>
          </div>
          <div className="gallery-grid">
            {[
              "0D9E6E7A-8E27-436D-AA5F-CD98534A6F27.png",
              "AD995D71-C242-4ACB-B4C5-CFC8426F47DA.png",
              "48C750FA-CC2D-45E2-8CD3-3A148F84DA3E.png",
              "0886B49D-A631-45D2-A175-9BB3B049C124.png",
              "3F60352A-B71A-425B-A292-5946EC8D7BD4.png",
              "B6BA1BFA-6B92-4028-B021-677CF9F1C156.png",
            ].map((file) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={file}
                src={`https://ahmedhamdyraouf.com/wp-content/uploads/2026/05/${file}`}
                alt={isAr ? "أحمد حمدي رؤوف — صورة من الاستوديو" : "Ahmed Hamdy Raouf — studio and performance photo"}
                data-cursor="view"
              />
            ))}
          </div>
        </div>
      </section>

      {/* STREAMING PLATFORMS */}
      <section id="platforms">
        <div className="container">
          <div className="section-title">
            <h2>{isAr ? "منصات الاستماع" : "Streaming Platforms"}</h2>
            <p>
              {isAr
                ? "استمع إلى أعمال أحمد حمدي رؤوف والموسيقى التصويرية والإنتاجات الفنية عبر مختلف المنصات الموسيقية العالمية."
                : "Listen to Ahmed Hamdy Raouf's music, soundtracks, and artistic productions across major streaming platforms."}
            </p>
          </div>
          <div className="socials">
            <a href="https://open.spotify.com/intl-ar/artist/3z8FLVunc5rHdg8Ixx2Lch" target="_blank" rel="noopener noreferrer">Spotify</a>
            <a href="https://play.anghami.com/artist/1910527" target="_blank" rel="noopener noreferrer">Anghami</a>
            <a href="https://music.apple.com/us/artist/ahmed-hamdy-raouf/1544198053" target="_blank" rel="noopener noreferrer">Apple Music</a>
            <a href="https://soundcloud.com/AhmedHamdyRaouf" target="_blank" rel="noopener noreferrer">SoundCloud</a>
            <a href="https://music.youtube.com/@ahmedhamdyraouf" target="_blank" rel="noopener noreferrer">YouTube Music</a>
            <a href="https://music.amazon.co.uk/artists/B07CHWH69R/ahmed-hamdy-raouf" target="_blank" rel="noopener noreferrer">Amazon Music</a>
            <a href="https://link.deezer.com/s/33kF0obeoaCKjcEIFWVt6" target="_blank" rel="noopener noreferrer">Deezer</a>
          </div>
        </div>
      </section>

      {/* CONTACT & SOCIAL */}
      <section className="contact" id="contact">
        <div className="container">
          <h2>{isAr ? "التواصل ووسائل التواصل الاجتماعي" : "Contact & Social Media"}</h2>
          <p>
            {isAr
              ? "للتعاونات الفنية، والإنتاج الموسيقي، والتدريب الصوتي، والاستفسارات الإعلامية، يمكنكم التواصل مع أحمد حمدي رؤوف عبر المنصات الرسمية."
              : "For collaborations, music production, vocal training, media inquiries, or artistic projects, connect with Ahmed Hamdy Raouf through official platforms and social media channels."}
          </p>
          <div className="socials">
            <a href="https://www.facebook.com/AhmedHamdyRaouf" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://www.instagram.com/ahmedhamdyraouf" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.tiktok.com/@ahmedhamdyraouf" target="_blank" rel="noopener noreferrer">TikTok</a>
            <a href="https://x.com/AhmedHamdyRaouf" target="_blank" rel="noopener noreferrer">X</a>
            <a href="https://youtube.com/AhmedHamdyRaouf" target="_blank" rel="noopener noreferrer">YouTube</a>
            <a href="https://www.linkedin.com/in/ahmedhamdyraouf" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="mailto:contact@ahmedhamdyraouf.com">Email</a>
          </div>
        </div>
      </section>
    </>
  );
}
