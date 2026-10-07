export const SSO_CLIENTS: Record<string, string> = { holocard: "HoloCard" };

export const SSO_PENDING_KEY = "ih:sso:pending";
const PENDING_TTL_MS = 10 * 60 * 1000;

const SSO_PARAMS = [
  "client_id",
  "redirect_uri",
  "state",
  "code_challenge",
  "code_challenge_method",
] as const;

export type SsoRequest = Record<(typeof SSO_PARAMS)[number], string>;

// client 表必须用 Object.hasOwn 查：?client_id=__proto__ / constructor 会命中原型链
export function parseSsoRequest(
  source: Record<string, unknown>,
): SsoRequest | null {
  const req = {} as SsoRequest;
  for (const key of SSO_PARAMS) {
    const value = source[key];
    if (typeof value !== "string" || !value) return null;
    req[key] = value;
  }
  if (req.code_challenge_method !== "S256") return null;
  if (!Object.hasOwn(SSO_CLIENTS, req.client_id)) return null;
  return req;
}

export function savePending(storage: Storage, req: SsoRequest) {
  storage.setItem(
    SSO_PENDING_KEY,
    JSON.stringify({ ...req, savedAt: Date.now() }),
  );
}

// 取出即删；过期、损坏、校验不过都按没有处理
export function takePending(storage: Storage): SsoRequest | null {
  const raw = storage.getItem(SSO_PENDING_KEY);
  if (raw === null) return null;
  storage.removeItem(SSO_PENDING_KEY);
  try {
    const pending = JSON.parse(raw);
    const age = Date.now() - pending.savedAt;
    return age >= 0 && age < PENDING_TTL_MS ? parseSsoRequest(pending) : null;
  } catch {
    return null;
  }
}

export function authorizePath(req: SsoRequest): string {
  return `/sso/authorize?${new URLSearchParams(req)}`;
}

// 跳转目标只认后端返回的 data.redirect（redirect_uri 由后端按登记值逐字校验）。
// 失败一律返回 null，调用方不得退回去用 query 里的 redirect_uri。
export async function requestSsoRedirect(
  req: SsoRequest,
  token: string,
): Promise<string | null> {
  try {
    const res = await fetch("/oauth/sso/code", {
      method: "POST",
      headers: { "Content-Type": "application/json", satoken: token },
      body: JSON.stringify({
        clientId: req.client_id,
        redirectUri: req.redirect_uri,
        state: req.state,
        codeChallenge: req.code_challenge,
        codeChallengeMethod: req.code_challenge_method,
      }),
    });
    const body = await res.json();
    const redirect = body?.data?.redirect;
    return res.ok &&
      body.success === true &&
      typeof redirect === "string" &&
      redirect
      ? redirect
      : null;
  } catch {
    return null;
  }
}
