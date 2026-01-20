import type { Post, PostCreateBody, PostUpdateBody } from "@/types/post";

type ApiError = {
  error?: string;
};

async function readApiError(res: Response) {
  const data = (await res.json().catch(() => null)) as ApiError | null;
  return data?.error ?? `${res.status} ${res.statusText}`;
}

export async function getPosts(): Promise<Post[]> {
  const res = await fetch("/api/board");
  if (!res.ok) throw new Error(await readApiError(res));
  return (await res.json()) as Post[];
}

export async function getPost(id: number): Promise<Post> {
  const res = await fetch(`/api/board/${id}`);
  if (!res.ok) throw new Error(await readApiError(res));
  return (await res.json()) as Post;
}

export async function createPost(body: PostCreateBody): Promise<Post> {
  const res = await fetch("/api/board", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  return (await res.json()) as Post;
}

export async function updatePost(
  id: number,
  body: PostUpdateBody
): Promise<Post> {
  const res = await fetch(`/api/board/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  return (await res.json()) as Post;
}

export async function deletePost(id: number): Promise<void> {
  const res = await fetch(`/api/board/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await readApiError(res));
}
