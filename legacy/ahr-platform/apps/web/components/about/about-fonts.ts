import { Fraunces, Inter, IBM_Plex_Sans_Arabic } from "next/font/google";

/**
 * About page uses its own editorial type system (Canela-style serif +
 * Inter + IBM Plex Sans Arabic), distinct from the rest of the public
 * site's ratified Playfair Display/Readex Pro pair (globals.css, Decision
 * Log B10/C1) — scoped to `.about-theme` only, see about-theme.css.
 * Canela itself is a commercial P22 typeface with no file in this repo;
 * Fraunces is used as a free, license-compatible display-serif stand-in
 * until a licensed Canela file is provided (then swap only this import).
 */
export const aboutDisplayFont = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-about-display-en",
  display: "swap",
});

export const aboutBodyFont = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-about-body-en",
  display: "swap",
});

export const aboutArabicFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-about-arabic",
  display: "swap",
});
