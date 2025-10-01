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
        hostname: "*.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.github.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.nlark.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(withMDX(config));
