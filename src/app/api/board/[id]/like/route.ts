import { NextResponse } from "next/server";

import { eq, and } from "drizzle-orm";

import { boards, boardLikes } from "@drizzle/schema";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { unauthorizedError, notFoundError, parseId } from "@/utils/api";
import { createNotification } from "@/lib/notifications";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// 좋아요 토글 (있으면 삭제, 없으면 추가)
export async function POST(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  
  if (!user) {
    return unauthorizedError();
  }

  const idResult = await parseId(context.params.then(p => p.id));
  if ("error" in idResult) {
    return idResult.error;
  }
  const boardId = idResult.id;

  // 게시글 존재 확인
  const board = (
    await db.select().from(boards).where(eq(boards.id, boardId)).limit(1)
  )[0];

  if (!board) {
    return notFoundError("게시글을 찾을 수 없습니다.");
  }

  // 이미 좋아요를 눌렀는지 확인
  const existingLike = (
    await db
      .select()
      .from(boardLikes)
      .where(
        and(
          eq(boardLikes.boardId, boardId),
          eq(boardLikes.userId, user.id)
        )
      )
      .limit(1)
  )[0];

  if (existingLike) {
    // 좋아요 삭제
    await db
      .delete(boardLikes)
      .where(eq(boardLikes.id, existingLike.id));

    return NextResponse.json({ liked: false });
  } else {
    // 좋아요 추가
    await db.insert(boardLikes).values({
      boardId,
      userId: user.id,
    });

    // 알림 생성 (내 게시글에 좋아요가 눌렸을 때만)
    await createNotification("board_like", user.id, boardId);

    return NextResponse.json({ liked: true });
  }
}

// 좋아요 상태 확인
export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  
  if (!user) {
    return unauthorizedError();
  }

  const idResult = await parseId(context.params.then(p => p.id));
  if ("error" in idResult) {
    return idResult.error;
  }
  const boardId = idResult.id;

  // 좋아요 수 조회
  const likeCountRows = await db
    .select()
    .from(boardLikes)
    .where(eq(boardLikes.boardId, boardId));
  
  const likeCount = likeCountRows.length;

  // 현재 사용자가 좋아요를 눌렀는지 확인
  const userLiked = !!(
    await db
      .select()
      .from(boardLikes)
      .where(
        and(
          eq(boardLikes.boardId, boardId),
          eq(boardLikes.userId, user.id)
        )
      )
      .limit(1)
  )[0];

  return NextResponse.json({
    count: likeCount,
    liked: userLiked,
  });
}
