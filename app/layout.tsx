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
  process.env.NEXT_PUBLIC_SITE_URL || "https://involutionhell.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Involution Hell",
  title: {
    default: "Involution Hell",
    template: "%s · Involution Hell",
  },
  description:
    "Involution Hell is a free, developer-led open-source community focused on algorithms, system design, and practical engineering to help builders grow together.",
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
    nocache: true, // 禁止缓存内容，用于抑制批量复制
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "standard",
      "max-snippet": 160,
      "max-video-preview": 0,
    },
    // 针对恶意爬虫匿名代理屏蔽
    // Extra headers 可以在 nginx/vercel edge middleware 里做进一步限制
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
    icon: [
      {
        url: "/logo/logoInLight.svg",
        type: "image/svg+xml",
      },
    ],
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
    description:
      "Involution Hell is a free, developer-led open-source community focused on algorithms, system design, and practical engineering to help builders grow together.",
    images: [
      {
        url: "/og/cover.png",
        width: 2560,
        height: 1440,
        alt: "Involution Hell — Open-source Community",
      },
    ],
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    site: "@longsizhuo",
    creator: "@longsizhuo",
    title: "Involution Hell",
    description:
      "A free, developer-led open-source community for algorithms, system design, and real-world engineering.",
    images: ["/og/cover.png"],
  },
  verification: {
    google: "Qg1UVFQ9IzpVU8Z071mdqUp8gx7RRD23VE0UYVeENHM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical third-party origins to shrink the critical request chain */}
        <link rel="preconnect" href="https://www.google-analytics.com" />
        {/* Preload the decorative sky texture so the LCP background image is discovered immediately */}
        <link
          rel="preload"
          href="/cloud_2.png"
          as="image"
          type="image/png"
          fetchPriority="high"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Global animated backgrounds (sky / stars) */}
        <div className="site-bg site-bg--sky" aria-hidden />
        <div className="site-bg site-bg--stars" aria-hidden />
        <RootProvider
          search={{
            // Use static index so it works in `next export` and dev.
            options: {
              type: "static",
              api: "/search.json",
            },
          }}
        >
          <ThemeProvider defaultTheme="system" storageKey="ih-theme">
            <div className="relative z-10">{children}</div>
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
