import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { VerifyEmailForm } from "./VerifyEmailForm";

export const metadata: Metadata = {
  title: "Verify Email",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ locale: string }>;
}

// 注册会话只在 httpOnly cookie 里，内容全靠客户端拉取；页面壳照常 SSG
export default async function VerifyEmailPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("verifyEmail");
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <h1 className="text-3xl font-bold text-center">{t("title")}</h1>
        <VerifyEmailForm />
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
