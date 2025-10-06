#!/usr/bin/env node
/**
 * @description 通过 GitHub commits API 拉取 app/docs 目录下每个文档的贡献者
 * 并将汇总结果写入 JSON 文件，以供人工审核
 * 然后再同步到数据库。
 *
 * 环境变量/CLI 覆盖：
 * - GITHUB_TOKEN：可选，设置后会增加速率限制
 * - GITHUB_OWNER / GITHUB_REPO：覆盖默认仓库 (InvolutionHell/involutionhell.github.io)
 * - DOCS_DIR：相对于仓库的文档根目录（默认值：app/docs）
 * - OUTPUT：相对于仓库的输出 JSON 路径（默认值：tmp/doc-contributors.json）
 * - --output=path / --owner=name / --repo=name / --docs=dir：与环境变量覆盖相同
 *
 * 用法：
 * pnpm exec node scripts/backfill-contributors.mjs
 * @author Siz Long
 * @date 2025-09-27
 * @location scripts/backfill-contributors.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/index.js";

import fg from "fast-glob";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

// 解析形如 --key=value 的命令行参数，并归一化为小写 key
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((arg) => arg.startsWith("--"))
    .map((arg) => {
      const [rawKey, rawValue] = arg.replace(/^--/, "").split("=");
      const key = rawKey.trim().toLowerCase();
      const value = rawValue === undefined ? "true" : rawValue.trim();
      return [key, value];
    }),
);

// 基础配置：仓库路径、文档目录、输出文件以及单页 commit 数量
const OWNER = args.owner || process.env.GITHUB_OWNER || "InvolutionHell";
const REPO = args.repo || process.env.GITHUB_REPO || "involutionhell.github.io";
const DOCS_DIR = args.docs || process.env.DOCS_DIR || "app/docs";
const OUTPUT = args.output || process.env.OUTPUT || "tmp/doc-contributors.json";
const PER_PAGE = Math.min(
  Math.max(Number(process.env.GITHUB_PER_PAGE) || 100, 1),
  100,
);
const TOKEN = process.env.GITHUB_TOKEN || "";

// 预先计算绝对路径与请求头，方便后续调用
const docsDirAbs = path.resolve(REPO_ROOT, DOCS_DIR);
const outputAbs = path.resolve(REPO_ROOT, OUTPUT);
console.log("TOKEN", TOKEN);
const headers = {
  "User-Agent": "involutionhell-contrib-backfill-script",
  Accept: "application/vnd.github+json",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

// 统一日志输出前缀，方便定位脚本执行信息
function log(...args) {
  console.log("[backfill-contributors]", ...args);
}

async function ensureParentDir(filePath) {
  // 保证输出文件所在目录存在，避免写入失败
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function listDocFiles() {
  // 使用 glob 匹配 docs 目录下的所有 Markdown/MDX 文件
  const patterns = ["**/*.{md,mdx,markdown}"];
  const files = await fg(patterns, {
    cwd: docsDirAbs,
    onlyFiles: true,
    dot: false,
  });
  return files
    .map((relative) => ({
      relative,
      absolute: path.join(docsDirAbs, relative),
    }))
    .sort((a, b) => a.relative.localeCompare(b.relative));
}

function parseDocFrontmatter(content) {
  // 解析 frontmatter，提取 docId 与标题等关键信息
  const parsed = matter(content);
  const data = parsed.data || {};
  const docId = typeof data.docId === "string" ? data.docId.trim() : "";
  const title = typeof data.title === "string" ? data.title.trim() : "";
  return {
    docId: docId || null,
    title: title || null,
    frontmatter: data,
  };
}

// 合并统计数据
function mergeStatsInPlace(base, extra) {
  for (const [k, v] of Object.entries(extra || {})) {
    base[k] = (base[k] ?? 0) + (typeof v === "number" ? v : 0);
  }
  return base;
}

async function fetchCommitsForFile(repoRelativePath) {
  // 循环分页请求 GitHub commits API，直到没有下一页
  const commits = [];
  let page = 1;

  while (true) {
    const url = new URL(
      `https://api.github.com/repos/${OWNER}/${REPO}/commits`,
    );
    url.searchParams.set("path", repoRelativePath);
    url.searchParams.set("per_page", String(PER_PAGE));
    url.searchParams.set("page", String(page));

    const res = await fetch(url, {
      headers,
    });

    if (res.status === 403) {
      // 命中速率限制时抛出详细报错，便于提示等待时间
      const reset = res.headers.get("x-ratelimit-reset");
      const resetDate = reset
        ? new Date(Number(reset) * 1000).toISOString()
        : "unknown";
      throw new Error(
        `GitHub API rate limit reached (path: ${repoRelativePath}). Resets at ${resetDate}.`,
      );
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Failed to fetch commits for ${repoRelativePath}: ${res.status} ${res.statusText} -> ${text}`,
      );
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      break;
    }

    commits.push(...data);

    const link = res.headers.get("link") || "";
    const hasNext = link.split(",").some((part) => part.includes('rel="next"'));
    if (!hasNext) {
      break;
    }
    page += 1;
  }

  return commits;
}

function aggregateContributors(commits) {
  // 汇总贡献者信息并按贡献次数排序，同时记录匿名提交数量
  const contributors = new Map();
  let skipped = 0;

  for (const commit of commits) {
    const author = commit?.author;
    if (!author || typeof author.id !== "number") {
      skipped += 1;
      continue;
    }

    const commitMeta = commit?.commit || {};
    const rawDate = commitMeta?.author?.date || commitMeta?.committer?.date;
    const commitDate = rawDate ? new Date(rawDate) : null;

    if (!contributors.has(author.id)) {
      contributors.set(author.id, {
        githubId: author.id,
        login: author.login || null,
        avatarUrl: author.avatar_url || null,
        htmlUrl: author.html_url || null,
        contributions: 1,
        lastContributedAt: commitDate ? commitDate.toISOString() : null,
      });
      continue;
    }

    const existing = contributors.get(author.id);
    existing.contributions += 1;
    if (commitDate) {
      // 仅在发现更晚的提交时间时更新 lastContributedAt
      const previous = existing.lastContributedAt
        ? new Date(existing.lastContributedAt)
        : null;
      if (!previous || commitDate > previous) {
        existing.lastContributedAt = commitDate.toISOString();
      }
    }
  }

  const sorted = Array.from(contributors.values()).sort((a, b) => {
    if (b.contributions !== a.contributions) {
      return b.contributions - a.contributions;
    }
    const dateA = a.lastContributedAt ? Date.parse(a.lastContributedAt) : 0;
    const dateB = b.lastContributedAt ? Date.parse(b.lastContributedAt) : 0;
    return dateB - dateA;
  });

  return { contributors: sorted, skipped };
}

async function main() {
  // Step 1: 扫描文档列表，若为空直接终止
  log(`Scanning docs from ${path.relative(REPO_ROOT, docsDirAbs)}`);
  const docFiles = await listDocFiles();
  if (docFiles.length === 0) {
    log("No doc files found. Abort.");
    return;
  }

  const results = [];

  for (let index = 0; index < docFiles.length; index += 1) {
    const file = docFiles[index];
    const displayIndex = index + 1;
    // 将绝对路径转换为仓库相对路径，同时统一为 POSIX 风格
    const repoRelative = path
      .relative(REPO_ROOT, file.absolute)
      .replace(/\\/g, "/");

    log(
      `(${displayIndex}/${docFiles.length}) Fetching commits for ${repoRelative}`,
    );

    const raw = await fs.readFile(file.absolute, "utf8");
    const meta = parseDocFrontmatter(raw);

    let commits = [];
    try {
      commits = await fetchCommitsForFile(repoRelative);
    } catch (err) {
      // 失败时记录错误信息，后续手动排查
      log(`  ✖ Failed to pull commits: ${err.message}`);
      results.push({
        docId: meta.docId,
        title: meta.title,
        filePath: repoRelative,
        error: err.message,
      });
      continue;
    }

    const { contributors, skipped } = aggregateContributors(commits);
    const stats = Object.fromEntries(
      contributors.map((item) => [String(item.githubId), item.contributions]),
    );

    const commitTimestamps = commits
      .map(
        (commit) =>
          commit?.commit?.author?.date || commit?.commit?.committer?.date,
      )
      .filter(Boolean)
      .map((value) => Date.parse(value))
      .filter(Number.isFinite)
      .sort((a, b) => b - a);

    results.push({
      docId: meta.docId,
      title: meta.title,
      filePath: repoRelative,
      totalCommits: commits.length,
      skippedCommits: skipped,
      contributors,
      contributorStats: stats,
      lastCommitAt:
        commitTimestamps.length > 0
          ? new Date(commitTimestamps[0]).toISOString()
          : null,
    });
  }

  // Step 2: 写入 JSON 文件（包含基础元数据与逐文档统计）
  await ensureParentDir(outputAbs);
  await fs.writeFile(
    outputAbs,
    JSON.stringify(
      {
        repo: `${OWNER}/${REPO}`,
        generatedAt: new Date().toISOString(),
        docsDir: path.relative(REPO_ROOT, docsDirAbs),
        totalDocs: results.length,
        results,
      },
      null,
      2,
    ),
  );

  log(
    `Done. Wrote ${results.length} doc entries to ${path.relative(REPO_ROOT, outputAbs)}`,
  );

  // —— 追加开始：按 docId 聚合，并可选同步到数据库 ——
  // 先把同一 docId 的多个 filePath 合并（因为移动/重命名会导致同一 doc 分散在不同路径）
  const byDocId = new Map(); // Map<string, Record<string, number>>
  for (const r of results) {
    if (!r.docId) continue; // 没有 docId 的跳过（避免用 filePath 当主键）
    const acc = byDocId.get(r.docId) ?? {};
    mergeStatsInPlace(acc, r.contributorStats || {});
    byDocId.set(r.docId, acc);
  }

  // 同步到数据库（幂等）：旧值 + 新汇总 逐项累加，然后整体覆盖写回
  const prisma = new PrismaClient();
  try {
    let updated = 0,
      created = 0;

    for (const [docId, aggregatedStats] of byDocId) {
      // 读旧值（如果不存在就 create）
      const existing = await prisma.docs.findUnique({
        where: { id: docId },
        select: { id: true, contributor_stats: true },
      });

      const merged = mergeStatsInPlace(
        { ...(existing?.contributor_stats ?? {}) },
        aggregatedStats,
      );

      if (!existing) {
        await prisma.docs.create({
          data: {
            id: docId,
            contributor_stats: merged,
          },
        });
        created++;
      } else {
        await prisma.docs.update({
          where: { id: docId },
          data: { contributor_stats: merged },
        });
        updated++;
      }
    }

    log(`DB sync done. Created: ${created}, Updated: ${updated}`);
  } finally {
    await prisma.$disconnect();
  }
  // —— 追加结束 ——
}

// Step 3: 捕获未处理异常，避免脚本静默崩溃
main().catch((error) => {
  console.error("[backfill-contributors] Unexpected error", error);
  process.exit(1);
});
