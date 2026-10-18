import { describe, expect, it } from "vitest";
import { armLoginNonce, takeLoginNonce } from "@/lib/use-auth";
import { savePending, takePending } from "@/lib/sso";

function memoryStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  } as unknown as Storage;
}

describe("login nonce", () => {
  it("回传的 n 与本标签页存的完全一致 → 接受，且只接受一次", () => {
    const s = memoryStorage();
    const n = armLoginNonce(s);
    expect(takeLoginNonce(s, n)).toBe(true);
    expect(takeLoginNonce(s, n)).toBe(false);
  });

  it("没发起过登录（别人发来的 /#token= 链接）→ 拒绝", () => {
    expect(takeLoginNonce(memoryStorage(), "AAAAAAAAAAAAAAAAAAAAAA")).toBe(
      false,
    );
  });

  it("缺 n 或 n 对不上 → 拒绝，且已存的 nonce 被消费掉", () => {
    const s = memoryStorage();
    armLoginNonce(s);
    expect(takeLoginNonce(s, null)).toBe(false);
    expect(s.getItem("ih:login:nonce")).toBeNull();

    const n = armLoginNonce(s);
    expect(takeLoginNonce(s, n + "x")).toBe(false);
    expect(s.getItem("ih:login:nonce")).toBeNull();
    // 攻击者的错 n 已经把 nonce 消费掉，正确的 n 晚到也不再被接受
    expect(takeLoginNonce(s, n)).toBe(false);
  });

  it("存的值为空串时，空 n 也不算匹配", () => {
    const s = memoryStorage();
    s.setItem("ih:login:nonce", "");
    expect(takeLoginNonce(s, "")).toBe(false);
  });

  it("nonce 是 22 位 base64url，满足后端校验，且每次不同", () => {
    const s = memoryStorage();
    const a = armLoginNonce(s);
    const b = armLoginNonce(s);
    expect(a).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(b).toMatch(/^[A-Za-z0-9_-]{16,64}$/);
    expect(a).not.toBe(b);
    expect(s.getItem("ih:login:nonce")).toBe(b);
  });

  it("token 被拒不影响 SSO pending，重新登录后仍能续接", () => {
    const s = memoryStorage();
    const req = {
      client_id: "holocard",
      redirect_uri: "https://holocard.example/cb",
      state: "st",
      code_challenge: "cc",
      code_challenge_method: "S256",
    };
    savePending(s, req);
    armLoginNonce(s);
    expect(takeLoginNonce(s, "forged")).toBe(false);

    const n = armLoginNonce(s);
    expect(takeLoginNonce(s, n)).toBe(true);
    expect(takePending(s)).toEqual(req);
  });
});
