import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { notifications } from "@drizzle/schema";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { unauthorizedError, notFoundError, forbiddenError, parseId } from "@/utils/api";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// 알림 읽음 처리
export async function PATCH(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  
  if (!user) {
    return unauthorizedError();
  }

  const idResult = await parseId(context.params.then(p => p.id), "notificationId");
  if ("error" in idResult) {
    return idResult.error;
  }
  const notificationId = idResult.id;

  // 알림 존재 및 소유자 확인
  const notification = (
    await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, notificationId))
      .limit(1)
  )[0];

  if (!notification) {
    return notFoundError("알림을 찾을 수 없습니다.");
  }

  if (notification.userId !== user.id) {
    return forbiddenError("본인의 알림만 읽음 처리할 수 있습니다.");
  }

  // 읽음 처리
  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, notificationId));

  return NextResponse.json({ ok: true });
}
