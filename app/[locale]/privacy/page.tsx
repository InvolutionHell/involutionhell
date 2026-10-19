import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { routing } from "@/i18n/routing";

const CONTACT_EMAIL = "longsizhuo@gmail.com";
const LAST_UPDATED = "2026-10-19";

type Section = { heading: string; items: string[] };

const CONTENT: Record<
  "zh" | "en",
  { title: string; intro: string; updated: string; sections: Section[] }
> = {
  zh: {
    title: "隐私政策",
    intro:
      "本政策说明 Involution Hell（involutionhell.com，以下简称「本站」）收集哪些信息、如何使用，以及你可以如何管理这些信息。",
    updated: "最后更新",
    sections: [
      {
        heading: "我们收集的信息",
        items: [
          "账号信息：通过 GitHub、Discord 或 Google 登录时，我们从对应平台获取你的平台用户 ID、用户名或显示名、邮箱地址和头像链接，用于创建和识别你的账号。我们不会获取你在这些平台上的密码。",
          "你主动提交的内容：例如文档贡献、分享链接、关注关系和个人偏好设置。",
          "使用数据：本站使用 Google Analytics、自部署的 Umami 统计和站内事件埋点了解页面访问情况；登录状态下的站内埋点会关联到你的账号。",
          "错误日志：本站使用 Sentry 收集前端和服务端的错误信息，用于排查故障。",
        ],
      },
      {
        heading: "信息的用途",
        items: [
          "提供登录、账号绑定、个人主页、贡献统计等站内功能。",
          "向你的邮箱发送账号验证等必要通知。",
          "分析访问情况并改进站点，排查和修复故障。",
          "我们不会出售你的个人信息，也不会把通过 Google 登录获得的信息用于广告。",
        ],
      },
      {
        heading: "第三方服务",
        items: [
          "登录：GitHub、Discord、Google。",
          "托管与基础设施：Vercel 及本站自有服务器。",
          "统计与监控：Google Analytics、Umami、Sentry。",
          "AI 问答：使用站内 AI 问答时，你输入的问题会发送给所选的模型服务商（如 DeepSeek、智谱 GLM、OpenAI、Google Gemini）以生成回答。",
        ],
      },
      {
        heading: "Cookie 与本地存储",
        items: [
          "登录后，本站会在浏览器本地存储和 involutionhell.com 域名的 Cookie 中保存登录凭证，用于保持登录状态。",
          "统计服务可能会设置自己的 Cookie。你可以在浏览器设置中清除或屏蔽它们，清除后需要重新登录。",
        ],
      },
      {
        heading: "你的权利",
        items: [
          "你可以在设置页解绑已连接的登录方式。",
          `如需查看、更正或删除你的账号数据，请发送邮件至 ${CONTACT_EMAIL}，我们会在核实身份后处理。`,
        ],
      },
      {
        heading: "政策更新",
        items: ["本政策内容变化时会更新本页面并修改上方的更新日期。"],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    intro:
      'This policy explains what information Involution Hell (involutionhell.com, "the site") collects, how it is used, and how you can manage it.',
    updated: "Last updated",
    sections: [
      {
        heading: "Information we collect",
        items: [
          "Account information: when you sign in with GitHub, Discord or Google, we receive your user ID on that platform, username or display name, email address and avatar URL, and use them to create and identify your account. We never receive your password for those platforms.",
          "Content you submit, such as documentation contributions, shared links, follows and preference settings.",
          "Usage data: the site uses Google Analytics, a self-hosted Umami instance and first-party event tracking to understand page visits. First-party events are linked to your account while you are signed in.",
          "Error logs: the site uses Sentry to collect client and server errors for debugging.",
        ],
      },
      {
        heading: "How we use information",
        items: [
          "To provide sign-in, account linking, profile pages, contribution stats and other site features.",
          "To send necessary notices such as account verification emails.",
          "To understand site usage, improve the site, and find and fix errors.",
          "We do not sell your personal information, and we do not use information obtained through Google Sign-In for advertising.",
        ],
      },
      {
        heading: "Third-party services",
        items: [
          "Sign-in: GitHub, Discord, Google.",
          "Hosting and infrastructure: Vercel and the site's own servers.",
          "Analytics and monitoring: Google Analytics, Umami, Sentry.",
          "AI Q&A: when you use the on-site AI assistant, your question is sent to the selected model provider (such as DeepSeek, Zhipu GLM, OpenAI or Google Gemini) to generate an answer.",
        ],
      },
      {
        heading: "Cookies and local storage",
        items: [
          "After you sign in, the site stores a session token in your browser's local storage and in a cookie on the involutionhell.com domain to keep you signed in.",
          "Analytics services may set their own cookies. You can clear or block them in your browser settings; you will need to sign in again afterwards.",
        ],
      },
      {
        heading: "Your rights",
        items: [
          "You can unlink connected sign-in methods on the settings page.",
          `To access, correct or delete your account data, email ${CONTACT_EMAIL}. We will process the request after verifying your identity.`,
        ],
      },
      {
        heading: "Changes to this policy",
        items: [
          "When this policy changes, we will update this page and the date above.",
        ],
      },
    ],
  },
};

export const metadata: Metadata = {
  title: "隐私政策 / Privacy Policy · Involution Hell",
  description:
    "Involution Hell 隐私政策：收集的信息、用途、第三方服务与你的权利。Privacy policy of Involution Hell.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = CONTENT[locale];

  return (
    <>
      <Header />
      <main className="pt-32 pb-16 bg-[var(--background)] min-h-screen">
        <article className="max-w-3xl mx-auto px-6 lg:px-8">
          <header className="border-t-4 border-[var(--foreground)] pt-6 mb-10">
            <h1 className="font-serif text-4xl md:text-5xl font-black uppercase tracking-tight text-[var(--foreground)]">
              {t.title}
            </h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-neutral-500">
              {t.updated}: {LAST_UPDATED}
            </p>
            <p className="mt-6 text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {t.intro}
            </p>
          </header>

          {t.sections.map((section) => (
            <section key={section.heading} className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-[var(--foreground)] mb-4">
                {section.heading}
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </article>
      </main>
      <Footer />
    </>
  );
}
