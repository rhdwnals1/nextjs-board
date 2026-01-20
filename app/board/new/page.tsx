"use client";

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

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createPost({ title, content });
    } catch (e) {
      alert(e instanceof Error ? e.message : "작성에 실패했습니다.");
      return;
    }

    router.push("/board");
    router.refresh();
  };

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">글 작성</h1>
        <Link
          className="text-sm text-zinc-600 hover:underline dark:text-zinc-300"
          href="/board"
        >
          목록
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>새 게시글</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">제목</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">내용</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용"
                rows={8}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit">작성</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
