import { NextResponse } from "next/server";

import { eq } from "drizzle-orm";

import { posts } from "@/drizzle/schema";
import { db } from "@/lib/db";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function parsePostId(context: RouteContext) {
  const { id } = await context.params;
  const postId = Number(id);

  if (!Number.isInteger(postId) || postId <= 0) return null;
  return postId;
}

export async function GET(_request: Request, context: RouteContext) {
  const postId = await parsePostId(context);

  if (!postId) {
    return NextResponse.json(
      { error: "id는 양의 정수여야 합니다." },
      { status: 400 }
    );
  }

  const post = (
    await db.select().from(posts).where(eq(posts.id, postId)).limit(1)
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
  const postId = await parsePostId(context);

  if (!postId) {
    return NextResponse.json(
      { error: "id는 양의 정수여야 합니다." },
      { status: 400 }
    );
  }

  const data = (await request.json().catch(() => null)) as unknown;

  if (
    !data ||
    !isRecord(data) ||
    typeof data.title !== "string" ||
    typeof data.content !== "string"
  ) {
    return NextResponse.json(
      { error: "title, content 문자열이 필요합니다." },
      { status: 400 }
    );
  }

  const title = data.title.trim();
  const content = data.content.trim();

  if (!title || !content) {
    return NextResponse.json(
      { error: "title, content는 비어있을 수 없습니다." },
      { status: 400 }
    );
  }

  const updated = await db
    .update(posts)
    .set({ title, content })
    .where(eq(posts.id, postId))
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
  const postId = await parsePostId(context);

  if (!postId) {
    return NextResponse.json(
      { error: "id는 양의 정수여야 합니다." },
      { status: 400 }
    );
  }

  const deleted = await db
    .delete(posts)
    .where(eq(posts.id, postId))
    .returning({ id: posts.id });

  if (deleted.length === 0) {
    return NextResponse.json(
      { error: "게시글을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
