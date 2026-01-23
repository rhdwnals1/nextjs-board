import { NextResponse } from "next/server";

import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { comments, boards } from "@drizzle/schema";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { validationError, unauthorizedError, notFoundError, parseId } from "@/utils/api";

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

  const rows = await db
    .select()
    .from(comments)
    .where(eq(comments.boardId, postId))
    .orderBy(asc(comments.createdAt));

  return NextResponse.json(rows);
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

  return NextResponse.json(created[0], { status: 201 });
}
