import type { Env, DbUser } from './types';
import { signJWT } from './jwt';

const SESSION_SECONDS = 7 * 24 * 60 * 60;

export interface OAuthUserInfo {
  email: string;
  name: string;
}

export async function handleOAuthCallback(userInfo: OAuthUserInfo, env: Env): Promise<Response> {
  const existing = await env.DB.prepare(
    'SELECT * FROM users WHERE email = ? COLLATE NOCASE'
  ).bind(userInfo.email).first<DbUser>();

  let userId: string;
  let isAdmin: boolean;

  if (existing) {
    userId = existing.id;
    isAdmin = existing.is_admin === 1;
    await env.DB.prepare('UPDATE users SET name = ? WHERE id = ?')
      .bind(userInfo.name, userId).run();
  } else {
    userId = crypto.randomUUID();
    isAdmin = userInfo.email.toLowerCase() === (env.ADMIN_EMAIL ?? '').toLowerCase();
    await env.DB.prepare('INSERT INTO users (id, email, name, is_admin) VALUES (?, ?, ?, ?)')
      .bind(userId, userInfo.email, userInfo.name, isAdmin ? 1 : 0).run();
  }

  const token = await signJWT(
    { sub: userId, email: userInfo.email, name: userInfo.name, is_admin: isAdmin,
      exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS },
    env.JWT_SECRET
  );

  const headers = new Headers([
    ['Location', '/'],
    ['Set-Cookie', `session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_SECONDS}`],
    ['Set-Cookie', `oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`],
  ]);

  return new Response(null, { status: 302, headers });
}
