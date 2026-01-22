-- Add password column to users table
ALTER TABLE "users" ADD COLUMN "password" varchar(255) NOT NULL DEFAULT '';
