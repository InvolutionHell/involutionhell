"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { authorizePath, takePending } from "@/lib/sso";

// 对应后端 UserView DTO 的 TypeScript 类型
// 字段与 involutionhell-backend/.../dto/UserView.java 保持一致
export interface UserView {
  id: number;
  username: string; // 系统用户名，GitHub 登录格式为 github_<uuid>
  displayName: string; // 展示名，来自 GitHub 昵称
  enabled: boolean;
  roles: string[];
  permissions: string[];
  avatarUrl: string | null; // GitHub 头像 URL
  email: string | null; // GitHub 邮箱
  githubId: number | null; // GitHub 数字用户 ID
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: UserView | null;
  status: AuthStatus;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  status: "loading",
  logout: async () => {},
});

// 从 localStorage 读取 satoken
function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("satoken");
}

/**
 * 把 satoken 同步写一份到 `.involutionhell.com` 域名的 cookie。
 *
 * 为什么需要：直接访问 api.involutionhell.com/admin/pgadmin/*（新标签页打开 pgAdmin）
 * 时浏览器不会主动发 `satoken` header——业务 API 是走 Next.js rewrite 同源的，所以
 * 前端能手动附 header；但新标签直连 api 子域就只能靠 cookie 自动带。
 *
 * Caddy 在 api 子域前放了 forward_auth 钩子调后端 /api/admin/pgadmin-check，
 * sa-token 默认从 cookie 读 token（sa-token.is-read-cookie=true 默认开），
 * 只要 cookie 存在且对应 satoken 在后端会话库里且拥有 admin 角色就放行。
 *
 * 本地开发（localhost）的 Domain 属性要留空，浏览器会默认绑当前 host；
 * 生产（involutionhell.com + api.involutionhell.com）要显式写 `.involutionhell.com`
 * 否则两个子域 cookie 各存各的。
 */
function syncTokenCookie(token: string | null) {
  if (typeof document === "undefined") return;
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const domainAttr = isLocalhost ? "" : "; Domain=.involutionhell.com";
  const secureAttr = window.location.protocol === "https:" ? "; Secure" : "";
  if (token) {
    // 30 天 TTL 和 sa-token 服务端配置保持一致（application.properties 里 2592000）
    document.cookie = `satoken=${encodeURIComponent(token)}; Path=/${domainAttr}; Max-Age=2592000; SameSite=Lax${secureAttr}`;
  } else {
    // 清除：设空值并 Max-Age=0；Domain / Path 必须与写入时一致浏览器才认这是"同一条"
    document.cookie = `satoken=; Path=/${domainAttr}; Max-Age=0; SameSite=Lax${secureAttr}`;
  }
}

const LOGIN_NONCE_KEY = "ih:login:nonce";

// #token 只认本标签页自己发起的登录：否则任何人发一个 /#token=<自己的 token> 链接，
// 就能把受害者静默登进攻击者账号，再诱导其在设置页把自己的第三方身份绑过去。
// 所有跳 /oauth/render/* 或带 #token 回站的地方，都要先 arm 并把返回值作为 n 带上；
// 后端把 /oauth/render 收到的 n 原样回传到 #token=…&n=…。
// 返回 base64url(16 字节随机数)，22 字符，满足后端的 ^[A-Za-z0-9_-]{16,64}$。
export function armLoginNonce(storage: Storage): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const nonce = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  storage.setItem(LOGIN_NONCE_KEY, nonce);
  return nonce;
}

// 不论结果都会消费掉已存的 nonce；只有与回传的 n 完全一致才返回 true
export function takeLoginNonce(
  storage: Storage,
  echoed: string | null,
): boolean {
  const stored = storage.getItem(LOGIN_NONCE_KEY);
  storage.removeItem(LOGIN_NONCE_KEY);
  return !!stored && echoed === stored;
}

// 调用后端 /auth/me 验证 token 并获取用户信息
// 走 Next.js rewrite（/auth/* → 后端），浏览器无跨域问题
async function fetchCurrentUser(token: string): Promise<UserView | null> {
  try {
    const res = await fetch("/auth/me", {
      headers: { satoken: token },
    });
    if (!res.ok) return null;
    // 后端返回 ApiResponse<UserView>，实际用户数据在 .data 字段
    const body = await res.json();
    return (body.data as UserView) ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserView | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const locale = useLocale();

  useEffect(() => {
    // 1. 检查 URL fragment 中是否携带 #token=xxx（后端 OAuth 登录成功后跳回来时携带）
    // 使用 fragment 而非 query param：fragment 不会出现在服务器日志和 Referer 头中
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const hashToken = hashParams.get("token");
    const urlToken =
      hashToken && takeLoginNonce(sessionStorage, hashParams.get("n"))
        ? hashToken
        : null;

    if (urlToken) {
      // 存入 localStorage + 同步写 cookie（供 api 子域直连场景使用，比如 pgAdmin）
      localStorage.setItem("satoken", urlToken);
      syncTokenCookie(urlToken);
    }
    if (hashToken) {
      // 用 replaceState 清除 URL 中的 fragment，避免刷新或分享时 token 泄露
      hashParams.delete("token");
      hashParams.delete("n");
      const newHash = hashParams.toString();
      const newUrl =
        window.location.pathname +
        window.location.search +
        (newHash ? "#" + newHash : "");
      window.history.replaceState(null, "", newUrl);
    }
    // nonce 对不上：丢弃 token 并让用户重新登录。不 takePending，SSO 请求留到下次登录成功后续接
    if (hashToken && !urlToken) {
      window.location.replace(`/${locale}/login?error=oauth_state`);
      return;
    }

    // 2. 读取存储的 token，调用后端验证并获取用户信息
    const token = urlToken ?? getStoredToken();
    if (!token) {
      // 异步设置，避免在 effect 中同步调用 setState 触发级联渲染
      Promise.resolve().then(() => setStatus("unauthenticated"));
      return;
    }

    fetchCurrentUser(token).then((u) => {
      if (u) {
        setUser(u);
        setStatus("authenticated");
        // 已登录用户每次刷新也重写 cookie，覆盖掉可能过期 / 丢失的副本
        syncTokenCookie(token);
        // 登录前在 /sso/authorize 存下的请求：不管走哪种登录方式回来，都在这里接上
        const pending = takePending(sessionStorage);
        if (pending) window.location.replace(authorizePath(pending));
      } else {
        // token 无效或已过期，localStorage + cookie 都清
        localStorage.removeItem("satoken");
        syncTokenCookie(null);
        setStatus("unauthenticated");
      }
    });
  }, [locale]);

  // 退出登录：清除 token，调用后端注销接口
  const logout = async () => {
    const token = getStoredToken();
    if (token) {
      try {
        // 走 Next.js rewrite，同源请求
        await fetch("/auth/logout", {
          method: "POST",
          headers: { satoken: token },
        });
      } catch {
        // 即使后端调用失败，也清除本地 token
      }
      localStorage.removeItem("satoken");
    }
    syncTokenCookie(null);
    setUser(null);
    setStatus("unauthenticated");
  };

  return (
    <AuthContext.Provider value={{ user, status, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 在任何客户端组件中调用，获取当前登录状态
export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
