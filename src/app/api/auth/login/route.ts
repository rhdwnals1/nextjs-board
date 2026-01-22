import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@drizzle/schema";
import { setSession } from "@/lib/auth";

export const runtime = "nodejs";

const loginSchema = z.object({
  name: z.string().trim().min(1, "이름은 필수입니다."),
  password: z.string().min(1, "비밀번호는 필수입니다."),
});

export async function POST(request: Request) {
  const raw = (await request.json().catch(() => null)) as unknown;
  const parsed = loginSchema.safeParse(raw);
  
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "요청 값이 올바르지 않습니다.",
      },
      { status: 400 }
    );
  }

  const { name, password } = parsed.data;

  const user = (
    await db.select().from(users).where(eq(users.name, name)).limit(1)
  )[0];

  if (!user) {
    return NextResponse.json(
      { error: "이름 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  // 간단한 비밀번호 확인 (실제로는 해시 비교 필요)
  if (user.password !== password) {
    return NextResponse.json(
      { error: "이름 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  // 세션 설정
  await setSession(user.id);

  return NextResponse.json({
    id: user.id,
    name: user.name,
  });
}
