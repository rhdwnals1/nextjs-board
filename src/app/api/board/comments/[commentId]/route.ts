import { NextResponse } from "next/server";

import { eq } from "drizzle-orm";

import { comments } from "@drizzle/schema";
import { db } from "@/lib/db";
import { isString } from "@/utils/common";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ commentId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }
  
  const rawId = (await context.params).commentId;
  const id = isString(rawId) ? Number(rawId) : NaN;
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { error: "commentId는 양의 정수여야 합니다." },
      { status: 400 }
    );
  }

  const deleted = await db
    .delete(comments)
    .where(eq(comments.id, id))
    .returning({ id: comments.id });

  if (deleted.length === 0) {
    return NextResponse.json(
      { error: "댓글을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
