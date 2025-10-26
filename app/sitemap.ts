// app/sitemap.ts

/**
 * @file app/sitemap.ts
 * @description
 * 动态站点地图 (Sitemap) 生成器。
 * * Next.js 会在构建时或运行时（如果设为动态）访问这个文件来生成 sitemap.xml。
 * 这个文件负责：
 * 1. 从 `source` (如 Contentlayer) 获取所有文档页面。
 * 2. 为首页（"/"）创建一个入口。
 * 3. 为所有非草稿 (draft) 或非隐藏 (hidden) 的文档页面创建入口。
 * 4. 从每个页面的 frontmatter 中提取最合适的“最后修改日期”。
 * 5. 合并所有入口，去重并排序，然后返回符合 Next.js 要求的格式。
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/sitemap
 */

import type { MetadataRoute } from "next";
// 移除 'node:fs/promises' 和 'node:path'，因为在 Serverless 环境中访问文件系统不可靠且性能低下。
// 我们完全依赖 source (Contentlayer) 在构建时已经解析好的数据。
import { source } from "@/lib/source";

/**
 * 从环境变量中读取的站点根 URL。
 * 默认为一个回退地址。
 */
const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://involutionhell.vercel.app";

/**
 * 经过规范化处理的站点 URL（确保有协议头，且不带尾部斜杠）。
 * 例如: "https://example.com"
 */
const SITE_URL = normalizeSiteUrl(RAW_SITE_URL);

/** * 定义 `source.getPages()` 返回的单个页面对象的类型别名
 */
type SourcePage = ReturnType<typeof source.getPages>[number];

/** * 定义可以被解析为日期的宽松类型
 */
type DateLike = string | number | Date | undefined | null;

/**
 * Next.js 会调用的默认导出函数，用于生成整个站点的 Sitemap。
 * * @returns {MetadataRoute.Sitemap} 一个包含所有站点地图条目的数组。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = source.getPages();

  // 1. 生成所有文档页面的 sitemap 条目
  const docsEntries = pages
    .filter((p) => !isDraftOrHidden(p)) // 过滤掉草稿和隐藏页面
    .map(buildDocsEntry); // 将页面数据转换为 sitemap 条目

  // 2. (优化) 寻找所有文档中最新的修改日期
  //    我们用这个日期作为首页的 lastModified 日期，
  //    这比总是使用 new Date() 对 SEO 更友好。
  const latestDocDate = docsEntries.reduce(
    (latest, entry) => {
      if (entry.lastModified) {
        // 确保 entry.lastModified 是 Date 对象实例
        const entryDate = new Date(entry.lastModified);
        // 如果 'latest' 还未设置，或者当前条目日期晚于 'latest'，则更新 'latest'
        if (!latest || entryDate > latest) {
          return entryDate;
        }
      }
      return latest; // 否则保持 'latest' 不变
    },
    null as Date | null,
  ); // 初始值为 null

  // 3. 为首页创建 sitemap 条目
  const homeEntry: MetadataRoute.Sitemap[number] = {
    url: SITE_URL, // 站点的根 URL
    // 使用最新文档日期；如果一篇文档都没有，则回退到当前日期
    lastModified: latestDocDate ?? new Date(),
    changeFrequency: "weekly", // 首页可能每周都有变化
    priority: 1, // 首页是最高优先级
  };

  // 4. 合并与处理
  // 使用 Map 来确保 URL 的唯一性，防止意外的重复
  const unique = new Map(docsEntries.map((e) => [e.url, e]));

  // 返回合并后的数组：首页 + (去重后的文档页)
  return [
    homeEntry,
    ...[...unique.values()].sort((a, b) => a.url.localeCompare(b.url)), // 按 URL 字母顺序排序
  ];
}

/**
 * 将单个文档页面对象 (SourcePage) 转换为 Sitemap 条目。
 * 这是一个同步函数，因为它只依赖已加载的 `page` 数据。
 * * @param {SourcePage} page - 从 `source.getPages()` 获取的单个页面对象。
 * @returns {MetadataRoute.Sitemap[number]} 一个 Sitemap 条目对象。
 */
function buildDocsEntry(page: SourcePage): MetadataRoute.Sitemap[number] {
  // 将页面的 slugs 数组转换为 URL 路径，例如 ['getting-started', 'intro'] -> 'getting-started/intro'
  const slugPath = sanitizeSlugPath(page.slugs);

  // 构建完整的 URL。
  // 如果 slugPath 为空 (例如 /docs/index.mdx)，则 URL 为 .../docs
  // 否则为 .../docs/slug/path
  const url = slugPath ? `${SITE_URL}/docs/${slugPath}` : `${SITE_URL}/docs`;

  // 仅从页面的 frontmatter (data) 中提取日期
  const fmDate = extractDateFromPage(page);

  // 构建条目
  const entry: MetadataRoute.Sitemap[number] = {
    url,
    changeFrequency: "monthly", // 假设文档内容每月或更少频率更新
    priority: 0.6, // 文档页的优先级低于首页

    // (优化) 仅当 fmDate (frontmatter 日期) 存在时，才添加 lastModified 字段。
    // 如果为 undefined，则省略该字段。
    ...(fmDate ? { lastModified: fmDate } : {}),
  };

  return entry;
}

/**
 * 从页面的 data/frontmatter 中按优先级提取最合适的日期。
 * * 优先级顺序（从高到低）：
 * 1. updated / updatedAt / lastUpdated (反映最后修改时间)
 * 2. date (反映创建时间)
 * * @param {SourcePage} page - 页面对象。
 * @returns {Date | undefined} 解析后的 Date 对象，如果找不到或无效则返回 undefined。
 */
function extractDateFromPage(page: SourcePage): Date | undefined {
  // page.data 包含了 frontmatter 以及其他由 source 注入的数据
  const data = page.data as {
    date?: DateLike;
    updated?: DateLike;
    updatedAt?: DateLike;
    lastUpdated?: DateLike;
    draft?: boolean;
    hidden?: boolean;
    // 有时 frontmatter 会被嵌套在 'frontmatter' 键下
    frontmatter?: {
      date?: DateLike;
      updated?: DateLike;
      updatedAt?: DateLike;
      lastUpdated?: DateLike;
      draft?: boolean;
      hidden?: boolean;
    };
  };

  // 按期望的优先级列出所有可能的日期字段
  const candidates: DateLike[] = [
    data?.updatedAt,
    data?.updated,
    data?.lastUpdated,
    data?.frontmatter?.updatedAt,
    data?.frontmatter?.updated,
    data?.frontmatter?.lastUpdated,
    // 最后才检查 'date'
    data?.date,
    data?.frontmatter?.date,
  ];

  // 遍历候选项，返回第一个有效的日期
  for (const c of candidates) {
    const parsed = normalizeDate(c);
    if (parsed) return parsed; // 找到即返回
  }

  // 遍历结束仍未找到
  return undefined;
}

/**
 * 将一个不确定类型的值（DateLike）转换为标准的 Date 对象。
 * * @param {DateLike} value - 可能是 Date, string, number, null 或 undefined。
 * @returns {Date | undefined} 如果值为有效日期，则返回 Date 对象；否则返回 undefined。
 */
function normalizeDate(value: DateLike): Date | undefined {
  if (!value) return undefined; // 处理 null, undefined, "", 0

  // 如果已经是 Date 对象
  if (value instanceof Date) {
    // 检查是否为无效日期 (例如 new Date('invalid-string'))
    return isNaN(value.getTime()) ? undefined : value;
  }

  // 尝试将 string 或 number 转换为 Date
  const d = new Date(value);

  // 再次检查转换结果是否有效
  return isNaN(d.getTime()) ? undefined : d;
}

/**
 * 将 slugs 数组清理并转换为 URL 路径字符串。
 * * @param {string[]} slugs - 来源于 page.slugs 的数组。
 * @returns {string} 组合后的路径，例如 "segment1/segment2"。
 */
function sanitizeSlugPath(slugs: string[]): string {
  // 1. 过滤掉数组中可能存在的空字符串 (例如 /docs/index.mdx 对应的 slugs 可能是 [])
  // 2. 对每个 slug 段进行 URL 编码，以防包含特殊字符
  // 3. 用 '/' 将它们连接起来
  return slugs
    .filter(Boolean) // 过滤掉 "" 或 undefined
    .map((s) => encodeURIComponent(s)) // 编码特殊字符
    .join("/");
}

/**
 * 检查页面是否被标记为草稿 (draft) 或隐藏 (hidden)。
 * * @param {SourcePage} page - 页面对象。
 * @returns {boolean} 如果是草稿或隐藏，返回 true。
 */
function isDraftOrHidden(page: SourcePage): boolean {
  // 使用 'any' 类型来简化对嵌套属性的访问
  const d: any = page.data ?? {};

  // 检查顶层或 'frontmatter' 嵌套下的 'draft' 或 'hidden' 标志
  return !!(
    // !! 确保最终结果是 boolean
    (d.draft || d.hidden || d.frontmatter?.draft || d.frontmatter?.hidden)
  );
}

/**
 * 规范化站点的 URL。
 * * @param {string} url - 原始 URL 字符串。
 * @returns {string} 规范化后的 URL。
 */
function normalizeSiteUrl(url: string): string {
  // 1. 确保 URL 总是以 http:// 或 https:// 开头
  //    (这里为了安全，默认补全为 https://)
  const withProto = /^https?:\/\//i.test(url) ? url : `https://${url}`;

  // 2. 移除 URL 末尾的所有斜杠
  return withProto.replace(/\/+$/, "");
}
