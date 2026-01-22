import { NextResponse } from "next/server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { boards } from "@drizzle/schema";
import { db } from "@/lib/db";
import { isString } from "@/utils/common";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const boardUpsertSchema = z.object({
  title: z.string().trim().min(1, "title은 비어있을 수 없습니다."),
  content: z.string().trim().min(1, "content는 비어있을 수 없습니다."),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const rawId = (await context.params).id;
  const postId = isString(rawId) ? Number(rawId) : NaN;

  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json(
      { error: "id는 양의 정수여야 합니다." },
      { status: 400 }
    );
  }

  const post = (
    await db.select().from(boards).where(eq(boards.id, postId)).limit(1)
  )[0];

  if (!post) {
    return NextResponse.json(
      { error: "게시글을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  return NextResponse.json(post);
}

export async function PUT(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }
  
  const rawId = (await context.params).id;
  const postId = isString(rawId) ? Number(rawId) : NaN;

  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json(
      { error: "id는 양의 정수여야 합니다." },
      { status: 400 }
    );
  }

  const raw = (await request.json().catch(() => null)) as unknown;
  const parsed = boardUpsertSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ?? "요청 값이 올바르지 않습니다.",
      },
      { status: 400 }
    );
  }
  const { title, content } = parsed.data;

  const updated = await db
    .update(boards)
    .set({ title, content })
    .where(eq(boards.id, postId))
    .returning();

  if (updated.length === 0) {
    return NextResponse.json(
      { error: "게시글을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  return NextResponse.json(updated[0]);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }
  
  const rawId = (await context.params).id;
  const postId = isString(rawId) ? Number(rawId) : NaN;

  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json(
      { error: "id는 양의 정수여야 합니다." },
      { status: 400 }
    );
  }

  const deleted = await db
    .delete(boards)
    .where(eq(boards.id, postId))
    .returning({ id: boards.id });

  if (deleted.length === 0) {
    return NextResponse.json(
      { error: "게시글을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
