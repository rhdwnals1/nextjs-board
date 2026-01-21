"use client";

import Link from "next/link";
import { use, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getPost, updatePost } from "@/services/posts";
import { boardKeys, postDetailQuery } from "@/queries/board";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const postId = Number(id);
  const isValidId = Number.isInteger(postId) && postId > 0;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isValidId) router.replace("/board");
  }, [isValidId, router]);

  const { isLoading } = useQuery({
    ...postDetailQuery(postId),
    queryFn: async () => {
      const data = await getPost(postId);
      setTitle(data.title ?? "");
      setContent(data.content ?? "");
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => updatePost(postId, { title, content }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: boardKeys.posts() });
      await queryClient.invalidateQueries({ queryKey: boardKeys.post(postId) });
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync();
    } catch (e) {
      alert(e instanceof Error ? e.message : "수정에 실패했습니다.");
      return;
    }

    router.push(`/board/${postId}`);
    router.refresh();
  };

  const loading = isLoading || updateMutation.isPending;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <Link className={styles.link} href={`/board/${postId}`}>
          ← 상세로
        </Link>
        <Link className={styles.link} href="/board">
          목록
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>글 수정</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className={styles.formContent}>
            <div className={styles.field}>
              <label className={styles.label}>제목</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>내용</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용"
                rows={8}
                disabled={loading}
              />
            </div>
          </CardContent>

          <CardFooter className={styles.footer}>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              저장
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

const styles = {
  container: "mx-auto w-full max-w-2xl p-6",
  headerRow: "mb-4 flex items-center justify-between gap-3",
  link: "text-sm text-zinc-600 hover:underline dark:text-zinc-300",
  formContent: "space-y-4",
  field: "space-y-2",
  label: "text-sm font-medium",
  footer: "justify-end gap-2",
};
