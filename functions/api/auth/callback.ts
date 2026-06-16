import type { Env } from '../../_shared/types';
import { parseCookies } from '../../_shared/auth';
import { handleOAuthCallback } from '../../_shared/oauthCallback';

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookies = parseCookies(request.headers.get('Cookie'));

  if (!code || !state || state !== cookies['oauth_state']) {
    return new Response('Invalid OAuth state', { status: 400 });
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${env.SITE_URL}/api/auth/callback`,
      grant_type: 'authorization_code',
    }),
  });

  const tokens = await tokenRes.json() as { access_token: string };

  const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const gUser = await infoRes.json() as { email: string; name: string };

  return handleOAuthCallback({ email: gUser.email, name: gUser.name }, env);
};
