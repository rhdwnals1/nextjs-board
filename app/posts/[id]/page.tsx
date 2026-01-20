import Link from "next/link";
import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PostActions } from "./PostActions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isInteger(postId) || postId <= 0) {
    notFound();
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          className="text-sm text-zinc-600 hover:underline dark:text-zinc-300"
          href="/posts"
        >
          ← 목록
        </Link>
        <PostActions postId={post.id} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{post.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap leading-7 text-zinc-800 dark:text-zinc-200">
            {post.content}
          </p>
        </CardContent>
        <CardFooter className="justify-end text-xs text-zinc-500 dark:text-zinc-400">
          작성일: {new Date(post.createdAt).toLocaleString()}
        </CardFooter>
      </Card>
    </div>
  );
}
