import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-12 py-32 px-6 bg-white dark:bg-black">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex w-full flex-col items-center justify-center gap-4 text-lg font-semibold sm:flex-row">
          <Link
            className="flex h-14 w-full max-w-xs items-center justify-center rounded-full bg-foreground px-8 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            href="/board"
          >
            게시판 보기
          </Link>
          <Link
            className="flex h-14 w-full max-w-xs items-center justify-center rounded-full border border-solid border-black/10 px-8 transition-colors hover:border-transparent hover:bg-black/5 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            href="/board/new"
          >
            글 작성
          </Link>
        </div>
      </main>
    </div>
  );
}
