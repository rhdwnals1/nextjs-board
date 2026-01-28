"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

type LikeButtonProps = {
  boardId: number;
  initialLikeCount: number;
  initialLiked: boolean;
};

export function LikeButton({
  boardId,
  initialLikeCount,
  initialLiked,
}: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [liked, setLiked] = useState(initialLiked);
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/board/${boardId}/like`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("좋아요 처리에 실패했습니다.");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setLiked(data.liked);
      setLikeCount((prev) => (data.liked ? prev + 1 : prev - 1));
      // 게시글 상세 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    },
  });

  return (
    <Button
      variant={liked ? "default" : "outline"}
      size="sm"
      onClick={() => likeMutation.mutate()}
      disabled={likeMutation.isPending}
      className={styles.button}
    >
      <Heart className={styles.heart(liked)} />
      <span>{likeCount}</span>
    </Button>
  );
}

const styles = {
  button: "gap-2",
  heart: (liked: boolean) => `h-4 w-4 ${liked ? "fill-current" : ""}`,
};
