export type Comment = {
  id: number;
  postId: number;
  authorId: number | null;
  content: string;
  createdAt: string; // API(JSON)에서는 Date가 string으로 옵니다.
};

export type CommentCreateBody = {
  content: string;
};
