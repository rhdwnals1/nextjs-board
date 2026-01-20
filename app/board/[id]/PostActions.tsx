"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { deletePost } from "@/services/posts";

export function PostActions({ postId }: { postId: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    const ok = window.confirm("정말 삭제할까요?");
    if (!ok) return;

    try {
      await deletePost(postId);
    } catch (e) {
      alert(e instanceof Error ? e.message : "삭제에 실패했습니다.");
      return;
    }

    router.push("/board");
    router.refresh();
  };

  return (
    <div className="flex gap-2">
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
