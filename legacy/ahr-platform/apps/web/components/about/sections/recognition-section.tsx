import { SECTION_META, RECOGNITION_CONTENT as C } from "../about-content";
import { Reveal } from "../reveal";

/** Section 07 — Recognition. Luxury grid, cards only, no paragraphs. */
export function RecognitionSection({ locale }: { locale: "ar" | "en" }) {
  return (
    <section id={SECTION_META.recognition.id} className="cine-section">
      <div className="cine-shell max-w-6xl">
        <Reveal className="cine-center max-w-2xl text-center">
          <h2 className="about-heading text-3xl text-white md:text-4xl">{C.heading[locale]}</h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
          {C.cards.map((card, index) => (
            <Reveal key={card.en} delay={index * 0.05}>
              <div className="flex h-32 flex-col items-center justify-center gap-3 border border-white/10 px-4 text-center transition hover:border-[var(--about-gold)]/50">
                <span className="h-px w-8 bg-[var(--about-gold)]/60" aria-hidden />
                <p className="about-heading text-sm text-white/80">{card[locale]}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
