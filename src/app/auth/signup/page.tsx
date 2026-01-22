"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signup } from "@/services/auth";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const signupMutation = useMutation({
    mutationFn: () => signup(name, password),
    onSuccess: async (user) => {
      // 인증 쿼리 캐시 업데이트
      queryClient.setQueryData(["auth", "me"], user);
      // 게시판으로 리다이렉트
      router.push("/board");
      router.refresh();
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signupMutation.mutateAsync();
    } catch (e) {
      alert(e instanceof Error ? e.message : "회원가입에 실패했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>
                이름
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                required
                minLength={1}
                maxLength={64}
                disabled={signupMutation.isPending}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                비밀번호
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요 (최소 4자)"
                required
                minLength={4}
                disabled={signupMutation.isPending}
              />
            </div>
            <Button type="submit" disabled={signupMutation.isPending} className={styles.button}>
              {signupMutation.isPending ? "가입 중..." : "회원가입"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className={styles.footer}>
          <Link href="/auth/login" className={styles.link}>
            로그인
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

const styles = {
  container: "flex items-center justify-center min-h-screen p-6",
  card: "w-full max-w-md",
  form: "space-y-4",
  field: "space-y-2",
  label: "text-sm font-medium",
  button: "w-full",
  footer: "justify-center",
  link: "text-sm text-zinc-600 hover:underline dark:text-zinc-300",
};
