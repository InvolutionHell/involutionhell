import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  addDiscussionReply,
  fetchDiscussionWithComments,
  getServerGitHubToken,
  GitHubDiscussionError,
  searchDiscussionByDocId,
} from "@/lib/discussion/github-discussions";

interface RouteContext {
  params: Promise<{
    docId: string;
  }>;
}

interface CreateReplyBody {
  body?: string;
  commentId?: string;
}

export async function POST(request: Request, context: RouteContext) {
  const { docId: rawDocId } = await context.params;
  const docId = rawDocId?.trim();
  if (!docId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "docId 参数缺失" },
      { status: 400 },
    );
  }

  let payload: CreateReplyBody;
  try {
    payload = (await request.json()) as CreateReplyBody;
  } catch (error) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "请求体必须是合法的 JSON" },
      { status: 400 },
    );
  }

  const replyBody = payload.body?.trim();
  const commentId = payload.commentId?.trim();
  if (!replyBody || !commentId) {
    return NextResponse.json(
      {
        code: "BAD_REQUEST",
        message: "commentId 与回复内容均不能为空",
      },
      { status: 400 },
    );
  }

  const session = await auth();
  const accessToken =
    (session as typeof session & { accessToken?: string | null })
      ?.accessToken ?? null;
  if (!session || !accessToken) {
    return NextResponse.json(
      {
        code: "UNAUTHORIZED",
        message: "需要先登录 GitHub 才能回复评论",
      },
      { status: 401 },
    );
  }

  try {
    const serverToken = getServerGitHubToken();
    const discussion = await searchDiscussionByDocId(docId, serverToken);

    if (!discussion) {
      return NextResponse.json(
        {
          code: "NOT_FOUND",
          message: "该文档尚未创建讨论串，无法回复",
        },
        { status: 404 },
      );
    }

    const reply = await addDiscussionReply({
      commentId,
      body: replyBody,
      token: accessToken,
    });

    const refreshed = await fetchDiscussionWithComments(discussion.id, {
      token: serverToken,
    });

    return NextResponse.json(
      {
        docId,
        discussion: refreshed.discussion,
        comments: refreshed.comments,
        created: reply,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof GitHubDiscussionError) {
      const status = error.status === 502 ? 502 : error.status || 500;
      return NextResponse.json(
        {
          code: "GITHUB_ERROR",
          message: error.message,
          details: error.details,
        },
        { status },
      );
    }
    console.error("[discussions][POST reply]", error);
    return NextResponse.json(
      {
        code: "INTERNAL_ERROR",
        message: "无法提交回复",
      },
      { status: 500 },
    );
  }
}
