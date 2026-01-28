import { NextResponse } from "next/server";

import { eq } from "drizzle-orm";

import { comments } from "@drizzle/schema";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { unauthorizedError, notFoundError, forbiddenError, parseId } from "@/utils/api";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ commentId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  
  if (!user) {
    return unauthorizedError();
  }
  
  const idResult = await parseId(context.params.then(p => p.commentId), "commentId");
  if ("error" in idResult) {
    return idResult.error;
  }
  const id = idResult.id;

  // 댓글 존재 및 작성자 확인
  const comment = (
    await db.select().from(comments).where(eq(comments.id, id)).limit(1)
  )[0];

  if (!comment) {
    return notFoundError("댓글을 찾을 수 없습니다.");
  }

  if (comment.authorId !== user.id) {
    return forbiddenError("본인이 작성한 댓글만 삭제할 수 있습니다.");
  }

  const deleted = await db
    .delete(comments)
    .where(eq(comments.id, id))
    .returning({ id: comments.id });

  return NextResponse.json({ ok: true });
}
