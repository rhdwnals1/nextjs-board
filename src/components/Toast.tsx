"use client";

import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Toast = {
  id: number;
  message: string;
  type: "board_like" | "comment_like" | "board_comment";
  boardId: number | null;
};

type NotificationData = {
  id: number;
  type: string;
  boardId: number | null;
};

type StreamData = {
  type: "initial" | "update";
  notifications?: NotificationData[];
};

export function ToastProvider() {
  const { isAuthenticated } = useAuth(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastNotificationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const es = new EventSource("/api/notifications/stream");

    es.onmessage = (event) => {
      const data = JSON.parse(event.data) as StreamData;
      
      if (data.type === "initial") {
        // 초기 알림은 무시 (이미 발생한 알림)
        if (data.notifications && data.notifications.length > 0) {
          lastNotificationIdRef.current = data.notifications[0]?.id || null;
        }
        return;
      }

      if (data.type === "update" && data.notifications) {
        // 새 알림만 토스트로 표시
        const newNotifications = data.notifications.filter(
          (n) => lastNotificationIdRef.current === null || n.id > lastNotificationIdRef.current
        );

        newNotifications.forEach((notification) => {
          let message = "";
          let toastType: "board_like" | "comment_like" | "board_comment" | null = null;
          
          if (notification.type === "board_like") {
            message = "내 게시글에 좋아요가 눌렸습니다.";
            toastType = "board_like";
          } else if (notification.type === "comment_like") {
            message = "내 댓글에 좋아요가 눌렸습니다.";
            toastType = "comment_like";
          } else if (notification.type === "board_comment") {
            message = "내 게시글에 댓글이 달렸습니다.";
            toastType = "board_comment";
          }

          if (message && toastType) {
            const toast: Toast = {
              id: notification.id,
              message,
              type: toastType,
              boardId: notification.boardId,
            };
            setToasts((prev) => [...prev, toast]);

            // 3초 후 자동 제거
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== toast.id));
            }, 3000);
          }
        });

        if (data.notifications.length > 0) {
          lastNotificationIdRef.current = data.notifications[0].id;
        }
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div key={toast.id} className={styles.toast}>
          <p className={styles.message}>{toast.message}</p>
          <button
            className={styles.close}
            onClick={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
          >
            <X className={styles.icon} />
          </button>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container:
    "fixed top-20 right-4 z-50 space-y-2 pointer-events-none",
  toast:
    "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] pointer-events-auto",
  message: "text-sm flex-1",
  close:
    "text-zinc-400 dark:text-zinc-600 hover:text-zinc-200 dark:hover:text-zinc-800 transition-colors",
  icon: "h-4 w-4",
};
