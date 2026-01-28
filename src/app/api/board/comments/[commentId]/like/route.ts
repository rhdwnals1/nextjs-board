import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { comments, commentLikes } from "@drizzle/schema";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { unauthorizedError, notFoundError, parseId } from "@/utils/api";
import { createNotification } from "@/lib/notifications";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ commentId: string }>;
};

// 댓글 좋아요 토글
export async function POST(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  
  if (!user) {
    return unauthorizedError();
  }

  const idResult = await parseId(context.params.then(p => p.commentId), "commentId");
  if ("error" in idResult) {
    return idResult.error;
  }
  const commentId = idResult.id;

  // 댓글 존재 확인
  const comment = (
    await db.select().from(comments).where(eq(comments.id, commentId)).limit(1)
  )[0];

  if (!comment) {
    return notFoundError("댓글을 찾을 수 없습니다.");
  }

  // 이미 좋아요를 눌렀는지 확인
  const existingLike = (
    await db
      .select()
      .from(commentLikes)
      .where(
        and(
          eq(commentLikes.commentId, commentId),
          eq(commentLikes.userId, user.id)
        )
      )
      .limit(1)
  )[0];

  if (existingLike) {
    // 좋아요 삭제
    await db
      .delete(commentLikes)
      .where(eq(commentLikes.id, existingLike.id));

    return NextResponse.json({ liked: false });
  } else {
    // 좋아요 추가
    await db.insert(commentLikes).values({
      commentId,
      userId: user.id,
    });

    // 알림 생성 (내 댓글에 좋아요가 눌렸을 때만)
    await createNotification("comment_like", user.id, undefined, commentId);

    return NextResponse.json({ liked: true });
  }
}

// 댓글 좋아요 상태 확인
export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  
  if (!user) {
    return unauthorizedError();
  }

  const idResult = await parseId(context.params.then(p => p.commentId), "commentId");
  if ("error" in idResult) {
    return idResult.error;
  }
  const commentId = idResult.id;

  // 좋아요 수 조회
  const likeCountRows = await db
    .select()
    .from(commentLikes)
    .where(eq(commentLikes.commentId, commentId));
  
  const likeCount = likeCountRows.length;

  // 현재 사용자가 좋아요를 눌렀는지 확인
  const userLiked = !!(
    await db
      .select()
      .from(commentLikes)
      .where(
        and(
          eq(commentLikes.commentId, commentId),
          eq(commentLikes.userId, user.id)
        )
      )
      .limit(1)
  )[0];

  return NextResponse.json({
    count: likeCount,
    liked: userLiked,
  });
}
