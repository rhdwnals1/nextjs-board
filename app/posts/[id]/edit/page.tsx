"use client";

import Link from "next/link";
import { use, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

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

type Post = {
  id: number;
  title: string;
  content: string;
};

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const postId = Number(id);

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!Number.isInteger(postId) || postId <= 0) {
      router.replace("/posts");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        if (!res.ok) {
          router.replace("/posts");
          return;
        }
        const data = (await res.json()) as Post;
        setTitle(data.title ?? "");
        setContent(data.content ?? "");
      } finally {
        setLoading(false);
      }
    })();
  }, [postId, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      alert(data?.error ?? "수정에 실패했습니다.");
      return;
    }

    router.push(`/posts/${postId}`);
    router.refresh();
  };

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          className="text-sm text-zinc-600 hover:underline dark:text-zinc-300"
          href={`/posts/${postId}`}
        >
          ← 상세로
        </Link>
        <Link
          className="text-sm text-zinc-600 hover:underline dark:text-zinc-300"
          href="/posts"
        >
          목록
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>글 수정</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">제목</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">내용</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용"
                rows={8}
                disabled={loading}
              />
            </div>
          </CardContent>

          <CardFooter className="justify-end gap-2">
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
