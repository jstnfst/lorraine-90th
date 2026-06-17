import type { Env } from '../../../_shared/types';
import { parseCookies } from '../../../_shared/auth';
import { handleOAuthCallback } from '../../../_shared/oauthCallback';

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookies = parseCookies(request.headers.get('Cookie'));

  if (!code || !state || state !== cookies['oauth_state']) {
    return new Response('Invalid OAuth state', { status: 400 });
  }

  const redirectUri = `${env.SITE_URL}/api/auth/yahoo/callback`;
  const credentials = btoa(`${env.YAHOO_CLIENT_ID}:${env.YAHOO_CLIENT_SECRET}`);

  const tokenRes = await fetch('https://api.login.yahoo.com/oauth2/get_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokens = await tokenRes.json() as { access_token: string; error?: string };

  if (tokens.error || !tokens.access_token) {
    return new Response('Token exchange failed', { status: 400 });
  }

  const infoRes = await fetch('https://api.login.yahoo.com/openid/v1/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const yUser = await infoRes.json() as { email: string; name: string };

  return handleOAuthCallback({ email: yUser.email, name: yUser.name }, env);
};
