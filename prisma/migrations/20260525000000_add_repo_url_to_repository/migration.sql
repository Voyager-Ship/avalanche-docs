ALTER TABLE "Repository"
ADD COLUMN "repo_url" TEXT;

UPDATE "Repository"
SET "repo_url" = "repo_id"
WHERE "repo_url" IS NULL
  AND "repo_id" IS NOT NULL;
