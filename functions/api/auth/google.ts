import type { Env } from '../../_shared/types';

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const state = crypto.randomUUID();
  const redirectUri = `${env.SITE_URL}/api/auth/callback`;

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
  });

  return new Response(null, {
    status: 302,
    headers: new Headers([
      ['Location', `https://accounts.google.com/o/oauth2/v2/auth?${params}`],
      ['Set-Cookie', `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=300`],
    ]),
  });
};
