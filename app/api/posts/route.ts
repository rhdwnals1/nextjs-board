import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(posts);
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

  const newPost = await prisma.post.create({
    data: { title, content },
  });
  return NextResponse.json(newPost, { status: 201 });
}
