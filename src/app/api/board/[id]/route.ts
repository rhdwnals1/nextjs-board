import { NextResponse } from "next/server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { boards } from "@drizzle/schema";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { validationError, unauthorizedError, notFoundError, parseId } from "@/utils/api";

export const runtime = "nodejs";

const boardUpsertSchema = z.object({
  title: z.string().trim().min(1, "title은 비어있을 수 없습니다."),
  content: z.string().trim().min(1, "content는 비어있을 수 없습니다."),
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

  // 게시글 조회
  const post = (
    await db.select().from(boards).where(eq(boards.id, postId)).limit(1)
  )[0];

  if (!post) {
    return notFoundError("게시글을 찾을 수 없습니다.");
  }

  // 조회수 증가
  const currentViewCount = post.viewCount ?? 0;
  const updated = await db
    .update(boards)
    .set({ viewCount: currentViewCount + 1 })
    .where(eq(boards.id, postId))
    .returning();

  return NextResponse.json(updated[0] ?? post);
}

export async function PUT(request: Request, context: RouteContext) {
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
  const parsed = boardUpsertSchema.safeParse(raw);
  if (!parsed.success) {
    return validationError(parsed.error);
  }
  const { title, content } = parsed.data;

  const updated = await db
    .update(boards)
    .set({ title, content })
    .where(eq(boards.id, postId))
    .returning();

  if (updated.length === 0) {
    return notFoundError("게시글을 찾을 수 없습니다.");
  }

  return NextResponse.json(updated[0]);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  
  if (!user) {
    return unauthorizedError();
  }
  
  const idResult = await parseId(context.params.then(p => p.id));
  if ("error" in idResult) {
    return idResult.error;
  }
  const postId = idResult.id;

  const deleted = await db
    .delete(boards)
    .where(eq(boards.id, postId))
    .returning({ id: boards.id });

  if (deleted.length === 0) {
    return notFoundError("게시글을 찾을 수 없습니다.");
  }

  return NextResponse.json({ ok: true });
}
