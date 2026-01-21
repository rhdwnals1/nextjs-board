export type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string; // API(JSON)에서는 Date가 string으로 옵니다.
};

export type PostCreateBody = {
  title: string;
  content: string;
};

export type PostUpdateBody = {
  title: string;
  content: string;
};

