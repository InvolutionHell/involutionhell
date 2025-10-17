"use client";

import * as React from "react";

interface SiteCommentsProps {
  docId: string;
  user?: { name?: string | null; image?: string | null } | null;
}

type Comment = {
  id: number;
  doc_id: string;
  content: string;
  user_id: string;
  user_name: string | null;
  user_image: string | null;
  parent_id: number | null;
  created_at: string;
};

export default function SiteComments({ docId, user }: SiteCommentsProps) {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [content, setContent] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchComments = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/comments?docId=${encodeURIComponent(docId)}`,
        {
          cache: "no-store",
        },
      );
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "加载失败");
      setComments(data.data as Comment[]);
    } catch (e: any) {
      setError(e?.message || "加载失败");
    } finally {
      setLoading(false);
    }
  }, [docId]);

  React.useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId, content: text }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "提交失败");
      setContent("");
      // 直接插入到顶部
      setComments((prev) => [data.data as Comment, ...prev]);
    } catch (e: any) {
      setError(e?.message || "提交失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex items-center gap-3">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt="avatar"
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted" />
          )}
          <span className="text-sm text-muted-foreground">
            {user?.name || "已登录用户"}
          </span>
        </div>
        <textarea
          className="w-full min-h-[100px] rounded-md border bg-transparent p-3"
          placeholder="发表你的看法……"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={4000}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {content.trim().length}/4000
          </span>
          <button
            type="submit"
            className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-accent disabled:opacity-60"
            disabled={!content.trim() || submitting}
          >
            {submitting ? "提交中…" : "发表评论"}
          </button>
        </div>
        {error && <div className="text-sm text-red-500">{error}</div>}
      </form>

      <div className="divide-y divide-border rounded-md border">
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">加载中…</div>
        ) : comments.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            还没有评论，来当第一个吧。
          </div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="p-4">
              <div className="mb-2 flex items-center gap-2">
                {c.user_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.user_image}
                    alt="avatar"
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-muted" />
                )}
                <span className="text-sm font-medium">
                  {c.user_name || "匿名"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleString()}
                </span>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {c.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
