"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Trash2, Reply, Send } from "lucide-react";
import { SignInButtonClient } from "./SignInButtonClient";

interface User {
  id: number;
  name: string | null;
  image: string | null;
}

interface Comment {
  id: number;
  doc_id: string;
  user_id: number;
  content: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  user: User;
  replies?: Comment[];
}

interface CommentsProps {
  docId: string;
  className?: string;
}

function CommentItem({
  comment,
  currentUserId,
  onDelete,
  onReply,
}: {
  comment: Comment;
  currentUserId?: number;
  onDelete: (id: number) => void;
  onReply: (parentId: number) => void;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes === 0 ? "刚刚" : `${minutes}分钟前`;
      }
      return `${hours}小时前`;
    } else if (days < 30) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString("zh-CN");
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docId: comment.doc_id,
          content: replyContent,
          parentId: comment.id,
        }),
      });

      if (response.ok) {
        setReplyContent("");
        setShowReplyForm(false);
        onReply(comment.id);
      }
    } catch (error) {
      console.error("Error posting reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {comment.user.image ? (
          <img
            src={comment.user.image}
            alt={comment.user.name || "User"}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <span className="text-sm font-medium">
              {comment.user.name?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.user.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.created_at)}
            </span>
          </div>
          <div className="text-sm text-foreground whitespace-pre-wrap break-words">
            {comment.content}
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <Reply className="h-3 w-3 mr-1" />
              回复
            </Button>
            {currentUserId === comment.user_id && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                onClick={() => onDelete(comment.id)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                删除
              </Button>
            )}
          </div>
          {showReplyForm && (
            <div className="mt-3 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="写下你的回复..."
                className="w-full min-h-[80px] p-3 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                disabled={isSubmitting}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent("");
                  }}
                  disabled={isSubmitting}
                >
                  取消
                </Button>
                <Button
                  size="sm"
                  onClick={handleReplySubmit}
                  disabled={!replyContent.trim() || isSubmitting}
                >
                  <Send className="h-3 w-3 mr-1" />
                  发送
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-12 space-y-4 border-l-2 border-border pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onDelete={onDelete}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Comments({ docId, className }: CommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>();

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `/api/comments?docId=${encodeURIComponent(docId)}`,
      );
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [docId]);

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/user/id?email=${encodeURIComponent(session.user.email)}`)
        .then((res) => res.json())
        .then((data) => setCurrentUserId(data.id))
        .catch(console.error);
    }
  }, [session]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docId,
          content: newComment,
        }),
      });

      if (response.ok) {
        setNewComment("");
        await fetchComments();
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm("确定要删除这条评论吗？")) return;

    try {
      const response = await fetch(`/api/comments?id=${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchComments();
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div className={className}>
      <h3 className="text-xl font-semibold mb-6">评论区</h3>

      {/* 评论输入框 */}
      {session ? (
        <div className="mb-8 space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="分享你的想法..."
            className="w-full min-h-[120px] p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              发表评论
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-6 border rounded-lg bg-muted/30 text-center">
          <p className="text-muted-foreground mb-3">登录后即可参与评论</p>
          <SignInButtonClient />
        </div>
      )}

      {/* 评论列表 */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          还没有评论，来发表第一条评论吧！
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onDelete={handleDelete}
              onReply={fetchComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
