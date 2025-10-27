#!/usr/bin/env node
/**
 * 将 GitHub Discussions 标题统一重写为 docId，用于从 pathname->docId 的 Giscus 迁移。
 *
 * 两种输入来源：
 *  A) DB 模式（推荐）：读取 Postgres（docs/path_current + doc_paths）获得每个 docId 的所有历史路径
 *  B) 映射文件模式：传入 JSON 文件，手动提供 docId 与候选“旧 term”（通常是旧路径）
 *
 * 需要：
 *  - GH_TOKEN（或者 GITHUB_TOKEN）：具备 Discussions: read/write（fine-grained）或 repo 权限
 *  - GITHUB_OWNER, GITHUB_REPO
 *  - （可选）DATABASE_URL（启用 DB 模式）
 *
 * 用法示例：
 *  # 仅预览（dry run，默认）
 *  node scripts/migrate-giscus-add-docid.mjs --owner=InvolutionHell --repo=involutionhell
 *
 *  # 真正执行（写入）
 *  node scripts/migrate-giscus-add-docid.mjs --owner=InvolutionHell --repo=involutionhell --apply=true
 *
 *  # 用映射文件（不连 DB）
 *  node scripts/migrate-giscus-add-docid.mjs --map=tmp/discussion-map.json --apply=true
 *
 *  # 仅处理部分 doc，支持多次传参或逗号/换行分隔
 *  node scripts/migrate-giscus-add-docid.mjs --doc=abcd123 --doc=efg456 --apply=true
 *  node scripts/migrate-giscus-add-docid.mjs --doc-path=app/docs/foo/bar.mdx --doc-path=docs/foo/bar --apply=true
 *  node scripts/migrate-giscus-add-docid.mjs --doc-paths="app/docs/foo/bar.mdx,docs/foo/bar" --apply=true
 *  GISCUS_DOC_PATHS="app/docs/foo/bar.mdx\napp/docs/baz.mdx" node scripts/migrate-giscus-add-docid.mjs --apply=true
 *
 * 映射文件格式（示例）：
 * {
 *   "i0xmpsk...xls": ["app/docs/foo/bar.mdx", "/docs/foo/bar"],
 *   "abcd123...":    ["app/docs/baz.md"]
 * }
 */

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

// 可选：DB（Prisma）
let prisma = null;
try {
  const { PrismaClient } = await import("../generated/prisma/index.js");
  if (process.env.DATABASE_URL) {
    prisma = new PrismaClient();
  }
} catch {
  // 没有 prisma 也可运行（映射文件模式）
}

// Node18+ 自带 fetch
const GH_TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || "";
const OWNER = getArg("owner") || process.env.GITHUB_OWNER || "InvolutionHell";
const REPO = getArg("repo") || process.env.GITHUB_REPO || "involutionhell";
const MAP = getArg("map") || process.env.GISCUS_DISCUSSION_MAP || ""; // JSON 文件（映射文件模式）
const APPLY = (getArg("apply") || "false").toLowerCase() === "true"; // 是否真的更新标题

const DOC_FILTERS = getArgList("doc");
const DOC_PATH_FILTERS = [
  ...getArgList("doc-path"),
  ...getArgList("doc-paths"),
  ...(process.env.GISCUS_DOC_PATHS
    ? process.env.GISCUS_DOC_PATHS.split(/[,\n]/)
        .map((v) => v.trim())
        .filter(Boolean)
    : []),
];

if (!GH_TOKEN) {
  console.error("[migrate-giscus] Missing GH_TOKEN/GITHUB_TOKEN.");
  process.exit(1);
}

function getArg(k) {
  const arg = process.argv.slice(2).find((s) => s.startsWith(`--${k}=`));
  return arg ? arg.split("=")[1] : null;
}

function getArgList(k) {
  const matches = process.argv
    .slice(2)
    .filter((s) => s.startsWith(`--${k}=`))
    .map((s) => s.split("=")[1]);
  if (matches.length === 0) {
    const single = getArg(k);
    if (single) matches.push(single);
  }
  return matches
    .flatMap((value) => (value ?? "").split(/[,\n]/))
    .map((value) => value.trim())
    .filter(Boolean);
}

const GQL = "https://api.github.com/graphql";
const ghHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${GH_TOKEN}`,
  "User-Agent": "giscus-docid-migrator",
};

// 简单日志
const log = (...a) => console.log("[migrate-giscus]", ...a);

// GraphQL helpers
async function ghQuery(query, variables) {
  const res = await fetch(GQL, {
    method: "POST",
    headers: ghHeaders,
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `GitHub GraphQL failed: ${res.status} ${res.statusText} -> ${text}`,
    );
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

const Q_SEARCH_DISCUSSIONS = `
  query SearchDiscussions($q: String!) {
    search(query: $q, type: DISCUSSION, first: 20) {
      nodes {
        ... on Discussion {
          id
          number
          title
          url
          category { id name }
          repository { nameWithOwner }
        }
      }
    }
  }
`;

const M_UPDATE_DISCUSSION = `
  mutation UpdateDiscussion($id: ID!, $title: String!) {
    updateDiscussion(input: { discussionId: $id, title: $title }) {
      discussion { id number title url }
    }
  }
`;

// 读取输入来源：DB 或 映射文件
async function loadDocIdTerms() {
  // 优先 DB
  if (prisma) {
    log("Loading doc paths from DB…");
    const docs = await prisma.docs.findMany({
      select: {
        id: true,
        path_current: true,
        title: true,
        doc_paths: { select: { path: true } },
      },
    });
    const map = new Map(); // docId -> { title: string|null, terms: Set }
    for (const d of docs) {
      const entry = map.get(d.id) ?? {
        title: d.title ?? null,
        terms: new Set(),
      };
      if (!entry.title && d.title) entry.title = d.title;
      if (d.path_current) registerPathVariants(entry.terms, d.path_current);
      for (const p of d.doc_paths)
        if (p?.path) registerPathVariants(entry.terms, p.path);
      map.set(d.id, entry);
    }
    return map;
  }

  // 退化：映射文件模式
  if (MAP) {
    const abs = path.resolve(process.cwd(), MAP);
    const raw = await fs.readFile(abs, "utf8");
    const obj = JSON.parse(raw);
    const map = new Map();
    for (const [docId, rawValue] of Object.entries(obj)) {
      const entry = { title: null, terms: new Set() };

      if (Array.isArray(rawValue)) {
        rawValue.forEach((t) => registerPathVariants(entry.terms, t));
      } else if (rawValue && typeof rawValue === "object") {
        if (typeof rawValue.title === "string" && rawValue.title.trim()) {
          entry.title = rawValue.title.trim();
        }
        const termsSource = Array.isArray(rawValue.terms)
          ? rawValue.terms
          : rawValue.paths;
        if (Array.isArray(termsSource)) {
          termsSource.forEach((t) => registerPathVariants(entry.terms, t));
        }
      } else if (typeof rawValue === "string") {
        registerPathVariants(entry.terms, rawValue);
      }

      map.set(docId, entry);
    }
    return map;
  }

  throw new Error("No DATABASE_URL (DB 模式) and no --map JSON provided.");
}

// 搜索一个 term 对应的讨论（尽量限定到你的仓库）
async function searchDiscussionByTerm(term) {
  // GitHub 搜索语法：repo:OWNER/REPO in:title <term>
  const q = `${term} repo:${OWNER}/${REPO} in:title`;
  const data = await ghQuery(Q_SEARCH_DISCUSSIONS, { q });
  const nodes = data?.search?.nodes || [];
  // 过滤到目标仓库的讨论（双重保险）
  return nodes.filter(
    (n) =>
      n?.repository?.nameWithOwner?.toLowerCase() ===
      `${OWNER}/${REPO}`.toLowerCase(),
  );
}

function titleAlreadyNormalized(title, docId) {
  const normalized = docId.trim();
  if (!normalized) return false;
  return title.trim() === normalized;
}

function normalizeTitleToDocId(currentTitle, docId) {
  const normalized = docId.trim();
  if (!normalized) return currentTitle.trim();
  return normalized;
}

function registerPathVariants(targetSet, rawPath) {
  if (typeof rawPath !== "string") return;
  const trimmed = rawPath.trim();
  if (!trimmed) return;

  const variants = new Set();
  const candidates = [trimmed];

  const withoutExt = trimmed.replace(/\.(md|mdx|markdown)$/i, "");
  candidates.push(withoutExt);

  const leadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  candidates.push(leadingSlash);

  const withoutExtLeadingSlash = withoutExt.startsWith("/")
    ? withoutExt
    : `/${withoutExt}`;
  candidates.push(withoutExtLeadingSlash);

  const withoutApp = trimmed.replace(/^app\//i, "");
  if (withoutApp && withoutApp !== trimmed) {
    candidates.push(withoutApp);
    const withoutAppNoExt = withoutApp.replace(/\.(md|mdx|markdown)$/i, "");
    candidates.push(withoutAppNoExt);
    candidates.push(withoutApp.startsWith("/") ? withoutApp : `/${withoutApp}`);
    candidates.push(
      withoutAppNoExt.startsWith("/") ? withoutAppNoExt : `/${withoutAppNoExt}`,
    );
  }

  for (const candidate of candidates) {
    const value = typeof candidate === "string" ? candidate.trim() : "";
    if (value) variants.add(value);
  }

  for (const value of variants) targetSet.add(value);
}

function applyFilters(docIdMap) {
  const docIdFilterSet = new Set(DOC_FILTERS);
  const hasDocIdFilter = docIdFilterSet.size > 0;

  const pathFilterVariants = new Set();
  for (const path of DOC_PATH_FILTERS) {
    registerPathVariants(pathFilterVariants, path);
  }
  const hasPathFilter = pathFilterVariants.size > 0;

  if (!hasDocIdFilter && !hasPathFilter) {
    return;
  }

  for (const [docId, info] of Array.from(docIdMap.entries())) {
    let keep = true;

    if (keep && hasDocIdFilter) {
      keep = docIdFilterSet.has(docId);
    }

    if (keep && hasPathFilter) {
      const terms = Array.from(info?.terms ?? []);
      keep = terms.some((term) => pathFilterVariants.has(term));
    }

    if (!keep) {
      docIdMap.delete(docId);
    }
  }

  if (docIdMap.size === 0) {
    log("⚠️  未找到符合过滤条件的 docId，本次执行不会更新任何讨论。");
  }
}

async function main() {
  log(
    `Target repo: ${OWNER}/${REPO} | Mode: ${prisma ? "DB" : MAP ? "MAP" : "UNKNOWN"}`,
  );
  const docIdToTerms = await loadDocIdTerms();

  applyFilters(docIdToTerms);

  if (docIdToTerms.size === 0) {
    if (prisma) await prisma.$disconnect();
    return;
  }

  let updated = 0,
    skipped = 0,
    notFound = 0,
    examined = 0;

  for (const [docId, info] of docIdToTerms) {
    const terms = Array.from(info?.terms ?? []);
    let matched = null;

    // 尝试每个 term，直到命中一个讨论
    for (const term of terms) {
      const hits = await searchDiscussionByTerm(term);
      // 多命中：优先那些标题更“像”旧路径的；简单按包含度/长度排序
      const scored = hits
        .map((d) => ({ d, score: d.title.includes(term) ? term.length : 0 }))
        .sort((a, b) => b.score - a.score);

      if (scored.length > 0) {
        matched = scored[0].d;
        break;
      }
    }

    if (!matched) {
      notFound += 1;
      log(`⚠️  docId=${docId} 未找到旧讨论（terms=${terms.join(", ")})`);
      continue;
    }

    examined += 1;

    const oldTitle = matched.title;
    if (titleAlreadyNormalized(oldTitle, docId)) {
      skipped += 1;
      log(`⏭  #${matched.number} 已包含 docId：${matched.url}`);
      continue;
    }

    const newTitle = normalizeTitleToDocId(oldTitle, docId);
    log(
      `${APPLY ? "✏️ 更新" : "👀 预览"}  #${matched.number}  "${oldTitle}"  →  "${newTitle}"`,
    );

    if (APPLY) {
      await ghQuery(M_UPDATE_DISCUSSION, { id: matched.id, title: newTitle });
      updated += 1;
    }
  }

  log(
    `Done. examined=${examined}, updated=${updated}, skipped=${skipped}, notFound=${notFound}`,
  );

  if (prisma) await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  if (prisma) await prisma.$disconnect();
  process.exit(1);
});
