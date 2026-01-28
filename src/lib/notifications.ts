import { eq } from "drizzle-orm";
import { boards, comments, notifications } from "@drizzle/schema";
import { db } from "@/lib/db";

// 알림 생성 (내 게시글/댓글에 좋아요가 눌렸을 때, 내 게시글에 댓글이 달렸을 때)
export async function createNotification(
  type: "board_like" | "comment_like" | "board_comment",
  actorId: number, // 좋아요를 누른 사용자 또는 댓글을 작성한 사용자
  boardId?: number,
  commentId?: number
) {
  // 게시글 좋아요인 경우
  if (type === "board_like" && boardId) {
    const board = (
      await db.select().from(boards).where(eq(boards.id, boardId)).limit(1)
    )[0];

    if (!board?.authorId) {
      // 작성자가 없는 경우 알림 생성 안 함
      return;
    }

    await db.insert(notifications).values({
      userId: board.authorId,
      type: "board_like",
      boardId,
      actorId,
    });
  }

  // 댓글 좋아요인 경우
  if (type === "comment_like" && commentId) {
    const comment = (
      await db.select().from(comments).where(eq(comments.id, commentId)).limit(1)
    )[0];

    if (!comment?.authorId) {
      // 작성자가 없는 경우 알림 생성 안 함
      return;
    }

    await db.insert(notifications).values({
      userId: comment.authorId,
      type: "comment_like",
      boardId: comment.boardId,
      commentId,
      actorId,
    });
  }

  // 게시글에 댓글이 달린 경우
  if (type === "board_comment" && boardId) {
    const board = (
      await db.select().from(boards).where(eq(boards.id, boardId)).limit(1)
    )[0];

    if (!board?.authorId) {
      // 작성자가 없는 경우 알림 생성 안 함
      return;
    }

    await db.insert(notifications).values({
      userId: board.authorId,
      type: "board_comment",
      boardId,
      commentId,
      actorId,
    });
  }
}
