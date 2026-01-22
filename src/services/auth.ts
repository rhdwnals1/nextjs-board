import type { User } from "@/types/user";

type ApiError = {
  error?: string;
};

async function readApiError(res: Response) {
  const data = (await res.json().catch(() => null)) as ApiError | null;
  return data?.error ?? `${res.status} ${res.statusText}`;
}

export async function signup(name: string, password: string): Promise<User> {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, password }),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  return (await res.json()) as User;
}

export async function login(name: string, password: string): Promise<User> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, password }),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  return (await res.json()) as User;
}

export async function logout(): Promise<void> {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
  });
  if (!res.ok) throw new Error(await readApiError(res));
}

export async function getCurrentUser(): Promise<User | null> {
  const res = await fetch("/api/auth/me");
  if (!res.ok) {
    if (res.status === 401) return null;
    throw new Error(await readApiError(res));
  }
  return (await res.json()) as User;
}
