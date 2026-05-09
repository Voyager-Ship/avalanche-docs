import { getAuthSession } from '@/lib/auth/authSession';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function base64UrlEncode(input: Buffer): string {
  return input
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const state = crypto.randomUUID();
  const codeVerifier = base64UrlEncode(crypto.randomBytes(64));
  const codeChallenge = base64UrlEncode(
    crypto.createHash('sha256').update(codeVerifier).digest()
  );

  const url = new URL('https://twitter.com/i/oauth2/authorize');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', process.env.X_ID!);
  url.searchParams.set(
    'redirect_uri',
    `${process.env.NEXTAUTH_URL}/api/auth/x-link/callback`
  );
  url.searchParams.set('scope', 'users.read tweet.read');
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');

  const response = NextResponse.redirect(url);
  const cookieOptions = {
    httpOnly: true,
    maxAge: 1800,
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  };
  response.cookies.set('x_link_state', state, cookieOptions);
  response.cookies.set('x_link_verifier', codeVerifier, cookieOptions);

  const requestedReturnTo = new URL(req.url).searchParams.get('returnTo');
  if (
    requestedReturnTo &&
    requestedReturnTo.startsWith('/') &&
    !requestedReturnTo.startsWith('//')
  ) {
    response.cookies.set('x_link_return_to', requestedReturnTo, cookieOptions);
  }

  return response;
}
