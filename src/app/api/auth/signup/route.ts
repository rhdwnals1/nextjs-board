import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@drizzle/schema";
import { setSession } from "@/lib/auth";

export const runtime = "nodejs";

const signupSchema = z.object({
  name: z.string().trim().min(1, "이름은 필수입니다.").max(64, "이름은 64자 이하여야 합니다."),
  password: z.string().min(4, "비밀번호는 최소 4자 이상이어야 합니다."),
});

export async function POST(request: Request) {
  const raw = (await request.json().catch(() => null)) as unknown;
  const parsed = signupSchema.safeParse(raw);
  
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "요청 값이 올바르지 않습니다.",
      },
      { status: 400 }
    );
  }

  const { name, password } = parsed.data;

  // 이름 중복 확인
  const existing = (
    await db.select().from(users).where(eq(users.name, name)).limit(1)
  )[0];

  if (existing) {
    return NextResponse.json(
      { error: "이미 사용 중인 이름입니다." },
      { status: 400 }
    );
  }

  // 비밀번호 해싱 (bcrypt 사용, 12 rounds)
  const hashedPassword = await bcrypt.hash(password, 12);

  const created = await db
    .insert(users)
    .values({
      name,
      password: hashedPassword,
    })
    .returning();

  const user = created[0];

  // 세션 설정
  await setSession(user.id);

  return NextResponse.json(
    { id: user.id, name: user.name },
    { status: 201 }
  );
}
