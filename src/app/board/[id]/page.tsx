import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BoardActions } from "./BoardActions";
import { CommentsSection } from "./CommentsSection";
import { LikeButton } from "./LikeButton";
import { getCurrentUser } from "@/lib/auth";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  const { id } = await params;
  const postId = Number(id);

  if (!Number.isInteger(postId) || postId <= 0) {
    notFound();
  }

  // API 라우트 호출 (조회수 증가 포함)
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const cookieHeader = headersList.get("cookie") || "";
  const response = await fetch(`${protocol}://${host}/api/board/${postId}`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!response.ok) {
    notFound();
  }

  const post = await response.json();

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
          <div className={styles.footerContent}>
            <LikeButton
              key={`${post.id}-${post.likeCount}-${post.userLiked}`}
              boardId={post.id}
              initialLikeCount={post.likeCount ?? 0}
              initialLiked={post.userLiked ?? false}
            />
            <div className={styles.metadata}>
              <span>조회수: {post.viewCount}</span>
              <span>작성일: {new Date(post.createdAt).toLocaleString()}</span>
            </div>
          </div>
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
  footerContent: "flex items-center justify-between w-full",
  metadata: "flex gap-4 text-xs text-zinc-500 dark:text-zinc-400",
};
