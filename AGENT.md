# AGENT Log

## Objective

- Build a custom Giscus-like comment widget for the site, backed by GitHub Discussions via the GitHub API.

## Context

- Issue tracker reference: https://github.com/InvolutionHell/involutionhell.github.io/issues/200
- Prior attempt for inspiration: https://github.com/InvolutionHell/involutionhell.github.io/pull/210
- Storage will stay in GitHub Discussions; authentication uses NextAuth with GitHub; backend will read/write via GitHub GraphQL; each page already has a `docId` (cuid2) mapping; notifications remain within GitHub.

## Plan of Attack

1. Audit the current site implementation to understand where the new discussion widget must hook in. **Status:** TODO
2. Define the backend interface for reading/writing discussion threads keyed by `docId`. **Status:** TODO
3. Implement Next.js route handlers that proxy to the GitHub GraphQL API with the required auth. **Status:** TODO
4. Develop the front-end discussion component that mirrors Giscus UX but targets our custom API. **Status:** TODO
5. Integrate GitHub login flow with NextAuth to gate posting while allowing read access. **Status:** TODO
6. Validate end-to-end (local + production build) and document deployment steps. **Status:** TODO

## Current Progress

- Schema review confirms `docs` table stores each `docId` (cuid2) keyed to contributors; `doc_contributors` joins by `doc_id` + `github_id`; `doc_paths` tracks current routes. Env vars for Neon/GitHub live in `.env`.
- `app/docs/[...slug]/page.tsx` 读取 frontmatter 中的 `docId`，传入 `GiscusComments`，同时利用 `lib/contributors.ts` 通过 docId 读取贡献者数据。
- `GiscusComments` 组件基于 `docId` 切换 Giscus `mapping="specific"`；替换该组件将是我们嵌入自研讨论区的主要入口。

## Open Questions / Risks

- Need to confirm where `docId` values are stored/exposed in the current content pipeline.
- Must verify available GitHub tokens/permissions for server-side API access and rate limits.

## Next Actions

1. 列出后端接口与会话处理的详细任务（包括服务端 token 读取与用户 token 代理策略）。
2. 拟定前端评论组件的状态流与 UI 子任务（加载、分页、发送评论、鉴权提示等）。
3. 规划必要的测试/脚本（GraphQL query mock、端到端自测步骤）。
