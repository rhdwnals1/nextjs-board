"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { commentsListQuery, boardKeys } from "@/queries/board";
import { createComment, deleteComment } from "@/services/posts";
import { useAuth } from "@/hooks/useAuth";

export function CommentsSection({ postId }: { postId: number }) {
  const { isAuthenticated } = useAuth(false);
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const {
    data: comments = [],
    isLoading,
    isError,
  } = useQuery(commentsListQuery(postId));

  const createMutation = useMutation({
    mutationFn: () => createComment(postId, { content }),
    onSuccess: async () => {
      setContent("");
      await queryClient.invalidateQueries({
        queryKey: boardKeys.comments(postId),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: boardKeys.comments(postId),
      });
    },
  });

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync();
    } catch (e) {
      alert(e instanceof Error ? e.message : "댓글 작성에 실패했습니다.");
    }
  };

  const handleDelete = async (commentId: number) => {
    const ok = window.confirm("댓글을 삭제할까요?");
    if (!ok) return;

    try {
      await deleteMutation.mutateAsync(commentId);
    } catch (e) {
      alert(e instanceof Error ? e.message : "댓글 삭제에 실패했습니다.");
    }
  };

  return (
    <Card>
      <CardHeader className={styles.header}>
        <CardTitle className={styles.title}>댓글</CardTitle>
      </CardHeader>

      <CardContent className={styles.content}>
        {isLoading && <div className={styles.muted}>로딩중...</div>}
        {isError && (
          <div className={styles.error}>불러오기에 실패했습니다.</div>
        )}

        {!isLoading && !isError && comments.length === 0 && (
          <div className={styles.muted}>아직 댓글이 없습니다.</div>
        )}

        <div className={styles.list}>
          {comments.map((c) => (
            <div key={c.id} className={styles.item}>
              <div className={styles.itemMeta}>
                <span className={styles.itemDate}>
                  {new Date(c.createdAt).toLocaleString()}
                </span>
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(c.id)}
                  >
                    삭제
                  </Button>
                )}
              </div>
              <p className={styles.itemText}>{c.content}</p>
            </div>
          ))}
        </div>

        {isAuthenticated ? (
          <div className={styles.form}>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="댓글을 입력하세요"
              rows={3}
              disabled={createMutation.isPending}
            />
            <div className={styles.formActions}>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                댓글 작성
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.loginPrompt}>
            <p className={styles.loginText}>댓글을 작성하려면 로그인이 필요합니다.</p>
          </div>
        )}
      </CardContent>

      <CardFooter className={styles.footer}>총 {comments.length}개</CardFooter>
    </Card>
  );
}

const styles = {
  header: "pb-3",
  title: "text-lg",
  content: "space-y-4",
  muted: "text-sm text-zinc-500 dark:text-zinc-400",
  error: "text-sm text-red-600",
  list: "space-y-3",
  item: "rounded-md border border-zinc-200 p-3 dark:border-zinc-800",
  itemMeta: "flex items-center justify-between gap-3",
  itemDate: "text-xs text-zinc-500 dark:text-zinc-400",
  itemText: "mt-2 whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200",
  form: "space-y-2 pt-2",
  formActions: "flex justify-end",
  loginPrompt: "pt-2",
  loginText: "text-sm text-zinc-500 dark:text-zinc-400",
  footer: "justify-end text-xs text-zinc-500 dark:text-zinc-400",
};
