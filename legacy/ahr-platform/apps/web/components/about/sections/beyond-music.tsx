import Link from "next/link";
import { Compass, Landmark, Mic, Users } from "lucide-react";
import { SECTION_META, BEYOND_MUSIC_CONTENT as C } from "../about-content";
import { Reveal } from "../reveal";

const ICONS = [Mic, Users, Compass, Landmark] as const;

/** Section 06 — Beyond The Music. Four minimal premium cards. */
export function BeyondMusic({ locale }: { locale: "ar" | "en" }) {
  return (
    <section id={SECTION_META.beyondMusic.id} className="cine-section">
      <div className="cine-shell max-w-6xl">
        <Reveal className="cine-center max-w-2xl text-center">
          <h2 className="about-heading text-3xl text-white md:text-4xl">{C.heading[locale]}</h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {C.cards.map((card, index) => {
            const Icon = ICONS[index] ?? Mic;
            return (
              <Reveal key={card.title.en} delay={index * 0.08}>
                <div className="group h-full border border-white/10 p-8 transition hover:border-[var(--about-gold)]/50">
                  <Icon className="h-6 w-6 text-white/40 transition group-hover:text-[var(--about-gold)]" strokeWidth={1.25} />
                  <h3 className="about-heading mt-6 text-xl text-white">{card.title[locale]}</h3>
                  <p className="mt-3 text-sm text-white/60">{card.description[locale]}</p>
                  <Link href={`/${locale}/contact`} className="btn mt-6 inline-block">
                    {C.discoverCta[locale]}
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
