import { prisma } from '@/prisma/prisma';
import { decryptToken, encryptToken } from '@/lib/x-token';

interface XRefreshResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
}

/**
 * Swap an expired X access token for a fresh pair using the stored refresh
 * token. X rotates refresh tokens on every use, so the new refresh token is
 * persisted alongside the new access token. The plaintext tokens are
 * returned for immediate use by the caller; only ciphertext is written back
 * to the database.
 *
 * Requires `offline.access` in the OAuth scope (see app/api/auth/x-link/route.ts)
 * so the original link callback received a refresh token in the first place.
 *
 * Throws if the user is not linked, has no refresh token, or X rejects the
 * grant. On rejection the stored tokens are cleared so the user is prompted
 * to re-link on next attempt rather than retrying with a dead credential.
 */
export async function refreshXAccessToken(
  userId: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const clientId = process.env.X_LINK_ID;
  const clientSecret = process.env.X_LINK_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Missing X_LINK_ID or X_LINK_SECRET for X token refresh');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { x_refresh_token: true },
  });

  if (!user?.x_refresh_token) {
    throw new Error('No X refresh token stored for user; re-link required');
  }

  const refreshToken = decryptToken(user.x_refresh_token);

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    }),
  });

  const body = (await res.json()) as XRefreshResponse;

  if (!res.ok || !body.access_token || !body.refresh_token) {
    // Clear so the next attempt forces a fresh OAuth instead of looping on
    // a permanently bad refresh token.
    await prisma.user.update({
      where: { id: userId },
      data: { x_access_token: null, x_refresh_token: null },
    });
    throw new Error(
      `X token refresh failed: ${body.error_description ?? body.error ?? `HTTP ${res.status}`}`,
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      x_access_token: encryptToken(body.access_token),
      x_refresh_token: encryptToken(body.refresh_token),
    },
  });

  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
  };
}
