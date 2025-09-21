import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import GitHub from "next-auth/providers/github";
import { Pool } from "@neondatabase/serverless";
import NeonAdapter from "@auth/neon-adapter";

type NeonAdapterPool = Parameters<typeof NeonAdapter>[0];

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  // Neon 连接只在有数据库配置时启用；本地协作者若没有 `.env`，将回退为纯 JWT 会话，避免直接抛错阻塞开发。
  const databaseUrl = process.env.DATABASE_URL;
  const adapter = databaseUrl
    ? NeonAdapter(
        new Pool({
          connectionString: databaseUrl,
        }) as unknown as NeonAdapterPool,
      )
    : undefined;

  if (!databaseUrl) {
    console.warn("[auth] DATABASE_URL missing – running without Neon adapter");
  }

  return {
    ...authConfig,
    providers: [
      GitHub({
        profile(profile) {
          return {
            id: profile.id.toString(), // 与数据库的整数主键兼容
            name: profile.name ?? profile.login,
            email: profile.email,
            image: profile.avatar_url,
          };
        },
      }),
    ],
    ...(adapter
      ? {
          adapter,
          session: {
            strategy: "database" as const,
          },
        }
      : {
          session: {
            strategy: "jwt" as const,
          },
        }),
  };
});
