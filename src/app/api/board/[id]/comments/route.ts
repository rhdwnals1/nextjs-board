import { NextResponse } from "next/server";

import { asc, eq, and } from "drizzle-orm";
import { z } from "zod";

import { comments, boards, commentLikes, users } from "@drizzle/schema";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { validationError, unauthorizedError, notFoundError, parseId } from "@/utils/api";
import { createNotification } from "@/lib/notifications";

export const runtime = "nodejs";

const commentCreateSchema = z.object({
  content: z.string().trim().min(1, "댓글 내용은 비어있을 수 없습니다."),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const idResult = await parseId(context.params.then(p => p.id));
  if ("error" in idResult) {
    return idResult.error;
  }
  const postId = idResult.id;

  const user = await getCurrentUser();
  const commentRows = await db
    .select({
      id: comments.id,
      boardId: comments.boardId,
      authorId: comments.authorId,
      content: comments.content,
      createdAt: comments.createdAt,
      authorName: users.name,
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.boardId, postId))
    .orderBy(asc(comments.createdAt));

  // 각 댓글의 좋아요 수와 사용자 좋아요 상태 조회
  const commentsWithLikes = await Promise.all(
    commentRows.map(async (comment) => {
      const likeCountRows = await db
        .select()
        .from(commentLikes)
        .where(eq(commentLikes.commentId, comment.id));
      
      const likeCount = likeCountRows.length;

      let userLiked = false;
      if (user) {
        const userLike = (
          await db
            .select()
            .from(commentLikes)
            .where(
              and(
                eq(commentLikes.commentId, comment.id),
                eq(commentLikes.userId, user.id)
              )
            )
            .limit(1)
        )[0];
        userLiked = !!userLike;
      }

      return {
        ...comment,
        likeCount,
        userLiked,
      };
    })
  );

  return NextResponse.json(commentsWithLikes);
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  
  if (!user) {
    return unauthorizedError();
  }
  
  const idResult = await parseId(context.params.then(p => p.id));
  if ("error" in idResult) {
    return idResult.error;
  }
  const postId = idResult.id;

  const raw = (await request.json().catch(() => null)) as unknown;
  const parsed = commentCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const exists = (
    await db
      .select({ id: boards.id })
      .from(boards)
      .where(eq(boards.id, postId))
      .limit(1)
  )[0];
  if (!exists) {
    return notFoundError("게시글을 찾을 수 없습니다.");
  }

  const created = await db
    .insert(comments)
    .values({
      boardId: postId,
      content: parsed.data.content,
      authorId: user.id,
    })
    .returning();

  // 알림 생성 (내 게시글에 댓글이 달렸을 때)
  await createNotification("board_comment", user.id, postId, created[0].id);

  return NextResponse.json(created[0], { status: 201 });
}
