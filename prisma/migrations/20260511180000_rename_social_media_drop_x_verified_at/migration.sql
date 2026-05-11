-- 1. Rename additional_social_media -> additional_social_accounts so the
--    column matches the *_account naming convention used for the typed
--    social fields (x_account, github_account, linkedin_account,
--    telegram_account).
ALTER TABLE "User" RENAME COLUMN "additional_social_media" TO "additional_social_accounts";

-- 2. Drop the x_verified_at column. The presence of x_access_token is now
--    the OAuth-link signal, matching the GitHub pattern
--    (github_account + non-null github_access_token = connected).
ALTER TABLE "User" DROP COLUMN IF EXISTS "x_verified_at";

-- 3. Store the X OAuth access token and refresh token, both encrypted with
--    X_TOKEN_SECRET via lib/x-token.ts. X 2.0 access tokens expire after
--    ~2 hours; the refresh token (issued because we request the
--    `offline.access` scope) lets us swap a dead access token for a new
--    pair without bouncing the user through OAuth again. X rotates the
--    refresh token on each use, so refreshXAccessToken() persists both
--    halves of the new pair.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "x_access_token" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "x_refresh_token" TEXT;
