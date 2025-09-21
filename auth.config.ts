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
