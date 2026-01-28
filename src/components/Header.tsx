"use client";

import Link from "next/link";
import { AuthButton } from "./AuthButton";
import { NotificationButton } from "./NotificationButton";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <Link href="/" className={styles.title}>
          게시판
        </Link>
        <div className={styles.actions}>
          <NotificationButton />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}

const styles = {
  header:
    "fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm dark:bg-black/80 border-b border-zinc-200 dark:border-zinc-800 shadow-sm",
  content:
    "mx-auto w-full max-w-7xl flex items-center justify-between gap-4 px-4 py-3",
  title: "text-lg font-semibold text-zinc-900 dark:text-zinc-50 hover:opacity-80 transition-opacity",
  actions: "flex items-center gap-2",
};
