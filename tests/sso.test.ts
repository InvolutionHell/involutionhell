import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SSO_PENDING_KEY,
  authorizePath,
  parseSsoRequest,
  requestSsoRedirect,
  savePending,
  takePending,
} from "@/lib/sso";

const VALID = {
  client_id: "holocard",
  redirect_uri: "https://holocard.longsizhuo.com/auth/callback",
  state: "s-tate_123",
  code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
  code_challenge_method: "S256",
};

function memoryStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  } as unknown as Storage;
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("parseSsoRequest", () => {
  it("5 个参数齐全、S256、已知 client → 通过", () => {
    expect(parseSsoRequest({ ...VALID, extra: "x" })).toEqual(VALID);
  });

  it("HoloCard 的 staging 是单独的 client，也认", () => {
    const staging = {
      ...VALID,
      client_id: "holocard-staging",
      redirect_uri: "https://holocard.staging.longsizhuo.com/auth/callback",
    };
    expect(parseSsoRequest(staging)).toEqual(staging);
  });

  it.each(Object.keys(VALID))("缺 %s 或为空 → 拒绝", (key) => {
    expect(parseSsoRequest({ ...VALID, [key]: undefined })).toBeNull();
    expect(parseSsoRequest({ ...VALID, [key]: "" })).toBeNull();
  });

  it.each(["plain", "s256", "S512"])("method=%s → 拒绝", (method) => {
    expect(
      parseSsoRequest({ ...VALID, code_challenge_method: method }),
    ).toBeNull();
  });

  it.each(["evil", "HoloCard", "__proto__", "constructor", "toString"])(
    "未知 client_id=%s → 拒绝（不从原型链命中）",
    (clientId) => {
      expect(parseSsoRequest({ ...VALID, client_id: clientId })).toBeNull();
    },
  );
});

describe("pending 存取", () => {
  it("存进去能原样取出，取出即删", () => {
    const storage = memoryStorage();
    savePending(storage, VALID);
    expect(JSON.parse(storage.getItem(SSO_PENDING_KEY)!)).toMatchObject(VALID);
    expect(takePending(storage)).toEqual(VALID);
    expect(storage.getItem(SSO_PENDING_KEY)).toBeNull();
    expect(takePending(storage)).toBeNull();
  });

  it("10 分钟内有效，到 10 分钟作废并删除", () => {
    vi.useFakeTimers();
    const storage = memoryStorage();

    vi.setSystemTime(1_000_000);
    savePending(storage, VALID);
    vi.setSystemTime(1_000_000 + 10 * 60 * 1000 - 1);
    expect(takePending(storage)).toEqual(VALID);

    vi.setSystemTime(1_000_000);
    savePending(storage, VALID);
    vi.setSystemTime(1_000_000 + 10 * 60 * 1000);
    expect(takePending(storage)).toBeNull();
    expect(storage.getItem(SSO_PENDING_KEY)).toBeNull();
  });

  it.each([
    "not json",
    "null",
    "42",
    JSON.stringify(VALID), // 没有 savedAt
    JSON.stringify({ ...VALID, savedAt: Date.now() + 60_000 }), // 未来时间
    JSON.stringify({ ...VALID, client_id: "evil", savedAt: Date.now() }),
  ])("损坏或不合法的 pending 当作没有并删除: %s", (raw) => {
    const storage = memoryStorage();
    storage.setItem(SSO_PENDING_KEY, raw);
    expect(takePending(storage)).toBeNull();
    expect(storage.getItem(SSO_PENDING_KEY)).toBeNull();
  });

  it("authorizePath 带回原来的 5 个参数", () => {
    const url = new URL(authorizePath(VALID), "https://involutionhell.com");
    expect(url.pathname).toBe("/sso/authorize");
    expect(Object.fromEntries(url.searchParams)).toEqual(VALID);
  });
});

describe("requestSsoRedirect：跳转只用后端返回的 data.redirect", () => {
  // query 里的 redirect_uri 被换成攻击者地址，后端返回的才是登记值
  const forged = { ...VALID, redirect_uri: "https://evil.example/steal" };
  const backendRedirect =
    "https://holocard.longsizhuo.com/auth/callback?code=abc&state=s-tate_123";

  function mockFetch(status: number, body: unknown) {
    const fetchMock = vi.fn(
      async () =>
        new Response(typeof body === "string" ? body : JSON.stringify(body), {
          status,
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("成功时返回 data.redirect，请求按协议发出", async () => {
    const fetchMock = mockFetch(200, {
      success: true,
      message: "ok",
      data: { redirect: backendRedirect },
    });
    expect(await requestSsoRedirect(forged, "tok")).toBe(backendRedirect);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("/oauth/sso/code");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ satoken: "tok" });
    expect(JSON.parse(init.body as string)).toEqual({
      clientId: "holocard",
      redirectUri: "https://evil.example/steal",
      state: VALID.state,
      codeChallenge: VALID.code_challenge,
      codeChallengeMethod: "S256",
    });
  });

  it.each<[string, number, unknown]>([
    ["400 拒绝", 400, { success: false, message: "redirect_uri mismatch" }],
    ["401 未登录", 401, { success: false, message: "未登录" }],
    [
      "success=false",
      200,
      { success: false, data: { redirect: backendRedirect } },
    ],
    ["没有 data.redirect", 200, { success: true, data: {} }],
    ["data.redirect 为空", 200, { success: true, data: { redirect: "" } }],
    ["非 JSON", 502, "<html>Bad Gateway</html>"],
  ])(
    "失败（%s）返回 null，不退回 query 的 redirect_uri",
    async (_, status, body) => {
      mockFetch(status, body);
      expect(await requestSsoRedirect(forged, "tok")).toBeNull();
    },
  );

  it("网络错误返回 null", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );
    expect(await requestSsoRedirect(forged, "tok")).toBeNull();
  });
});
