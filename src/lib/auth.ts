import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { users, sessions } from "@drizzle/schema";
import { eq, and, gt } from "drizzle-orm";

const SESSION_COOKIE_NAME = "session_id";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7일

function generateSessionId(): string {
  return randomBytes(32).toString("hex");
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!sessionId) {
    return null;
  }

  // 세션 조회 (만료되지 않은 것만)
  const session = (
    await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.id, sessionId),
          gt(sessions.expiresAt, new Date())
        )
      )
      .limit(1)
  )[0];

  if (!session) {
    return null;
  }

  // 세션에서 사용자 ID로 사용자 정보 조회
  const user = (
    await db.select().from(users).where(eq(users.id, session.userId)).limit(1)
  )[0];

  return user ?? null;
}

export async function setSession(userId: number) {
  const cookieStore = await cookies();
  
  // 세션 ID 생성
  const sessionId = generateSessionId();
  
  // 만료 시간 설정
  const expiresAt = new Date();
  expiresAt.setTime(expiresAt.getTime() + SESSION_MAX_AGE * 1000);

  // 세션 DB에 저장
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  // 쿠키에 세션 ID만 저장
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (sessionId) {
    // DB에서 세션 삭제
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }
  
  // 쿠키 삭제
  cookieStore.delete(SESSION_COOKIE_NAME);
}
