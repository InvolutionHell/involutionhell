# 内卷地狱——评论区——技术文档

## 背景

1. ISSUE：https://github.com/InvolutionHell/involutionhell.github.io/issues/200
2. 尝试：https://github.com/InvolutionHell/involutionhell.github.io/pull/210

## 解决方案：

自己写一个类似的Giscus，放在网站里面，用GitHub Discussion维护。自己写一个“Giscus-like”前端组件，后端直接把评论读写到 GitHub Discussions。这样通知仍由 GitHub 负责（用户一旦评论/参与，GitHub 会按其通知设置发邮件/站内通知），也不需要自建邮件或扛数据库压力。

- 存储：GitHub Discussions
- 登录：站点只用 NextAuth + GitHub 一次登录
- 读写：你的后端（Next.js Route Handler / API Route）用 GitHub API（推荐 GraphQL v4）读写 Discussion/Comment
- 映射：每个页面用 docId(cuid2) 映射到对应的 Discussion（已由Giscus做完）
- 通知：继续走 GitHub 的通知生态（无需自发邮件）

## 数据流

1. 用户在站点通过 NextAuth(GitHub) 登录
2. 你的前端评论组件只和你自家的 /api/comments 通信
3. 后端读取 NextAuth 的 session，拿到用户的 GitHub OAuth access_token（不要在前端暴露）
4. 后端用该 token 调用 GitHub GraphQL：
   - 查询：是否已有对应 pageId 的 Discussion；拉取评论列表（分页）
   - 首评懒创建：若无 Discussion，则后端用 mutation 创建一个新的 Discussion
   - 发评/回评：用 mutation addDiscussionComment 发送评论
5. GitHub 负责给参与者/订阅者 发送通知（邮件/站内）
