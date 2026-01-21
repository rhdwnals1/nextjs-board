import Link from "next/link";
import { notFound } from "next/navigation";

import { eq } from "drizzle-orm";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BoardActions } from "./BoardActions";
import { CommentsSection } from "./CommentsSection";
import { db } from "@/lib/db";
import { posts } from "@drizzle/schema";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isInteger(postId) || postId <= 0) {
    notFound();
  }

  const post = (
    await db.select().from(posts).where(eq(posts.id, postId)).limit(1)
  )[0];

  if (!post) notFound();

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <Link className={styles.backLink} href="/board">
          ← 목록
        </Link>
        <BoardActions postId={post.id} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{post.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={styles.content}>{post.content}</p>
        </CardContent>
        <CardFooter className={styles.footer}>
          작성일: {new Date(post.createdAt).toLocaleString()}
        </CardFooter>
      </Card>

      <CommentsSection postId={post.id} />
    </div>
  );
}

const styles = {
  container: "mx-auto w-full max-w-2xl p-6 space-y-4",
  headerRow: "flex items-center justify-between gap-3",
  backLink: "text-sm text-zinc-600 hover:underline dark:text-zinc-300",
  content: "whitespace-pre-wrap leading-7 text-zinc-800 dark:text-zinc-200",
  footer: "justify-end text-xs text-zinc-500 dark:text-zinc-400",
};
