// next.config.mjs
import { createMDX } from "fumadocs-mdx/next";
import createNextIntlPlugin from "next-intl/plugin";

const withMDX = createMDX({
  configPath: "source.config.ts",
});

const withNextIntl = createNextIntlPlugin("./i18n.ts");

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev",
      },
      {
        protocol: "https",
        hostname: "ravencaffeine.github.io",
      },
    ],
  },
};

export default withNextIntl(withMDX(config));
