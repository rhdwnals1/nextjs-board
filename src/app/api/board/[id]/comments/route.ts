import { NextResponse } from "next/server";

import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { comments, boards } from "@drizzle/schema";
import { db } from "@/lib/db";
import { isString } from "@/utils/common";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const commentCreateSchema = z.object({
  content: z.string().trim().min(1, "댓글 내용은 비어있을 수 없습니다."),
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
  const parsed = commentCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ?? "요청 값이 올바르지 않습니다.",
      },
      { status: 400 }
    );
  }

  const exists = (
    await db
      .select({ id: boards.id })
      .from(boards)
      .where(eq(boards.id, postId))
      .limit(1)
  )[0];
  if (!exists) {
    return NextResponse.json(
      { error: "게시글을 찾을 수 없습니다." },
      { status: 404 }
    );
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
