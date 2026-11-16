import { notFound } from "next/navigation";
import { LocaleDirSync } from "@/components/shared/locale-dir-sync";

const SUPPORTED_LOCALES = ["ar", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!SUPPORTED_LOCALES.includes(params.locale as Locale)) {
    notFound();
  }

  return (
    <>
      <LocaleDirSync locale={params.locale as Locale} />
      {children}
    </>
  );
}
