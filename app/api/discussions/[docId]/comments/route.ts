import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  addDiscussionComment,
  ensureDiscussionForDoc,
  fetchDiscussionWithComments,
  getServerGitHubToken,
  GitHubDiscussionError,
} from "@/components/discussion/github-discussions";

interface RouteParams {
  params: {
    docId: string;
  };
}

interface CreateCommentBody {
  body?: string;
  docPath?: string;
  docTitle?: string;
  docUrl?: string;
}

export async function POST(request: Request, { params }: RouteParams) {
  const docId = params?.docId?.trim();
  if (!docId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "docId 参数缺失" },
      { status: 400 },
    );
  }

  let payload: CreateCommentBody;
  try {
    payload = (await request.json()) as CreateCommentBody;
  } catch (error) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "请求体必须是合法的 JSON" },
      { status: 400 },
    );
  }

  const commentBody = payload.body?.trim();
  if (!commentBody) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "评论内容不能为空" },
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
        message: "需要先登录 GitHub 才能发表评论",
      },
      { status: 401 },
    );
  }

  try {
    const serverToken = getServerGitHubToken();
    const discussion = await ensureDiscussionForDoc({
      docId,
      docPath: payload.docPath,
      docTitle: payload.docTitle,
      docUrl: payload.docUrl,
      token: serverToken,
    });

    const newComment = await addDiscussionComment({
      discussionId: discussion.id,
      body: commentBody,
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
        created: newComment,
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
    console.error("[discussions][POST comment]", error);
    return NextResponse.json(
      {
        code: "INTERNAL_ERROR",
        message: "无法提交评论",
      },
      { status: 500 },
    );
  }
}
