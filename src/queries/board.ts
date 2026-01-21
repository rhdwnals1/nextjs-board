import { getPost, getPosts } from "@/services/posts";

export const boardKeys = {
  all: ["board"] as const,
  posts: () => [...boardKeys.all, "posts"] as const,
  post: (id: number) => [...boardKeys.all, "post", id] as const,
};

export function postsListQuery() {
  return {
    queryKey: boardKeys.posts(),
    queryFn: () => getPosts(),
  };
}

export function postDetailQuery(id: number) {
  return {
    queryKey: boardKeys.post(id),
    queryFn: () => getPost(id),
    enabled: Number.isInteger(id) && id > 0,
  };
}

