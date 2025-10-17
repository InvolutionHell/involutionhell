import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

// 在本地开发环境允许没有 .env 的协作者运行站点；
// 避免在构建阶段因缺少密钥而直接抛错，改为在生产缺失时输出报错日志，
// 让应用在运行时再失败（从而不阻塞静态构建）。
const envSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
const isProd = process.env.NODE_ENV === "production";
const resolvedSecret =
  envSecret ?? (!isProd ? "__involutionhell_dev_secret__" : undefined);

if (!envSecret && !isProd) {
  console.warn(
    "[auth] AUTH_SECRET missing – using development fallback secret",
  );
}

if (!envSecret && isProd) {
  // 不在导入期抛异常，避免构建失败；运行期 NextAuth 将因缺少 secret 而报错。
  console.error(
    "[auth] AUTH_SECRET is missing in production – requests will fail until configured",
  );
}

export const authConfig = {
  ...(resolvedSecret ? { secret: resolvedSecret } : {}),
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtectedRoute = nextUrl.pathname.startsWith("/dashboard");

      if (isOnProtectedRoute) {
        if (isLoggedIn) return true;
        return false;
      }

      return true;
    },
    async signIn() {
      return true;
    },
    async session({ session, token }) {
      // 将登录使用的 provider 挂到 session 上，方便前端组件根据登录方式展示提示或操作（例如切换 GitHub 账号）。
      const extendedSession = session as typeof session & { provider?: string };
      const extendedToken = token as
        | (typeof token & { provider?: string })
        | undefined;
      if (extendedToken?.provider) {
        extendedSession.provider = extendedToken.provider;
      }
      return extendedSession;
    },
    async jwt({ token, account }) {
      // 在用户完成 OAuth 回调时记录 provider；后续 session 回调会把它带给客户端。
      const extendedToken = token as typeof token & { provider?: string };
      if (account?.provider) {
        extendedToken.provider = account.provider;
      }
      return extendedToken;
    },
  },
  providers: [
    GitHub({
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
  ],
} satisfies NextAuthConfig;
