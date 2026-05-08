-- Rollback SQL for 03_forward_report_missing_migrations.sql
-- WARNING: this drops structures and can fail if there is dependent data/objects.

-- Reverse dependency order
DROP TABLE IF EXISTS "ProjectRepository";
DROP TABLE IF EXISTS "Repository";

DROP TABLE IF EXISTS "NotificationEmailState";
DROP TABLE IF EXISTS "NotificationInboxState";
DROP TABLE IF EXISTS "Notification";
DROP TABLE IF EXISTS "NotificationTemplate";

DROP TABLE IF EXISTS "Contract";
DROP TABLE IF EXISTS "Speaker";

-- Column rollback (only if these were introduced by the forward script)
ALTER TABLE "FormData" DROP COLUMN IF EXISTS "origin";

-- WARNING: this can fail if rows now contain NULL hackaton_id
ALTER TABLE "Project" ALTER COLUMN "hackaton_id" SET NOT NULL;
ALTER TABLE "Project" DROP COLUMN IF EXISTS "socials";
ALTER TABLE "Project" DROP COLUMN IF EXISTS "website";
ALTER TABLE "Project" DROP COLUMN IF EXISTS "other_category";
ALTER TABLE "Project" DROP COLUMN IF EXISTS "origin";
ALTER TABLE "Project" DROP COLUMN IF EXISTS "categories";

ALTER TABLE "User" DROP COLUMN IF EXISTS "notification_means";
ALTER TABLE "User" DROP COLUMN IF EXISTS "wallet";
ALTER TABLE "User" DROP COLUMN IF EXISTS "user_type";
ALTER TABLE "User" DROP COLUMN IF EXISTS "skills";
ALTER TABLE "User" DROP COLUMN IF EXISTS "noun_avatar_seed";
ALTER TABLE "User" DROP COLUMN IF EXISTS "noun_avatar_enabled";
ALTER TABLE "User" DROP COLUMN IF EXISTS "github";
ALTER TABLE "User" DROP COLUMN IF EXISTS "country";
