import type { Env } from '../../_shared/types';

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const state = crypto.randomUUID();
  const redirectUri = `${env.SITE_URL}/api/auth/microsoft/callback`;

  const params = new URLSearchParams({
    client_id: env.MICROSOFT_CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: 'openid email profile User.Read',
    response_mode: 'query',
    state,
  });

  return new Response(null, {
    status: 302,
    headers: new Headers([
      ['Location', `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?${params}`],
      ['Set-Cookie', `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=300`],
    ]),
  });
};
