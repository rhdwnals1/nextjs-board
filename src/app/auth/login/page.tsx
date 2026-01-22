"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { login } from "@/services/auth";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: () => login(name, password),
    onSuccess: () => {
      router.push("/board");
      router.refresh();
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync();
    } catch (e) {
      alert(e instanceof Error ? e.message : "로그인에 실패했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>로그인</CardTitle>
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
                disabled={loginMutation.isPending}
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
                placeholder="비밀번호를 입력하세요"
                required
                disabled={loginMutation.isPending}
              />
            </div>
            <Button type="submit" disabled={loginMutation.isPending} className={styles.button}>
              {loginMutation.isPending ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className={styles.footer}>
          <Link href="/auth/signup" className={styles.link}>
            회원가입
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
