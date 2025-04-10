/*
  Warnings:

  - The `content` column on the `Hackathon` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Hackathon" DROP COLUMN "content",
ADD COLUMN     "content" JSONB[] DEFAULT ARRAY[]::JSONB[];
