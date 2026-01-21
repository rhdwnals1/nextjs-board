import { z } from "zod";

export const boardUpsertSchema = z.object({
  title: z.string().trim().min(1, "title은 비어있을 수 없습니다."),
  content: z.string().trim().min(1, "content는 비어있을 수 없습니다."),
});

export type BoardUpsertInput = z.infer<typeof boardUpsertSchema>;
