"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { deletePost } from "@/services/posts";
import { boardKeys } from "@/queries/board";

export function BoardActions({ postId }: { postId: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: boardKeys.posts() });
    },
  });

  const handleDelete = async () => {
    const ok = window.confirm("정말 삭제할까요?");
    if (!ok) return;

    try {
      await deleteMutation.mutateAsync();
    } catch (e) {
      alert(e instanceof Error ? e.message : "삭제에 실패했습니다.");
      return;
    }

    router.push("/board");
    router.refresh();
  };

  return (
    <div className={styles.container}>
      <Button
        variant="outline"
        onClick={() => router.push(`/board/${postId}/edit`)}
      >
        수정
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        삭제
      </Button>
    </div>
  );
}

const styles = {
  container: "flex gap-2",
};
