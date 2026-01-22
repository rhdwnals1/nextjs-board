"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/services/auth";

export function useAuth(redirectToLogin = true) {
  const router = useRouter();
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
  });

  useEffect(() => {
    if (!isLoading && !user && redirectToLogin) {
      router.push("/auth/login");
    }
  }, [user, isLoading, redirectToLogin, router]);

  return { user, isLoading, isAuthenticated: !!user };
}
