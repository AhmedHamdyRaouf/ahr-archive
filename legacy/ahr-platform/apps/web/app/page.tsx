import { redirect } from "next/navigation";

/**
 * Implements: bilingual routing decision (/ar, /en via App Router — Database
 * Architecture header, "Bilingual Strategy"). The bare "/" is not itself a
 * page; it redirects to the default locale.
 *
 * Updated 2026-07-21: default changed to English per the data owner's
 * request — no longer reads `platform_settings.default_language` ('ar')
 * for this redirect; that setting still controls other locale-dependent
 * defaults (e.g. new-session locale detection elsewhere), just not this
 * hardcoded root redirect anymore.
 */
export default function RootIndex() {
  redirect("/en");
}
