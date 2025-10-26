// app/api/indexnow/route.ts
// Next.js App Router API route for IndexNow push (Serverless friendly)

export const runtime = "edge"; // 也可用 "nodejs"，两者都能 fetch

type Payload = {
  url?: string;
  urls?: string[];
  urlList?: string[];
  host?: string;
  engine?: "bing" | "yandex" | "seznam" | "naver" | "hub";
};

// 可选：简单的调用鉴权，避免被他人滥用。到 Vercel 环境变量里设置 INDEXNOW_API_TOKEN。
const REQUIRED_BEARER = process.env.INDEXNOW_API_TOKEN ?? "";

// 你的 IndexNow 验证 key（即 public/{key}.txt 的文件名部分）
const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY ?? process.env.NEXT_PUBLIC_INDEXNOW_KEY ?? "";

function bad(msg: string, status = 400) {
  return new Response(JSON.stringify({ ok: false, error: msg }), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function ok(data: unknown) {
  return new Response(
    JSON.stringify({ ok: true, ...((data as object) ?? {}) }),
    {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
    },
  );
}

function dedupeValidHttps(urls: (string | undefined)[]) {
  const s = new Set<string>();
  for (const u of urls) {
    if (!u) continue;
    try {
      const url = new URL(u);
      if (url.protocol === "https:" || url.protocol === "http:") {
        s.add(url.toString());
      }
    } catch {
      console.error("Invalid URL:", u);
    }
  }
  return [...s];
}

function getDefaultHostFromReq(req: Request) {
  // 从请求头推断 Host & Protocol（在 Vercel 上可用）
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  return { host, proto };
}

function endpointFor(engine?: Payload["engine"]) {
  switch (engine) {
    case "bing":
      return "https://www.bing.com/indexnow";
    case "yandex":
      return "https://yandex.com/indexnow";
    case "seznam":
      return "https://search.seznam.cz/indexnow";
    case "naver":
      return "https://searchadvisor.naver.com/indexnow";
    case "hub":
    default:
      return "https://api.indexnow.org/indexnow"; // 官方 Hub（推荐）
  }
}

async function pushToIndexNow({
  host,
  key,
  urlList,
  engine,
}: {
  host: string;
  key: string;
  urlList: string[];
  engine?: Payload["engine"];
}) {
  const keyLocation = `https://${host}/${key}.txt`;
  const endpoint = endpointFor(engine);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      host,
      key,
      keyLocation,
      urlList,
    }),
  });

  const text = await res.text().catch(() => "");
  return { status: res.status, ok: res.ok, body: text };
}

// 便捷：GET ?url=https://your-site/page 也可以触发一次推送
export async function GET(req: Request) {
  if (REQUIRED_BEARER) {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ") || auth.slice(7) !== REQUIRED_BEARER) {
      return bad("Unauthorized", 401);
    }
  }
  if (!INDEXNOW_KEY) return bad("Missing INDEXNOW_KEY env", 500);

  const { host: defaultHost } = getDefaultHostFromReq(req);
  if (!defaultHost) return bad("Cannot infer host from request", 500);

  const urlParam = new URL(req.url).searchParams.get("url") ?? undefined;
  const urls = dedupeValidHttps([urlParam]);
  if (urls.length === 0) return bad("Provide ?url=...", 400);

  const result = await pushToIndexNow({
    host: defaultHost,
    key: INDEXNOW_KEY,
    urlList: urls,
    engine: "hub",
  });

  return ok({ indexnow: result, submitted: urls });
}

// 推荐：POST 更灵活，支持批量
export async function POST(req: Request) {
  if (REQUIRED_BEARER) {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ") || auth.slice(7) !== REQUIRED_BEARER) {
      return bad("Unauthorized", 401);
    }
  }
  if (!INDEXNOW_KEY) return bad("Missing INDEXNOW_KEY env", 500);

  let body: Payload = {};
  try {
    body = (await req.json()) as Payload;
  } catch {
    console.error("Error parsing request body");
  }

  const { host: inferredHost } = getDefaultHostFromReq(req);
  const host = (body.host || inferredHost || "").replace(/^https?:\/\//, "");
  if (!host) return bad("Cannot infer host; pass { host }", 400);

  const urls = dedupeValidHttps([
    body.url,
    ...(body.urls || []),
    ...(body.urlList || []),
  ]);
  if (urls.length === 0) return bad("Provide { url } or { urls/urlList }", 400);

  const result = await pushToIndexNow({
    host,
    key: INDEXNOW_KEY,
    urlList: urls,
    engine: body.engine ?? "hub",
  });

  return ok({ indexnow: result, submitted: urls, host });
}
