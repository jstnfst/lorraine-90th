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

  const redirectUri = `${env.SITE_URL}/api/auth/microsoft/callback`;

  const tokenRes = await fetch('https://login.microsoftonline.com/consumers/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.MICROSOFT_CLIENT_ID,
      client_secret: env.MICROSOFT_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokens = await tokenRes.json() as { access_token: string; error?: string };

  if (tokens.error || !tokens.access_token) {
    return new Response('Token exchange failed', { status: 400 });
  }

  const meRes = await fetch('https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const me = await meRes.json() as {
    id: string;
    displayName: string;
    mail: string | null;
    userPrincipalName: string;
  };

  // mail can be null on some personal accounts; userPrincipalName is always an email-like value
  const email = me.mail ?? me.userPrincipalName;

  return handleOAuthCallback({ email, name: me.displayName }, env);
};
