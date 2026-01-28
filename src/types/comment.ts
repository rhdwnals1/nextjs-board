export type Comment = {
  id: number;
  boardId: number;
  authorId: number | null;
  content: string;
  createdAt: string; // API(JSON)에서는 Date가 string으로 옵니다.
  authorName?: string | null;
  likeCount?: number;
  userLiked?: boolean;
};

export type CommentCreateBody = {
  content: string;
};
