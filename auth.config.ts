import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

// 在本地开发环境允许没有 .env 的协作者运行站点，因此先尝试读取两个常见的密钥变量，缺失时再使用内置的开发兜底值。
const envSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
const secret =
  envSecret ??
  (process.env.NODE_ENV !== "production"
    ? "__involutionhell_dev_secret__"
    : undefined);

if (!envSecret && process.env.NODE_ENV !== "production") {
  console.warn(
    "[auth] AUTH_SECRET missing – using development fallback secret",
  );
}

if (!secret) {
  throw new Error("[auth] AUTH_SECRET is required in production environments");
}

export const authConfig = {
  secret,
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
    async session({ session }) {
      return session;
    },
    async jwt({ token }) {
      return token;
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
