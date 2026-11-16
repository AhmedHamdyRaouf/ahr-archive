import type { Locale, PublicSiteSettings } from "@ahr/site";

/**
 * Implements: UI/UX Specification, Design System (doc 02) §"Footer" —
 * secondary links, not a repeat of primary navigation. Contact/social
 * info comes from the public subset of `platform_settings` (Database
 * Architecture §8) — if unset, sections are simply omitted, never shown
 * with placeholder/fake data.
 *
 * Updated 2026-07-21: the "Sign In" link previously here moved to
 * SiteHeader at the data owner's request, to be clearly visible in the
 * main nav rather than a small discreet footer link.
 */
export function SiteFooter({ locale, settings }: { locale: Locale; settings: PublicSiteSettings }) {
  const hasContact = Object.keys(settings.contactInformation).length > 0;
  const hasSocial = Object.keys(settings.socialMediaLinks).length > 0;

  return (
    <footer className="border-t p-6 text-sm text-neutral">
      <div className="mx-auto max-w-5xl space-y-2">
        <p>
          © {new Date().getFullYear()} {locale === "ar" ? settings.siteNameAr : settings.siteNameEn}
        </p>
        {hasContact ? (
          <ul>
            {Object.entries(settings.contactInformation).map(([key, value]) => (
              <li key={key}>{String(value)}</li>
            ))}
          </ul>
        ) : null}
        {hasSocial ? (
          <ul className="flex gap-3">
            {Object.entries(settings.socialMediaLinks).map(([platform, url]) => (
              <li key={platform}>
                <a href={String(url)} rel="noopener noreferrer" target="_blank">
                  {platform}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <p className="mt-2 text-xs opacity-60">
        {locale === "ar"
          ? "صُنع بشغف من أجل الموسيقى والتعليم والأثر الثقافي."
          : "Crafted with passion for music, education and cultural impact."}
      </p>
      {/* WhatsApp float button — matches the live site's own `.whatsapp-float`
          (content/Master-Content-Dataset/12-Source-Files/Website-Archive/).
          Number comes from `contact_information.whatsapp` once set via
          Settings; falls back to the number already public on the live
          site so the button is never silently missing. */}
      <a
        href={`https://wa.me/${String(settings.contactInformation.whatsapp ?? "201114004738")}`}
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp
      </a>
    </footer>
  );
}
