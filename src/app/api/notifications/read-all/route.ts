import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { notifications } from "@drizzle/schema";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { unauthorizedError } from "@/utils/api";

export const runtime = "nodejs";

// 모든 알림 읽음 처리
export async function PATCH() {
  const user = await getCurrentUser();
  
  if (!user) {
    return unauthorizedError();
  }

  // 사용자의 모든 읽지 않은 알림을 읽음 처리
  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, user.id));

  return NextResponse.json({ ok: true });
}
