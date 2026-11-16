import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/page-seo";
import { MediaPlaceholder } from "@/components/voice-training/media-placeholder";
import {
  HERO_CONTENT,
  VISION_CONTENT,
  MISSION_CONTENT,
  PHILOSOPHY_CONTENT,
  WHY_VOICE_MATTERS_CONTENT,
  WHO_WE_TRAIN_CONTENT,
  WHY_TRAIN_WITH_US_CONTENT,
  PROGRAMS_CONTENT,
  AI_VOICE_TEST_CONTENT,
  VOICE_ASSESSMENT_CONTENT,
  FINAL_CTA_CONTENT,
} from "@/components/voice-training/voice-training-content";

export async function generateMetadata({
  params,
}: {
  params: { locale: "ar" | "en" };
}): Promise<Metadata> {
  const seo = await buildPageMetadata(params.locale, `/${params.locale}/voice-training`, {
    ar: "تدريب صوتي",
    en: "Voice Training",
  });
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonicalUrl },
  };
}

/**
 * Implements: Sitemap (Phase 3) — Voice Training, replacing Projects in
 * the primary nav (data owner spec, 2026-07-26; layout revised to match
 * the data owner's reference mockup). An institutional, editorial
 * rebuild of the real, currently-live legacy training page (content/
 * Master-Content-Dataset/12-Source-Files/Website-Archive/
 * Legacy-Website-Build/{en,ar}/training.html) — copy lives in
 * components/voice-training/voice-training-content.ts, styling in the
 * `.vt-*` rules appended to globals.css.
 *
 * Image slots (hero, Who We Train, Training Programs, Voice Assessment)
 * use `MediaPlaceholder` rather than real photography — the only real,
 * non-generic image available is Ahmed Hamdy Raouf's own portrait, which
 * reads oddly restaged as "studio atmosphere" for four different slots.
 * Same convention as the About page: an elegant placeholder now, swapped
 * for a real Asset Library image later with no layout change.
 *
 * The AI Voice Test and Voice Assessment sections are presentational —
 * `@ahr/ai` has no public voice-analysis feature and there is no booking
 * system in this build, so both CTAs route to Contact, the one real
 * conversion point this platform has.
 */
export default function VoiceTrainingPage({ params }: { params: { locale: "ar" | "en" } }) {
  const isAr = params.locale === "ar";
  const t = <T extends { ar: string; en: string }>(c: T) => (isAr ? c.ar : c.en);
  const contactHref = `/${params.locale}/contact`;

  return (
    <>
      {/* HERO */}
      <section className="vt-hero">
        <div className="container vt-hero-grid">
          <div>
            <div className="vt-badge">◈ {t(HERO_CONTENT.badge)}</div>
            <h1 className="vt-h1">
              {t(HERO_CONTENT.headlineLine1)}
              <br />
              <span className="vt-gold">{t(HERO_CONTENT.headlineLine2)}</span>
            </h1>
            <p className="vt-lead">{t(HERO_CONTENT.subheadline)}</p>
            <div className="vt-btns">
              <Link href={contactHref} className="btn gold">
                {t(HERO_CONTENT.primaryCta)}
              </Link>
              <Link href={contactHref} className="btn">
                {t(HERO_CONTENT.secondaryCta)}
              </Link>
            </div>
            <div className="vt-stats">
              {HERO_CONTENT.stats.map((stat) => (
                <div className="vt-stat" key={stat.num}>
                  <div className="vt-stat-num">{stat.num}</div>
                  <div className="vt-stat-label">{t(stat.label)}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <MediaPlaceholder content={HERO_CONTENT.media} locale={params.locale} />
            <div className="vt-hero-caption">
              <div className="vt-signature-name">{t(HERO_CONTENT.signatureName)}</div>
              <div className="vt-signature-role">{t(HERO_CONTENT.signatureRole)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR VISION / MISSION / TRAINING PHILOSOPHY */}
      <section className="vt-section-mid">
        <div className="container vt-trio-grid">
          <div className="vt-trio-card">
            <div className="vt-trio-icon">{VISION_CONTENT.icon}</div>
            <h3>{t(VISION_CONTENT.heading)}</h3>
            <p className="vt-trio-tagline">{t(VISION_CONTENT.tagline)}</p>
            <p>{t(VISION_CONTENT.summary)}</p>
          </div>
          <div className="vt-trio-card">
            <div className="vt-trio-icon">{MISSION_CONTENT.icon}</div>
            <h3>{t(MISSION_CONTENT.heading)}</h3>
            <p className="vt-trio-tagline">{t(MISSION_CONTENT.tagline)}</p>
            <p>{t(MISSION_CONTENT.summary)}</p>
          </div>
          <div className="vt-trio-card">
            <div className="vt-trio-icon">{PHILOSOPHY_CONTENT.icon}</div>
            <h3>{t(PHILOSOPHY_CONTENT.badge)}</h3>
            <p className="vt-trio-tagline">{t(PHILOSOPHY_CONTENT.tagline)}</p>
            <p>{t(PHILOSOPHY_CONTENT.summary)}</p>
          </div>
        </div>
      </section>

      {/* TRAINING PHILOSOPHY — full quote */}
      <section>
        <div className="container">
          <div className="vt-philosophy">
            <div className="vt-badge" style={{ margin: "0 auto 30px" }}>
              ◈ {t(PHILOSOPHY_CONTENT.badge)}
            </div>
            <p className="vt-philosophy-quote">{t(PHILOSOPHY_CONTENT.quote)}</p>
            <p className="vt-philosophy-sub">{t(PHILOSOPHY_CONTENT.subtext)}</p>
          </div>
        </div>
      </section>

      {/* WHY YOUR VOICE MATTERS — light section, icon-circle row */}
      <section className="vt-section-light">
        <div className="container">
          <div className="section-title vt-centered">
            <h2>{t(WHY_VOICE_MATTERS_CONTENT.heading)}</h2>
            <p>{t(WHY_VOICE_MATTERS_CONTENT.lead)}</p>
          </div>
          <div className="vt-icon-row">
            {WHY_VOICE_MATTERS_CONTENT.items.map((item) => (
              <div className="vt-icon-item" key={t(item.title)}>
                <div className="vt-icon-circle">{item.icon}</div>
                <h4>{t(item.title)}</h4>
                <p>{t(item.body)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO WE TRAIN — text+icons | photo */}
      <section className="vt-section-mid">
        <div className="container vt-split">
          <div>
            <h2 className="vt-h2">{t(WHO_WE_TRAIN_CONTENT.heading)}</h2>
            <p className="vt-lead">{t(WHO_WE_TRAIN_CONTENT.lead)}</p>
            <div className="vt-who-grid">
              {WHO_WE_TRAIN_CONTENT.items.map((item) => (
                <div className="vt-who-card" key={t(item.title)}>
                  <div className="vt-who-icon">{item.icon}</div>
                  <div className="vt-who-title">{t(item.title)}</div>
                </div>
              ))}
            </div>
          </div>
          <MediaPlaceholder content={WHO_WE_TRAIN_CONTENT.media} locale={params.locale} className="vt-media-wide" />
        </div>
      </section>

      {/* WHY TRAIN WITH US — stats+text | checklist */}
      <section>
        <div className="container">
          <div className="vt-divider">
            <div className="vt-divider-line" />
            <span className="vt-label">◈ {t(WHY_TRAIN_WITH_US_CONTENT.heading)}</span>
            <div className="vt-divider-line" />
          </div>
          <div className="vt-split">
            <div>
              <p className="vt-lead">{t(WHY_TRAIN_WITH_US_CONTENT.lead)}</p>
              <div className="vt-why-grid">
                {WHY_TRAIN_WITH_US_CONTENT.items.map((item) => (
                  <div className="vt-why-item" key={t(item.title)}>
                    <div className="vt-why-num">{item.num}</div>
                    <div className="vt-why-text">
                      <h4>{t(item.title)}</h4>
                      <p>{t(item.body)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="vt-checklist">
              {WHY_TRAIN_WITH_US_CONTENT.checklist.map((item) => (
                <div className="vt-checklist-item" key={t(item)}>
                  {t(item)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRAINING PROGRAMS — light section, image cards */}
      <section className="vt-section-light">
        <div className="container">
          <div className="section-title vt-centered">
            <h2>{t(PROGRAMS_CONTENT.heading)}</h2>
            <p>{t(PROGRAMS_CONTENT.lead)}</p>
          </div>
          <div className="vt-programs-grid">
            {PROGRAMS_CONTENT.items.map((item) => (
              <div className="vt-program-card" key={t(item.title)}>
                <MediaPlaceholder content={item.media} locale={params.locale} className="vt-program-media" />
                <h3>{t(item.title)}</h3>
                <p>{t(item.body)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI VOICE TEST — text | score-ring graphic */}
      <section className="vt-section-mid">
        <div className="container vt-split">
          <div>
            <div className="vt-badge">◈ {t(AI_VOICE_TEST_CONTENT.badge)}</div>
            <h2 className="vt-h2">{t(AI_VOICE_TEST_CONTENT.heading)}</h2>
            <p className="vt-lead">{t(AI_VOICE_TEST_CONTENT.lead)}</p>
            <div className="vt-panel-features" style={{ justifyContent: "flex-start" }}>
              {AI_VOICE_TEST_CONTENT.features.map((f) => (
                <div className="vt-panel-feat" key={t(f)}>
                  {t(f)}
                </div>
              ))}
            </div>
            <div className="vt-btns">
              <Link href={contactHref} className="btn gold">
                {t(AI_VOICE_TEST_CONTENT.cta)}
              </Link>
            </div>
          </div>
          <div className="vt-phone-mockup">
            <div className="vt-phone-score">
              <div className="vt-phone-score-num">82</div>
              <div className="vt-phone-score-label">{isAr ? "ممتاز" : "Excellent"}</div>
            </div>
            <div className="vt-phone-bars">
              {[14, 26, 18, 34, 22, 30, 16, 24, 12, 28].map((h, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <span key={i} style={{ height: `${h}px` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VOICE ASSESSMENT — light section, text | media */}
      <section className="vt-section-light">
        <div className="container vt-split">
          <div>
            <div className="vt-badge">◈ {t(VOICE_ASSESSMENT_CONTENT.badge)}</div>
            <h2 className="vt-h2">{t(VOICE_ASSESSMENT_CONTENT.heading)}</h2>
            <p className="vt-lead">{t(VOICE_ASSESSMENT_CONTENT.lead)}</p>
            <div className="vt-panel-features" style={{ justifyContent: "flex-start" }}>
              {VOICE_ASSESSMENT_CONTENT.items.map((item) => (
                <div className="vt-panel-feat" key={t(item)}>
                  {t(item)}
                </div>
              ))}
            </div>
            <div className="vt-btns">
              <Link href={contactHref} className="btn gold">
                {t(VOICE_ASSESSMENT_CONTENT.cta)}
              </Link>
            </div>
          </div>
          <MediaPlaceholder content={VOICE_ASSESSMENT_CONTENT.media} locale={params.locale} />
        </div>
      </section>

      {/* BEGIN YOUR JOURNEY */}
      <section className="vt-final">
        <div className="container vt-centered">
          <h2 className="vt-h2">{t(FINAL_CTA_CONTENT.heading)}</h2>
          <p className="vt-lead" style={{ marginInline: "auto", textAlign: "center" }}>
            {t(FINAL_CTA_CONTENT.lead)}
          </p>
          <div className="vt-btns justify-center" style={{ marginTop: "30px" }}>
            <Link href={contactHref} className="btn gold">
              {t(FINAL_CTA_CONTENT.cta)}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
