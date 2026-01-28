"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Notification = {
  id: number;
  type: string;
  boardId: number | null;
  commentId: number | null;
  actorId: number | null;
  read: boolean;
  createdAt: string;
};

export function NotificationButton() {
  const { isAuthenticated } = useAuth(false);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [], refetch } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 5000, // 5초마다 새로고침
  });

  // 모든 알림 읽음 처리
  const readAllMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("읽음 처리에 실패했습니다.");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // 개별 알림 읽음 처리
  const readMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("읽음 처리에 실패했습니다.");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  // 드롭다운 열 때 모든 알림 읽음 처리
  const handleOpen = () => {
    setIsOpen(true);
    if (unreadCount > 0) {
      readAllMutation.mutate();
    }
  };

  if (!isAuthenticated) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      readMutation.mutate(notification.id);
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    if (notification.type === "board_like") {
      return "내 게시글에 좋아요가 눌렸습니다.";
    } else if (notification.type === "comment_like") {
      return "내 댓글에 좋아요가 눌렸습니다.";
    } else if (notification.type === "board_comment") {
      return "내 게시글에 댓글이 달렸습니다.";
    }
    return "";
  };

  return (
    <div className={styles.container}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpen}
        className={styles.button}
      >
        <Bell className={styles.icon} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount}</span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className={styles.overlay}
            onClick={() => setIsOpen(false)}
          />
          <div className={styles.dropdown}>
            <div className={styles.header}>
              <h3 className={styles.title}>알림</h3>
              {unreadCount > 0 && (
                <span className={styles.unreadBadge}>
                  {unreadCount}개 읽지 않음
                </span>
              )}
            </div>
            <div className={styles.list}>
              {notifications.length === 0 ? (
                <div className={styles.empty}>알림이 없습니다.</div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`${styles.item} ${
                      !notification.read ? styles.unread : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={styles.itemContent}>
                      <p className={styles.text}>
                        {getNotificationMessage(notification)}
                      </p>
                      <p className={styles.time}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: "relative",
  button: "relative",
  icon: "h-5 w-5",
  badge:
    "absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center",
  overlay: "fixed inset-0 z-40",
  dropdown:
    "absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-lg z-50 max-h-96 overflow-hidden flex flex-col",
  header: "p-4 border-b border-zinc-200 dark:border-zinc-800",
  title: "text-sm font-semibold text-zinc-900 dark:text-zinc-50",
  unreadBadge: "text-xs text-zinc-500 dark:text-zinc-400 mt-1 block",
  list: "overflow-y-auto flex-1",
  empty: "p-4 text-sm text-zinc-500 dark:text-zinc-400 text-center",
  item: "p-4 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800",
  unread: "bg-blue-50 dark:bg-blue-950/20",
  itemContent: "space-y-1",
  text: "text-sm text-zinc-900 dark:text-zinc-50",
  time: "text-xs text-zinc-500 dark:text-zinc-400",
};
