import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { notifications } from "@drizzle/schema";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { unauthorizedError } from "@/utils/api";

export const runtime = "nodejs";

// SSE 알림 스트림
export async function GET(request: Request) {
  const user = await getCurrentUser();
  
  if (!user) {
    return unauthorizedError();
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // SSE 형식으로 데이터 전송
      const send = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // 초기 알림 전송
      const initialNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, user.id))
        .orderBy(desc(notifications.createdAt))
        .limit(10);
      
      send({ type: "initial", notifications: initialNotifications });

      // 주기적으로 새 알림 확인 (5초마다)
      const interval = setInterval(async () => {
        try {
          const newNotifications = await db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, user.id))
            .orderBy(desc(notifications.createdAt))
            .limit(10);
          
          send({ type: "update", notifications: newNotifications });
        } catch (error) {
          console.error("알림 조회 오류:", error);
        }
      }, 5000);

      // 클라이언트 연결 종료 시 정리
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
