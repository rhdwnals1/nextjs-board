"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPosts } from "@/services/posts";

import type { Post } from "@/types/post";

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    getPosts()
      .then(setPosts)
      .catch(() => setPosts([]));
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">게시판</h1>
        <Button asChild>
          <Link href="/board/new">글 작성</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/board/${post.id}`} className="block">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">
                  {post.content}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
