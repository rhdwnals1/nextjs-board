import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@drizzle/schema";
import { setSession } from "@/lib/auth";
import { validationError, unauthorizedError } from "@/utils/api";

export const runtime = "nodejs";

const loginSchema = z.object({
  name: z.string().trim().min(1, "이름은 필수입니다."),
  password: z.string().min(1, "비밀번호는 필수입니다."),
});

export async function POST(request: Request) {
  const raw = (await request.json().catch(() => null)) as unknown;
  const parsed = loginSchema.safeParse(raw);
  
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const { name, password } = parsed.data;

  const user = (
    await db.select().from(users).where(eq(users.name, name)).limit(1)
  )[0];

  if (!user) {
    return unauthorizedError("이름 또는 비밀번호가 올바르지 않습니다.");
  }

  // 해시된 비밀번호 비교
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return unauthorizedError("이름 또는 비밀번호가 올바르지 않습니다.");
  }

  // 세션 설정
  await setSession(user.id);

  return NextResponse.json({
    id: user.id,
    name: user.name,
  });
}
