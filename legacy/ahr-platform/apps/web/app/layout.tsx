import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AHR Platform",
  description: "AHR Platform — Milestone 3: Identity & Access.",
};

/**
 * Next.js requires exactly one root layout containing <html>/<body> — it
 * cannot be repeated by app/[locale]/layout.tsx, which sits below it in the
 * tree and therefore cannot receive the {locale} param at this level.
 *
 * Default lang/dir here matches platform_settings.default_language ('ar'
 * seed value, Milestone 2). app/[locale]/layout.tsx (nested) is responsible
 * for syncing the actual per-request locale onto the document via
 * LocaleDirSync — a documented, deliberate simplification for this
 * milestone rather than a deeper i18n-routing library integration, which is
 * out of scope for Identity & Access.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
