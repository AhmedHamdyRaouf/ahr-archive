/**
 * Implements: UI/UX Specification, Accessibility (doc 17) — keyboard
 * operability. A visually-hidden-until-focused link letting keyboard
 * users bypass the SiteHeader's navigation.
 */
export function SkipLink({ label = "Skip to content" }: { label?: string }) {
  return (
    <a
      href="#main-content"
      className="absolute left-2 top-2 z-50 -translate-y-16 rounded-md bg-primary px-3 py-2 text-white transition focus:translate-y-0"
    >
      {label}
    </a>
  );
}
