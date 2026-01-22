"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logout } from "@/services/auth";

export function AuthButton() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear(); // 모든 쿼리 캐시 초기화
      router.push("/"); // 홈으로 이동
      router.refresh();
    },
  });

  if (user) {
    return (
      <div className={styles.container}>
        <span className={styles.name}>{user.name}님</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          로그아웃
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/auth/login">로그인</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/auth/signup">회원가입</Link>
      </Button>
    </div>
  );
}

const styles = {
  container: "flex items-center gap-2",
  name: "text-sm text-zinc-600 dark:text-zinc-300",
};
