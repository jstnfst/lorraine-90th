import type { Env, DbUser } from '../../_shared/types';
import { parseCookies } from '../../_shared/auth';
import { signJWT } from '../../_shared/jwt';

const SESSION_SECONDS = 7 * 24 * 60 * 60;

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

  const gUser = await infoRes.json() as { id: string; email: string; name: string };

  const existing = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
    .bind(gUser.email)
    .first<DbUser>();

  let userId: string;
  let isAdmin: boolean;

  if (existing) {
    userId = existing.id;
    isAdmin = existing.is_admin === 1;
    await env.DB.prepare('UPDATE users SET name = ? WHERE id = ?')
      .bind(gUser.name, userId).run();
  } else {
    userId = crypto.randomUUID();
    isAdmin = gUser.email === 'jstnfst@gmail.com';
    await env.DB.prepare('INSERT INTO users (id, email, name, is_admin) VALUES (?, ?, ?, ?)')
      .bind(userId, gUser.email, gUser.name, isAdmin ? 1 : 0).run();
  }

  const token = await signJWT(
    { sub: userId, email: gUser.email, name: gUser.name, is_admin: isAdmin, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS },
    env.JWT_SECRET
  );

  const headers = new Headers([
    ['Location', '/'],
    ['Set-Cookie', `session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_SECONDS}`],
    ['Set-Cookie', `oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`],
  ]);

  return new Response(null, { status: 302, headers });
};
