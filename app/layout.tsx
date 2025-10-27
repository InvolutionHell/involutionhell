// app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import { RootProvider } from "fumadocs-ui/provider";
import Script from "next/script";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://involutionhell.com";
const en_description =
  "内卷地狱（Involution Hell）是一个由开发者发起的开源学习社区，专注算法、系统设计、工程实践与技术分享，帮助华人程序员高效成长，专注真实进步。Involution Hell is an open-source community empowering builders with real-world engineering.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Involution Hell",
  title: {
    default: "Involution Hell",
    template: "%s · Involution Hell",
  },
  description: `${en_description}`,
  keywords: [
    "Involution Hell",
    "内卷地狱",
    "open-source community",
    "algorithms",
    "system design",
    "software engineering",
    "coding interview",
    "LeetCode",
    "Codeforces",
    "Kaggle",
    "frontend",
    "backend",
    "DevOps",
    "TypeScript",
    "Go",
    "Python",
    "React",
    "Next.js",
  ],
  authors: [{ name: "Involution Hell Maintainers", url: SITE_URL }],
  creator: "longsizhuo",
  publisher: "Involution Hell",
  category: "Technology",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "standard",
      "max-snippet": 160,
      "max-video-preview": 0,
    },
  },
  formatDetection: {
    telephone: false,
    date: true,
    address: false,
    email: true,
    url: true,
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [{ url: "/logo/logoInLight.svg", type: "image/svg+xml" }],
    shortcut: "/logo/favicon-apple.png",
    apple: "/logo/favicon-apple.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Involution Hell",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Involution Hell",
    title: "Involution Hell",
    description: `${en_description}`,
    images: [
      {
        url: "/og/cover.png",
        width: 2560,
        height: 1440,
        alt: "Involution Hell — Open-source Community",
      },
    ],
    locale: "zh-CN",
    alternateLocale: ["en-US"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@longsizhuo",
    creator: "@longsizhuo",
    title: "Involution Hell",
    description: `${en_description}`,
    images: ["/og/cover.png"],
  },
  verification: {
    google: "Qg1UVFQ9IzpVU8Z071mdqUp8gx7RRD23VE0UYVeENHM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 预连接：缩短关键请求链 */}
        <link rel="preconnect" href="https://www.google-analytics.com" />
        {/* Preload the decorative sky texture so the LCP background image is discovered immediately */}
        <link
          rel="preload"
          href="/cloud_2.png"
          as="image"
          type="image/png"
          fetchPriority="high"
        />
        {/* 结构化数据：英文主名 + 中文 alternateName */}
        <script
          type="application/ld+json"
          // 注意：必须在运行时插入字符串
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Involution Hell",
              alternateName: ["内卷地狱"],
              url: SITE_URL,
              description: `${en_description}`,
              sameAs: [
                "https://github.com/InvolutionHell",
                "https://discord.gg/6CGP73ZWbD",
              ],
              logo: `${SITE_URL}/logo/logoInLight.svg`,
            }),
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 全局装饰背景（不参与可访问性） */}
        <div className="site-bg site-bg--sky" aria-hidden />
        <div className="site-bg site-bg--stars" aria-hidden />

        <RootProvider
          search={{
            // 使用静态索引，兼容 next export 与本地开发
            options: { type: "static", api: "/search.json" },
          }}
        >
          <ThemeProvider defaultTheme="system" storageKey="ih-theme">
            <main id="main-content" className="relative z-10">
              {children}
            </main>
          </ThemeProvider>
        </RootProvider>
        {/* 谷歌分析 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ED4GVN8YVW"
          strategy="lazyOnload"
        />
        <Script id="gtag-init" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ED4GVN8YVW');
          `}
        </Script>
        {/* 性能分析 */}
        <SpeedInsights />
      </body>
    </html>
  );
}
