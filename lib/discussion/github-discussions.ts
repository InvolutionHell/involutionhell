import { githubConstants } from "@/lib/github";
import {
  DiscussionCommentDTO,
  DiscussionCommentsDTO,
  DiscussionReplyDTO,
  DiscussionSummaryDTO,
} from "@/lib/discussion/discussion.dto";
import {
  DEFAULT_COMMENT_PAGE_SIZE,
  DEFAULT_DISCUSSION_CATEGORY_NAME,
  DEFAULT_REPLY_PAGE_SIZE,
  GITHUB_GRAPHQL_ENDPOINT,
  USER_AGENT_HEADER,
} from "@/lib/discussion/github-discussions.constants";
import {
  ADD_DISCUSSION_COMMENT_MUTATION,
  ADD_DISCUSSION_REPLY_MUTATION,
  CREATE_DISCUSSION_MUTATION,
  DISCUSSION_WITH_COMMENTS_QUERY,
  REPOSITORY_METADATA_QUERY,
  SEARCH_DISCUSSION_QUERY,
} from "@/lib/discussion/github-discussions.queries";

/**
 * GitHub Discussion GraphQL API 封装。
 * 目标：
 * 1. 给 Next.js Route Handler 提供稳定的读写讨论数据接口。
 * 2. 明确区分站点服务端 token 与用户 OAuth token 的职责。
 * 3. 尽量复用缓存，避免重复的 GitHub 请求。
 */

type GraphQLVariables = Record<string, unknown>;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    type?: string;
    message: string;
    path?: string[];
    locations?: Array<{ line: number; column: number }>;
  }>;
}

export class GitHubDiscussionError extends Error {
  /**
   * 自定义错误类型，用于在上层区分 GitHub API 抛出的错误场景。
   * status 会被直接映射到 HTTP 状态码，details 用来记录 GraphQL 返回的细节。
   */
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "GitHubDiscussionError";
  }
}

function ensureToken(token: string | undefined | null, context: string) {
  // 调用 GitHub API 前统一校验 token，context 帮助定位缺失来源
  if (!token) {
    throw new GitHubDiscussionError(`GitHub token missing for ${context}`, 500);
  }
  return token;
}

async function requestGraphQL<T>(
  token: string,
  query: string,
  variables?: GraphQLVariables,
) {
  // 统一的 GraphQL 请求封装：附带鉴权头、禁用缓存，并把 GitHub 错误转成 GitHubDiscussionError
  const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT_HEADER,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    // 这里保存响应体内容，方便上层在日志里还原失败原因
    throw new GitHubDiscussionError(text || "GitHub request failed", 502, {
      status: response.status,
      body: text,
    });
  }

  const json = (await response.json()) as GraphQLResponse<T>;
  if (json.errors && json.errors.length > 0) {
    throw new GitHubDiscussionError(
      json.errors[0]?.message ?? "GitHub error",
      502,
      json.errors,
    );
  }
  if (!json.data) {
    throw new GitHubDiscussionError("Empty GitHub response", 502);
  }

  return json.data;
}

interface RepositoryMetadata {
  repositoryId: string;
  categoryId: string;
  categoryName: string;
}
// 仓库与分类 ID 基本不会频繁变更，这里用进程级缓存减少 API 调用
let cachedRepositoryMetadata: RepositoryMetadata | null = null;

async function resolveRepositoryMetadata(token: string) {
  // 优先命中缓存，避免重复查询
  if (cachedRepositoryMetadata) {
    return cachedRepositoryMetadata;
  }

  const envRepositoryId =
    process.env.GITHUB_DISCUSSION_REPOSITORY_ID ??
    process.env.GITHUB_REPOSITORY_ID;
  const envCategoryId = process.env.GITHUB_DISCUSSION_CATEGORY_ID;

  // 如果部署时显式配置了 ID，则无需再请求 GraphQL，直接返回
  if (envRepositoryId && envCategoryId) {
    cachedRepositoryMetadata = {
      repositoryId: envRepositoryId,
      categoryId: envCategoryId,
      categoryName: DEFAULT_DISCUSSION_CATEGORY_NAME,
    };
    return cachedRepositoryMetadata;
  }

  const repositoryData = await requestGraphQL<{
    repository: {
      id: string;
      discussionCategories: {
        nodes: Array<{
          id: string;
          name: string;
          slug: string;
        }>;
      };
    } | null;
  }>(token, REPOSITORY_METADATA_QUERY, {
    owner: process.env.GITHUB_DISCUSSION_REPO_OWNER ?? githubConstants.owner,
    repo: process.env.GITHUB_DISCUSSION_REPO_NAME ?? githubConstants.repo,
  });

  if (!repositoryData.repository) {
    throw new GitHubDiscussionError("GitHub repository not found", 404);
  }

  const targetCategory =
    repositoryData.repository.discussionCategories.nodes.find((node) => {
      const name = node.name?.toLowerCase();
      const slug = node.slug?.toLowerCase();
      const target = DEFAULT_DISCUSSION_CATEGORY_NAME.toLowerCase();
      return name === target || slug === target;
    }) ?? repositoryData.repository.discussionCategories.nodes[0]; // 找不到同名分类时兜底使用第一个分类

  if (!targetCategory) {
    throw new GitHubDiscussionError(
      `Discussion category "${DEFAULT_DISCUSSION_CATEGORY_NAME}" not found in repository`,
      500,
    );
  }

  cachedRepositoryMetadata = {
    repositoryId: repositoryData.repository.id,
    categoryId: targetCategory.id,
    categoryName: targetCategory.name,
  };

  return cachedRepositoryMetadata;
}

export type DiscussionReply = DiscussionReplyDTO;
export type DiscussionComment = DiscussionCommentDTO;
export type DiscussionSummary = DiscussionSummaryDTO;

export interface DiscussionWithComments {
  discussion: DiscussionSummary | null;
  comments: DiscussionCommentsDTO | null;
}

export async function searchDiscussionByDocId(docId: string, token?: string) {
  // docId 写在 Discussion 标题中，因此利用 GitHub search API + in:title 精准匹配
  const serverToken = ensureToken(
    token ?? process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN,
    "searchDiscussionByDocId",
  );

  const query = [
    `repo:${process.env.GITHUB_DISCUSSION_REPO_OWNER ?? githubConstants.owner}/${process.env.GITHUB_DISCUSSION_REPO_NAME ?? githubConstants.repo}`,
    `in:title "${docId}"`,
  ].join(" ");

  const data = await requestGraphQL<{
    search: {
      nodes: Array<DiscussionSummary>;
    };
  }>(serverToken, SEARCH_DISCUSSION_QUERY, { query });

  const [discussion] = data.search.nodes;
  return discussion ?? null;
}

interface FetchDiscussionOptions {
  commentPageSize?: number;
  commentCursor?: string;
  replyPageSize?: number;
  token?: string;
}

export async function fetchDiscussionWithComments(
  discussionId: string,
  options: FetchDiscussionOptions = {},
) {
  // 读取评论时允许覆盖分页参数，若无参数则退回默认设置
  const serverToken = ensureToken(
    options.token ?? process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN,
    "fetchDiscussionWithComments",
  );

  const data = await requestGraphQL<{
    node: {
      id: string;
      number: number;
      title: string;
      url: string;
      body: string;
      createdAt: string;
      author: {
        login: string;
        avatarUrl: string;
        url: string;
      } | null;
      comments: {
        totalCount: number;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
        nodes: Array<{
          id: string;
          body: string;
          bodyHTML: string;
          bodyText: string;
          createdAt: string;
          url: string;
          isAnswer: boolean;
          author: {
            login: string;
            avatarUrl: string;
            url: string;
          } | null;
          replies: {
            totalCount: number;
            pageInfo: {
              hasNextPage: boolean;
              endCursor: string | null;
            };
            nodes: DiscussionReplyDTO[];
          };
        }>;
      };
    } | null;
  }>(serverToken, DISCUSSION_WITH_COMMENTS_QUERY, {
    id: discussionId,
    commentPageSize: options.commentPageSize ?? DEFAULT_COMMENT_PAGE_SIZE,
    commentCursor: options.commentCursor,
    replyPageSize: options.replyPageSize ?? DEFAULT_REPLY_PAGE_SIZE,
  });

  if (!data.node) {
    // Discussion 被删除或传入 ID 失效时返回空结构，方便前端识别 404
    return {
      discussion: null,
      comments: null,
    } satisfies DiscussionWithComments;
  }

  return {
    discussion: {
      id: data.node.id,
      number: data.node.number,
      title: data.node.title,
      url: data.node.url,
      createdAt: data.node.createdAt,
    },
    comments: {
      totalCount: data.node.comments.totalCount,
      pageInfo: data.node.comments.pageInfo,
      nodes: data.node.comments.nodes.map((comment) => ({
        id: comment.id,
        body: comment.body,
        bodyHTML: comment.bodyHTML,
        bodyText: comment.bodyText,
        createdAt: comment.createdAt,
        url: comment.url,
        isAnswer: comment.isAnswer,
        author: comment.author,
        replies: comment.replies,
      })),
    },
  } satisfies DiscussionWithComments;
}

interface CreateDiscussionParams {
  docId: string;
  body: string;
  token?: string;
}

export async function createDiscussionForDocId({
  docId,
  body,
  token,
}: CreateDiscussionParams) {
  const serverToken = ensureToken(
    token ?? process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN,
    "createDiscussionForDocId",
  );
  const metadata = await resolveRepositoryMetadata(serverToken);

  const data = await requestGraphQL<{
    createDiscussion: {
      discussion: DiscussionSummary;
    } | null;
  }>(serverToken, CREATE_DISCUSSION_MUTATION, {
    repositoryId: metadata.repositoryId,
    categoryId: metadata.categoryId,
    title: docId,
    body,
  });

  return data.createDiscussion?.discussion ?? null;
}

interface AddCommentParams {
  discussionId: string;
  body: string;
  token: string;
}

export async function addDiscussionComment({
  discussionId,
  body,
  token,
}: AddCommentParams) {
  const userToken = ensureToken(token, "addDiscussionComment");
  const data = await requestGraphQL<{
    addDiscussionComment: {
      comment: DiscussionComment | null;
    } | null;
  }>(userToken, ADD_DISCUSSION_COMMENT_MUTATION, {
    discussionId,
    body,
  });

  return data.addDiscussionComment?.comment ?? null;
}

interface AddReplyParams {
  commentId: string;
  body: string;
  token: string;
}

export async function addDiscussionReply({
  commentId,
  body,
  token,
}: AddReplyParams) {
  const userToken = ensureToken(token, "addDiscussionReply");
  const data = await requestGraphQL<{
    addDiscussionReply: {
      comment: DiscussionReply | null;
    } | null;
  }>(userToken, ADD_DISCUSSION_REPLY_MUTATION, {
    commentId,
    body,
  });

  return data.addDiscussionReply?.comment ?? null;
}

interface EnsureDiscussionOptions {
  docId: string;
  docPath?: string;
  docTitle?: string;
  docUrl?: string;
  token?: string;
}

function buildDiscussionBody({
  docId,
  docPath,
  docTitle,
  docUrl,
}: Omit<EnsureDiscussionOptions, "token">) {
  // 懒创建 Discussion 时填充的默认正文，记录 docId 与文档元数据
  const lines = [
    `<!-- docId:${docId} -->`,
    `This discussion is automatically created for document updates.`,
  ];
  if (docTitle) {
    lines.push(`- **Title:** ${docTitle}`);
  }
  if (docPath) {
    lines.push(`- **Path:** \`${docPath}\``);
  }
  if (docUrl) {
    lines.push(`- **URL:** ${docUrl}`);
  }
  lines.push(
    "",
    "Feel free to discuss the content here. Notifications are handled by GitHub.",
  );
  return lines.join("\n");
}

export async function ensureDiscussionForDoc({
  docId,
  docPath,
  docTitle,
  docUrl,
  token,
}: EnsureDiscussionOptions) {
  const serverToken = ensureToken(
    token ?? process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN,
    "ensureDiscussionForDoc",
  );

  const existing = await searchDiscussionByDocId(docId, serverToken);
  if (existing) {
    // 已存在时直接返回，避免重复创建
    return existing;
  }

  const body = buildDiscussionBody({ docId, docPath, docTitle, docUrl });
  const discussion = await createDiscussionForDocId({
    docId,
    body,
    token: serverToken,
  });
  if (!discussion) {
    throw new GitHubDiscussionError(
      "Failed to create discussion for docId",
      500,
    );
  }
  return discussion;
}

export function getServerGitHubToken() {
  // 服务器只读 API 统一从环境变量里取 token，方便集中管理权限
  return ensureToken(
    process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN,
    "server",
  );
}
