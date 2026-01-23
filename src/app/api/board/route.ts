import { NextResponse } from "next/server";

import { desc } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { boards } from "@drizzle/schema";
import { getCurrentUser } from "@/lib/auth";
import { validationError, unauthorizedError } from "@/utils/api";

export const runtime = "nodejs";

const boardUpsertSchema = z.object({
  title: z.string().trim().min(1, "title은 비어있을 수 없습니다."),
  content: z.string().trim().min(1, "content는 비어있을 수 없습니다."),
});

export async function GET() {
  const rows = await db.select().from(boards).orderBy(desc(boards.createdAt));
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  
  if (!user) {
    return unauthorizedError();
  }
  
  const raw = (await request.json().catch(() => null)) as unknown;
  const parsed = boardUpsertSchema.safeParse(raw);
  if (!parsed.success) {
    return validationError(parsed.error);
  }
  const { title, content } = parsed.data;

  const created = await db
    .insert(boards)
    .values({
      title,
      content,
      authorId: user?.id ?? null,
    })
    .returning();

  return NextResponse.json(created[0], { status: 201 });
}
