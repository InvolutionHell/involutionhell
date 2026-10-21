import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const generateText = vi.fn(async () => ({ text: '["q1","q2","q3"]' }));
const unstableCache = vi.fn(
  (fn: (...args: unknown[]) => unknown, _keys?: string[], _opts?: object) =>
    (...args: unknown[]) =>
      fn(...args),
);

vi.mock("ai", () => ({ generateText }));
vi.mock("next/cache", () => ({ unstable_cache: unstableCache }));
vi.mock("@/lib/rate-limit", () => ({
  limitChat: async () => ({ success: true }),
  rateLimitResponse: () => new Response(null, { status: 429 }),
}));
vi.mock("@/lib/ai/models", () => ({
  getModel: (provider: string, apiKey?: string) => ({ provider, apiKey }),
  requiresApiKey: (provider: string) => provider !== "intern",
}));
vi.mock("@/lib/ai/providers/glm", () => ({
  createGlmFlashModel: () => ({ provider: "glm" }),
}));

const { POST } = await import("@/app/api/suggestions/route");

// 公共缓存按请求建一层 unstable_cache，key 形如 suggestion-key-<...>
const usedSharedCache = () =>
  unstableCache.mock.calls.some(([, keys]) =>
    (keys as string[]).some((k) => k.startsWith("suggestion-key-")),
  );

function post(body: object) {
  return POST(
    new Request("http://localhost/api/suggestions", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );
}

describe("/api/suggestions 模型选择", () => {
  beforeEach(() => vi.stubEnv("ZHIPU_API_KEY", "server-key"));
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("自带 key 的 provider 用用户自己的模型，不进公共缓存（即使服务端配了 ZHIPU）", async () => {
    await post({ messages: [], provider: "openai", apiKey: "user-key" });

    expect(usedSharedCache()).toBe(false);
    expect(generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: { provider: "openai", apiKey: "user-key" },
      }),
    );
  });

  it("默认 intern 走公共缓存，配了 ZHIPU 时用 GLM", async () => {
    await post({ messages: [] });

    expect(usedSharedCache()).toBe(true);
    expect(generateText).toHaveBeenCalledWith(
      expect.objectContaining({ model: { provider: "glm" } }),
    );
  });
});
