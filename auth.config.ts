import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

export const authConfig = {
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
    async signIn({ user, account, profile }) {
      console.log("[auth] signIn payload", { user, account, profile });
      return true;
    },
    async session({ session, token }) {
      console.log("[auth] session payload", { session, token });
      return session;
    },
    async jwt({ token, user, account, profile }) {
      console.log("[auth] jwt payload", { token, user, account, profile });
      return token;
    },
  },
  providers: [
    GitHub({
      profile(profile) {
        return {
          id: `github-${profile.id}`,
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
  ],
} satisfies NextAuthConfig;
