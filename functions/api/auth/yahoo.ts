import type { Env } from '../../_shared/types';

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();
  const redirectUri = `${env.SITE_URL}/api/auth/yahoo/callback`;

  const params = new URLSearchParams({
    client_id: env.YAHOO_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    nonce,
  });

  return new Response(null, {
    status: 302,
    headers: new Headers([
      ['Location', `https://api.login.yahoo.com/oauth2/request_auth?${params}`],
      ['Set-Cookie', `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=300`],
    ]),
  });
};
