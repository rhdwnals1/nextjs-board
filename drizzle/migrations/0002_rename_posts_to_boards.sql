-- Rename posts table to boards
ALTER TABLE "posts" RENAME TO "boards";

-- Rename post_id column to board_id in comments table
ALTER TABLE "comments" RENAME COLUMN "post_id" TO "board_id";

-- Drop old foreign key constraint
ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_post_id_posts_id_fk";

-- Add new foreign key constraint
ALTER TABLE "comments" ADD CONSTRAINT "comments_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;

-- Update constraint names for boards table
ALTER TABLE "boards" DROP CONSTRAINT IF EXISTS "posts_author_id_users_id_fk";
ALTER TABLE "boards" ADD CONSTRAINT "boards_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
