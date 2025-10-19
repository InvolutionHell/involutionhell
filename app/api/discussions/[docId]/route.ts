import { NextResponse } from "next/server";
import { DiscussionResponseSchema } from "@/components/discussion/discussion.dto";
import {
  fetchDiscussionWithComments,
  getServerGitHubToken,
  GitHubDiscussionError,
  searchDiscussionByDocId,
} from "@/components/discussion/github-discussions";
import { ZodError } from "zod";

interface RouteParams {
  params: {
    docId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  // 约定 docId 从路径参数传入，前端会保证是 cuid2
  const docId = params?.docId?.trim();
  if (!docId) {
    // 缺少 docId 时直接返回 400，便于前端快速定位问题
    return NextResponse.json(
      {
        code: "BAD_REQUEST",
        message: "docId 参数缺失",
      },
      { status: 400 },
    );
  }

  const url = new URL(request.url);
  // 支持前端透传分页参数，避免写死分页策略
  const commentCursor = url.searchParams.get("cursor") ?? undefined;
  const commentPageSize =
    Number.parseInt(url.searchParams.get("pageSize") ?? "") || undefined;
  const replyPageSize =
    Number.parseInt(url.searchParams.get("replyPageSize") ?? "") || undefined;

  try {
    // 站点持有的 GitHub token，仅用于只读查询
    const token = getServerGitHubToken();
    const summary = await searchDiscussionByDocId(docId, token);

    if (!summary) {
      const payload = DiscussionResponseSchema.parse({
        docId,
        discussion: null,
        comments: {
          totalCount: 0,
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
          nodes: [],
        },
      });
      // 没查到 Discussion 时，返回空结构，交由前端触发懒创建或展示「暂无评论」
      return NextResponse.json(payload, { status: 200 });
    }

    const detailed = await fetchDiscussionWithComments(summary.id, {
      token,
      commentCursor,
      commentPageSize,
      replyPageSize,
    });

    const payload = DiscussionResponseSchema.parse({
      docId,
      discussion: detailed.discussion,
      comments: detailed.comments ?? {
        totalCount: 0,
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
        nodes: [],
      },
    });

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          code: "INVALID_RESPONSE_DTO",
          message: "讨论数据不符合约定的响应格式",
          details: error.issues,
        },
        { status: 500 },
      );
    }
    if (error instanceof GitHubDiscussionError) {
      // GraphQL 层面已给出明确状态码，直接透传给客户端
      return NextResponse.json(
        {
          code: "GITHUB_ERROR",
          message: error.message,
          details: error.details,
        },
        { status: error.status },
      );
    }
    console.error("[discussions][GET]", error);
    return NextResponse.json(
      {
        code: "INTERNAL_ERROR",
        message: "无法获取 Discussion 数据",
      },
      { status: 500 },
    );
  }
}
