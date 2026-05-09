-- Track when a user's X account was verified via OAuth.
-- NULL means the x_account URL was typed manually (or not set).
ALTER TABLE "User" ADD COLUMN "x_verified_at" TIMESTAMPTZ(3);
