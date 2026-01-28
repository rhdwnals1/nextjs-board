import { NextResponse } from "next/server";

import { eq, and } from "drizzle-orm";
import { z } from "zod";

import { boards, boardLikes, users } from "@drizzle/schema";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { validationError, unauthorizedError, notFoundError, forbiddenError, parseId } from "@/utils/api";

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
  const postWithAuthor = (
    await db
      .select({
        id: boards.id,
        authorId: boards.authorId,
        title: boards.title,
        content: boards.content,
        viewCount: boards.viewCount,
        createdAt: boards.createdAt,
        authorName: users.name,
      })
      .from(boards)
      .leftJoin(users, eq(boards.authorId, users.id))
      .where(eq(boards.id, postId))
      .limit(1)
  )[0];

  if (!postWithAuthor) {
    return notFoundError("게시글을 찾을 수 없습니다.");
  }

  const post = {
    id: postWithAuthor.id,
    authorId: postWithAuthor.authorId,
    title: postWithAuthor.title,
    content: postWithAuthor.content,
    viewCount: postWithAuthor.viewCount,
    createdAt: postWithAuthor.createdAt,
  };

  // 조회수 증가
  const currentViewCount = post.viewCount ?? 0;
  const updated = await db
    .update(boards)
    .set({ viewCount: currentViewCount + 1 })
    .where(eq(boards.id, postId))
    .returning();

  const updatedPost = updated[0] ?? post;

  // 좋아요 수 조회
  const likeCountRows = await db
    .select()
    .from(boardLikes)
    .where(eq(boardLikes.boardId, postId));
  
  const likeCount = likeCountRows.length;

  // 현재 사용자가 좋아요를 눌렀는지 확인
  const user = await getCurrentUser();
  let userLiked = false;
  if (user) {
    const userLike = (
      await db
        .select()
        .from(boardLikes)
        .where(
          and(
            eq(boardLikes.boardId, postId),
            eq(boardLikes.userId, user.id)
          )
        )
        .limit(1)
    )[0];
    userLiked = !!userLike;
  }

  return NextResponse.json({
    ...updatedPost,
    authorName: postWithAuthor.authorName,
    likeCount,
    userLiked,
  });
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

  // 게시글 존재 및 작성자 확인
  const board = (
    await db.select().from(boards).where(eq(boards.id, postId)).limit(1)
  )[0];

  if (!board) {
    return notFoundError("게시글을 찾을 수 없습니다.");
  }

  if (board.authorId !== user.id) {
    return forbiddenError("본인이 작성한 게시글만 수정할 수 있습니다.");
  }

  const updated = await db
    .update(boards)
    .set({ title, content })
    .where(eq(boards.id, postId))
    .returning();

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

  // 게시글 존재 및 작성자 확인
  const board = (
    await db.select().from(boards).where(eq(boards.id, postId)).limit(1)
  )[0];

  if (!board) {
    return notFoundError("게시글을 찾을 수 없습니다.");
  }

  if (board.authorId !== user.id) {
    return forbiddenError("본인이 작성한 게시글만 삭제할 수 있습니다.");
  }


  return NextResponse.json({ ok: true });
}
