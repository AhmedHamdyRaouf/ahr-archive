import { SECTION_META, TWO_MUSICAL_WORLDS_CONTENT as C } from "../about-content";
import { Reveal } from "../reveal";

/** Section 04 — Two Musical Worlds. Typography-only breathing space between
 * the family narrative and the works gallery — no images, no color beyond
 * the theme's black/white/gold. */
export function TwoMusicalWorlds({ locale }: { locale: "ar" | "en" }) {
  return (
    <section id={SECTION_META.twoMusicalWorlds.id} className="cine-section is-roomy">
      <div className="about-staff-texture" />
      <div className="cine-shell relative max-w-2xl text-center">
        <Reveal>
          <h2 className="about-heading text-3xl text-white md:text-4xl">{C.heading[locale]}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 text-white/70">{C.paragraph[locale]}</p>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="about-quote mt-10 text-2xl md:text-3xl">{C.quote[locale]}</p>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="about-heading mt-14 text-5xl tracking-[0.35em] text-white/10 md:text-6xl">
            {C.monogram}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
