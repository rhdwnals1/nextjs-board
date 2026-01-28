import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { notifications } from "@drizzle/schema";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { unauthorizedError } from "@/utils/api";

export const runtime = "nodejs";

// 알림 목록 조회
export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return unauthorizedError();
  }

  const userNotifications = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return NextResponse.json(userNotifications);
}
