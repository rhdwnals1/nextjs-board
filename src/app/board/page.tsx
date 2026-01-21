"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { postsListQuery } from "@/queries/board";

export default function PostsPage() {
  const { data: posts = [], isLoading, isError } = useQuery(postsListQuery());

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>게시판</h1>
        <Button asChild>
          <Link href="/board/new">글 작성</Link>
        </Button>
      </div>

      {isLoading && <div className={styles.loading}>로딩중...</div>}
      {isError && <div className={styles.error}>불러오기에 실패했습니다.</div>}

      <div className={styles.list}>
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/board/${post.id}`}
            className={styles.itemLink}
          >
            <Card className={styles.itemCard}>
              <CardHeader className={styles.itemHeader}>
                <CardTitle className={styles.itemTitle}>{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={styles.itemContent}>{post.content}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: "mx-auto w-full max-w-2xl p-6 space-y-4",
  headerRow: "flex items-center justify-between gap-3",
  title: "text-xl font-semibold",
  loading: "text-sm text-zinc-500 dark:text-zinc-400",
  error: "text-sm text-red-600",
  list: "space-y-3",
  itemLink: "block",
  itemCard: "transition-shadow hover:shadow-md",
  itemHeader: "pb-3",
  itemTitle: "text-lg",
  itemContent: "line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300",
};
