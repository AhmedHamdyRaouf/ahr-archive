"use client";

import { useEffect } from "react";

/**
 * Syncs the <html lang>/dir attributes (set to a static default in the
 * mandatory root layout, app/layout.tsx) to the actual per-request locale.
 * A documented, deliberate simplification for Milestone 3's scope — see
 * app/layout.tsx's comment for why this can't be done directly in a
 * server-rendered nested layout.
 */
export function LocaleDirSync({ locale }: { locale: "ar" | "en" }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return null;
}
