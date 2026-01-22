import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@drizzle/schema";
import { eq } from "drizzle-orm";

const SESSION_COOKIE_NAME = "user_id";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!userId) {
    return null;
  }

  const userIdNum = Number(userId);
  if (!Number.isInteger(userIdNum) || userIdNum <= 0) {
    return null;
  }

  const user = (
    await db.select().from(users).where(eq(users.id, userIdNum)).limit(1)
  )[0];

  return user ?? null;
}

export async function setSession(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, String(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7일
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
