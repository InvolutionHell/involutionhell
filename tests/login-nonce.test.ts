import { afterEach, describe, expect, it, vi } from "vitest";
import { armLoginNonce, takeLoginNonce } from "@/lib/use-auth";

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
});

describe("login nonce", () => {
  it("本标签页发起过登录 → #token 只接受一次", () => {
    const s = memoryStorage();
    armLoginNonce(s);
    expect(takeLoginNonce(s)).toBe(true);
    expect(takeLoginNonce(s)).toBe(false);
  });

  it("没发起过登录（别人发来的 /#token= 链接）→ 拒绝", () => {
    expect(takeLoginNonce(memoryStorage())).toBe(false);
  });

  it("超过 10 分钟 → 拒绝，且 nonce 被消费掉", () => {
    vi.useFakeTimers();
    const s = memoryStorage();
    vi.setSystemTime(1_000_000);
    armLoginNonce(s);
    vi.setSystemTime(1_000_000 + 10 * 60 * 1000 - 1);
    expect(takeLoginNonce(s)).toBe(true);

    vi.setSystemTime(1_000_000);
    armLoginNonce(s);
    vi.setSystemTime(1_000_000 + 10 * 60 * 1000);
    expect(takeLoginNonce(s)).toBe(false);
    expect(s.getItem("ih:login:nonce")).toBeNull();
  });

  it("损坏或来自未来的值 → 拒绝", () => {
    const s = memoryStorage();
    s.setItem("ih:login:nonce", "garbage");
    expect(takeLoginNonce(s)).toBe(false);
    s.setItem("ih:login:nonce", String(Date.now() + 60_000));
    expect(takeLoginNonce(s)).toBe(false);
  });
});
