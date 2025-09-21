# Login Flow Overview

这个目录承载站点的 NextAuth 路由处理。下面是登录流程与依赖的简要说明：

- **身份验证框架**：使用 [NextAuth.js 5 (Auth.js)](https://authjs.dev/) 作为认证核心，通过 `app/auth.ts` 暴露的 `handlers` 响应 GET/POST 请求。
- **OAuth provider**：接入 GitHub OAuth（`next-auth/providers/github`），读取用户的 `id/name/email/avatar` 并持久化到本地用户表。
- **数据库适配器**：优先使用 [@auth/neon-adapter](https://authjs.dev/reference/adapter/neon) 将用户、账户、会话数据写入 Neon Postgres。若运行环境缺少 `DATABASE_URL`，系统会回退到 JWT 会话策略，不再访问数据库，方便协作者在无 Neon 凭据的情况下开发。
- **会话策略**：有 Neon 配置时启用数据库会话（`strategy: "database"`），否则改用默认的 JWT 签名。
- **必要环境变量**：`AUTH_SECRET`/`NEXTAUTH_SECRET` 用于签名；`AUTH_GITHUB_ID`、`AUTH_GITHUB_SECRET` 用于 GitHub OAuth；`DATABASE_URL` 控制 Neon 连接（可选）。开发环境缺少这些变量时会给出控制台警告并使用安全兜底逻辑，以保证本地能跑通。

### 本地无 `.env` 的执行策略

- 如果 `.env` 没有配置，只要 GitHub 登录仍在，NextAuth 会使用内置的开发密钥和 JWT 会话继续工作，登录流程不会报错。
- Neon 数据库适配器会被自动禁用，此时用户信息只保存在 cookie/JWT 中，不会写入 `users / sessions` 表；适合纯前端协作者快速启动项目。
- 控制台会输出显式警告，提示缺少密钥或数据库连接，确保真正部署前补齐配置。

如需扩展更多 provider 或调整会话策略，可直接修改 `auth.config.ts` 与 `auth.ts`。
