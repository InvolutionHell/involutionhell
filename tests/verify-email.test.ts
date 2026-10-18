import { describe, expect, it } from "vitest";
import enMessages from "../messages/en.json";
import zhMessages from "../messages/zh.json";
import { resolveVerifyError } from "../app/[locale]/login/verify/VerifyEmailForm";

describe("resolveVerifyError", () => {
  it("后端每个状态码都有专属文案", () => {
    expect(resolveVerifyError(400, "send")).toBe("errorInvalidEmail");
    expect(resolveVerifyError(400, "verify")).toBe("errorInvalidCode");
    expect(resolveVerifyError(409, "verify")).toBe("errorEmailTaken");
    expect(resolveVerifyError(410, "send")).toBe("errorExpired");
    expect(resolveVerifyError(410, "verify")).toBe("errorExpired");
    expect(resolveVerifyError(429, "send")).toBe("errorRateLimited");
    expect(resolveVerifyError(503, "send")).toBe("errorSendFailed");
  });

  it("未知状态码落到通用文案", () => {
    expect(resolveVerifyError(500, "verify")).toBe("errorGeneric");
    expect(resolveVerifyError(418, "verify")).toBe("errorGeneric");
  });

  it("解析出的 key 在 zh/en 里都存在", () => {
    for (const status of [400, 409, 410, 429, 500, 503]) {
      for (const step of ["send", "verify"] as const) {
        const key = resolveVerifyError(status, step);
        expect(zhMessages.verifyEmail, `zh 缺 ${key}`).toHaveProperty(key);
        expect(enMessages.verifyEmail, `en 缺 ${key}`).toHaveProperty(key);
      }
    }
  });

  it("zh/en 的 verifyEmail key 集合一致", () => {
    expect(Object.keys(enMessages.verifyEmail).sort()).toEqual(
      Object.keys(zhMessages.verifyEmail).sort(),
    );
  });
});
