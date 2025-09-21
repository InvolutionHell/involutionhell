import NextAuth, { CredentialsSignin } from "next-auth";
import { authConfig } from "./auth.config";
import GitHub from "next-auth/providers/github";
import { Pool } from "@neondatabase/serverless";
import NeonAdapter from "@auth/neon-adapter";

class InvalidLoginError extends CredentialsSignin {
  code = "Invalid identifier or password";
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return {
    ...authConfig,
    adapter: NeonAdapter(pool),
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
  };
  session: {
    strategy: "database";
  }
});
