import { getComments, getPost, getPosts } from "@/services/posts";

export const boardKeys = {
  all: ["board"] as const,
  posts: () => [...boardKeys.all, "posts"] as const,
  post: (id: number) => [...boardKeys.all, "post", id] as const,
  comments: (postId: number) => [...boardKeys.all, "comments", postId] as const,
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

export function commentsListQuery(postId: number) {
  return {
    queryKey: boardKeys.comments(postId),
    queryFn: () => getComments(postId),
    enabled: Number.isInteger(postId) && postId > 0,
  };
}
