"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
import { createPost } from "@/services/posts";
import { boardKeys } from "@/queries/board";

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => createPost({ title, content }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: boardKeys.posts() });
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync();
    } catch (e) {
      alert(e instanceof Error ? e.message : "작성에 실패했습니다.");
      return;
    }

    router.push("/board");
    router.refresh();
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>글 작성</h1>
        <Link className={styles.backLink} href="/board">
          목록
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>새 게시글</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className={styles.formContent}>
            <div className={styles.field}>
              <label className={styles.label}>제목</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>내용</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용"
                rows={8}
              />
            </div>
          </CardContent>
          <CardFooter className={styles.footer}>
            <Button type="submit">작성</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

const styles = {
  container: "mx-auto w-full max-w-2xl p-6",
  headerRow: "mb-4 flex items-center justify-between gap-3",
  title: "text-xl font-semibold",
  backLink: "text-sm text-zinc-600 hover:underline dark:text-zinc-300",
  formContent: "space-y-4",
  field: "space-y-2",
  label: "text-sm font-medium",
  footer: "justify-end",
};
