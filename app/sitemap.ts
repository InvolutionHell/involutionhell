// app/sitemap.ts
import type { MetadataRoute } from "next";
import fs from "node:fs/promises";
import path from "node:path";
import { source } from "@/lib/source";

const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://involutionhell.vercel.app";
const SITE_URL = normalizeSiteUrl(RAW_SITE_URL);
const DOCS_DIR = path.join(process.cwd(), "app/docs");

type SourcePage = ReturnType<typeof source.getPages>[number];
type DateLike = string | number | Date | undefined | null;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = source.getPages();

  const docsEntries = await Promise.all(
    pages.filter((p) => !isDraftOrHidden(p)).map((p) => buildDocsEntry(p)),
  );

  const homeEntry: MetadataRoute.Sitemap[number] = {
    url: SITE_URL, // 已去尾斜杠，这里就是 https://xxx
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  };

  // 去重并排序（避免重复 slug）
  const unique = new Map(docsEntries.map((e) => [e.url, e]));
  return [
    homeEntry,
    ...[...unique.values()].sort((a, b) => a.url.localeCompare(b.url)),
  ];
}

async function buildDocsEntry(
  page: SourcePage,
): Promise<MetadataRoute.Sitemap[number]> {
  const slugPath = sanitizeSlugPath(page.slugs);
  // 根文档：/docs 或 /docs/<segments>
  const url = slugPath ? `${SITE_URL}/docs/${slugPath}` : `${SITE_URL}/docs`;

  const fmDate = extractDateFromPage(page);
  const filePath = path.resolve(DOCS_DIR, page.file.path);
  const fileDate = await getFileLastModified(filePath);

  const entry: MetadataRoute.Sitemap[number] = {
    url,
    changeFrequency: "monthly",
    priority: 0.6,
    ...(fmDate
      ? { lastModified: fmDate }
      : fileDate
        ? { lastModified: fileDate }
        : {}),
  };

  return entry;
}

function extractDateFromPage(page: SourcePage): Date | undefined {
  const data = page.data as {
    date?: DateLike;
    updated?: DateLike;
    updatedAt?: DateLike;
    lastUpdated?: DateLike;
    draft?: boolean;
    hidden?: boolean;
    frontmatter?: {
      date?: DateLike;
      updated?: DateLike;
      updatedAt?: DateLike;
      lastUpdated?: DateLike;
      draft?: boolean;
      hidden?: boolean;
    };
  };

  const candidates: DateLike[] = [
    data?.updatedAt,
    data?.updated,
    data?.lastUpdated,
    data?.date,
    data?.frontmatter?.updatedAt,
    data?.frontmatter?.updated,
    data?.frontmatter?.lastUpdated,
    data?.frontmatter?.date,
  ];

  for (const c of candidates) {
    const parsed = normalizeDate(c);
    if (parsed) return parsed;
  }
  return undefined;
}

function normalizeDate(value: DateLike): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return isNaN(value.getTime()) ? undefined : value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

async function getFileLastModified(
  filePath: string,
): Promise<Date | undefined> {
  try {
    const stats = await fs.stat(filePath);
    return stats.mtime;
  } catch {
    return undefined;
  }
}

function sanitizeSlugPath(slugs: string[]): string {
  // 过滤空段并对每段进行 URL 编码
  return slugs
    .filter(Boolean)
    .map((s) => encodeURIComponent(s))
    .join("/");
}

type VisibilityFlags = {
  draft?: boolean;
  hidden?: boolean;
  frontmatter?: {
    draft?: boolean;
    hidden?: boolean;
  };
};

function isDraftOrHidden(page: SourcePage): boolean {
  const data = (page.data ?? {}) as VisibilityFlags;
  return Boolean(
    data.draft ||
      data.hidden ||
      data.frontmatter?.draft ||
      data.frontmatter?.hidden,
  );
}

function normalizeSiteUrl(url: string): string {
  // 必须有协议，去尾斜杠
  const withProto = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  return withProto.replace(/\/+$/, "");
}
