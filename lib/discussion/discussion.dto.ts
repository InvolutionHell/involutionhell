import { z } from "zod";

// 讨论作者信息。GitHub 返回可能为空，因此允许 null。
export const DiscussionAuthorSchema = z
  .object({
    login: z.string(),
    avatarUrl: z.string().url(),
    url: z.string().url(),
  })
  .nullable();

// 回复节点。
export const DiscussionReplySchema = z.object({
  id: z.string(),
  body: z.string(),
  bodyHTML: z.string(),
  bodyText: z.string(),
  createdAt: z.string(),
  url: z.string().url(),
  author: DiscussionAuthorSchema,
});

export const PageInfoSchema = z.object({
  hasNextPage: z.boolean(),
  endCursor: z.string().nullable(),
});

// 评论节点，内含嵌套回复分页。
export const DiscussionCommentSchema = z.object({
  id: z.string(),
  body: z.string(),
  bodyHTML: z.string(),
  bodyText: z.string(),
  createdAt: z.string(),
  url: z.string().url(),
  isAnswer: z.boolean().optional(),
  author: DiscussionAuthorSchema,
  replies: z.object({
    totalCount: z.number().int().nonnegative(),
    pageInfo: PageInfoSchema,
    nodes: z.array(DiscussionReplySchema),
  }),
});

export const DiscussionSummarySchema = z
  .object({
    id: z.string(),
    number: z.number().int().nonnegative(),
    title: z.string(),
    url: z.string().url(),
    createdAt: z.string(),
  })
  .nullable();

export const CommentsCollectionSchema = z.object({
  totalCount: z.number().int().nonnegative(),
  pageInfo: PageInfoSchema,
  nodes: z.array(DiscussionCommentSchema),
});

// 成功响应 DTO，所有字段均有明确定义。
export const DiscussionResponseSchema = z.object({
  docId: z.string(),
  discussion: DiscussionSummarySchema,
  comments: CommentsCollectionSchema,
});

export type DiscussionAuthorDTO = z.infer<typeof DiscussionAuthorSchema>;
export type DiscussionReplyDTO = z.infer<typeof DiscussionReplySchema>;
export type DiscussionCommentDTO = z.infer<typeof DiscussionCommentSchema>;
export type DiscussionSummaryDTO = NonNullable<
  z.infer<typeof DiscussionSummarySchema>
>;
export type DiscussionCommentsDTO = z.infer<typeof CommentsCollectionSchema>;
export type DiscussionResponseDTO = z.infer<typeof DiscussionResponseSchema>;
