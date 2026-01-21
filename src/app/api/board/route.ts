import { NextResponse } from "next/server";

import { desc } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { posts } from "@drizzle/schema";

export const runtime = "nodejs";

const boardUpsertSchema = z.object({
  title: z.string().trim().min(1, "title은 비어있을 수 없습니다."),
  content: z.string().trim().min(1, "content는 비어있을 수 없습니다."),
});

export async function GET() {
  const rows = await db.select().from(posts).orderBy(desc(posts.createdAt));
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
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

  const created = await db.insert(posts).values({ title, content }).returning();

  return NextResponse.json(created[0], { status: 201 });
}
