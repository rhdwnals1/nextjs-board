import { NextResponse } from "next/server";

import { desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { posts } from "@/drizzle/schema";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function GET() {
  const rows = await db.select().from(posts).orderBy(desc(posts.createdAt));
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
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

  const created = await db.insert(posts).values({ title, content }).returning();

  return NextResponse.json(created[0], { status: 201 });
}
