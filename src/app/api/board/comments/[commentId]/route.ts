import { NextResponse } from "next/server";

import { eq } from "drizzle-orm";

import { comments } from "@drizzle/schema";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { unauthorizedError, notFoundError, parseId } from "@/utils/api";

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

  const deleted = await db
    .delete(comments)
    .where(eq(comments.id, id))
    .returning({ id: comments.id });

  if (deleted.length === 0) {
    return notFoundError("댓글을 찾을 수 없습니다.");
  }

  return NextResponse.json({ ok: true });
}
