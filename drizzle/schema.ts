import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  unique,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .notNull()
    .defaultNow(),
});

export const boards = pgTable("boards", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  viewCount: integer("view_count").notNull().default(0), 
  createdAt: timestamp("created_at", { withTimezone: false })
    .notNull()
    .defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  boardId: integer("board_id")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  authorId: integer("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: false })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .notNull()
    .defaultNow(),
});

// 게시글 좋아요 (사용자 ↔ 게시글 N:M 관계)
export const boardLikes = pgTable(
  "board_likes",
  {
    id: serial("id").primaryKey(),
    boardId: integer("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: false })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueBoardUser: unique().on(table.boardId, table.userId),
  })
);

// 댓글 좋아요 (사용자 ↔ 댓글 N:M 관계)
export const commentLikes = pgTable(
  "comment_likes",
  {
    id: serial("id").primaryKey(),
    commentId: integer("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: false })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueCommentUser: unique().on(table.commentId, table.userId),
  })
);

// 알림 (내 게시글/댓글에 좋아요가 눌렸을 때)
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(), // 'board_like' | 'comment_like' | 'board_comment'
  boardId: integer("board_id").references(() => boards.id, {
    onDelete: "cascade",
  }),
  commentId: integer("comment_id").references(() => comments.id, {
    onDelete: "cascade",
  }),
  actorId: integer("actor_id").references(() => users.id, {
    onDelete: "set null",
  }), // 알림 발생시킨 사람
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: false })
    .notNull()
    .defaultNow(),
});

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type BoardRow = typeof boards.$inferSelect;
export type NewBoardRow = typeof boards.$inferInsert;
export type CommentRow = typeof comments.$inferSelect;
export type NewCommentRow = typeof comments.$inferInsert;
export type SessionRow = typeof sessions.$inferSelect;
export type NewSessionRow = typeof sessions.$inferInsert;
export type BoardLikeRow = typeof boardLikes.$inferSelect;
export type NewBoardLikeRow = typeof boardLikes.$inferInsert;
export type CommentLikeRow = typeof commentLikes.$inferSelect;
export type NewCommentLikeRow = typeof commentLikes.$inferInsert;
export type NotificationRow = typeof notifications.$inferSelect;
export type NewNotificationRow = typeof notifications.$inferInsert;