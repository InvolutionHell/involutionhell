/**
 * GitHub Discussion 模块的基础常量。
 * 这些常量单独维护，便于在不同服务函数之间复用或在测试中覆盖。
 */

export const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

export const DEFAULT_DISCUSSION_CATEGORY_NAME =
  process.env.GITHUB_DISCUSSION_CATEGORY_NAME ?? "Comments";

export const DEFAULT_COMMENT_PAGE_SIZE = 25;

export const DEFAULT_REPLY_PAGE_SIZE = 10;

export const USER_AGENT_HEADER =
  process.env.GITHUB_CUSTOM_USER_AGENT ?? "involutionhell-discussion-agent";
