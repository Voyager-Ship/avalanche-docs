/*
  Warnings:

  - You are about to drop the `Price` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Price" DROP CONSTRAINT "Price_project_id_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "prizes" JSONB NOT NULL DEFAULT '{}';

-- DropTable
DROP TABLE "Price";
