"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/services/auth";

export default function Home() {
  const { data: user } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
  });

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className={styles.actions}>
          {user ? (
            <>
              <Link className={styles.primaryBtn} href="/board">
                게시판 보기
              </Link>
              <Link className={styles.secondaryBtn} href="/board/new">
                글 작성
              </Link>
            </>
          ) : (
            <>
              <span className={`${styles.primaryBtn} ${styles.disabled}`} title="로그인이 필요합니다">
                게시판 보기
              </span>
              <span className={`${styles.secondaryBtn} ${styles.disabled}`} title="로그인이 필요합니다">
                글 작성
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container:
    "flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black",
  main: "flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-12 py-32 px-6 bg-white dark:bg-black",
  logo: "dark:invert",
  actions:
    "flex w-full flex-col items-center justify-center gap-4 text-lg font-semibold sm:flex-row",
  primaryBtn:
    "flex h-14 w-full max-w-xs items-center justify-center rounded-full bg-foreground px-8 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]",
  secondaryBtn:
    "flex h-14 w-full max-w-xs items-center justify-center rounded-full border border-solid border-black/10 px-8 transition-colors hover:border-transparent hover:bg-black/5 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]",
  disabled:
    "opacity-50 cursor-not-allowed pointer-events-none",
};
