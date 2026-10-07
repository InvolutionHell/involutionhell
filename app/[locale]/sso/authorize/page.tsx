import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SsoAuthorize } from "./SsoAuthorize";

export const metadata: Metadata = {
  title: "Authorize",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ locale: string }>;
}

// 内容取决于 query 和登录态，全在客户端；页面壳照常 SSG
export default async function SsoAuthorizePage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("sso");
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8 text-center">
        <h1 className="text-3xl font-bold">{t("heading")}</h1>
        <Suspense fallback={null}>
          <SsoAuthorize />
        </Suspense>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
