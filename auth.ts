import NextAuth, { CredentialsSignin } from "next-auth";
import { authConfig } from "./auth.config";
import GitHub from "next-auth/providers/github";

class InvalidLoginError extends CredentialsSignin {
  code = "Invalid identifier or password";
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    GitHub({
      profile(profile) {
        return {
          id: `github-${profile.id}`, // 让 User.id 直接对应 GitHub ID
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
  ],
});
