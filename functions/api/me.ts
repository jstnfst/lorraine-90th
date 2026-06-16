import type { Env, DbUser } from '../_shared/types';
import { getSession, json, unauthorized } from '../_shared/auth';

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const session = await getSession(request, env);
  if (!session) return unauthorized();

  const user = await env.DB.prepare(
    'SELECT id, email, name, is_admin, banned FROM users WHERE id = ?'
  ).bind(session.sub).first<DbUser>();

  if (!user) return unauthorized();

  return json({
    id: user.id,
    email: user.email,
    name: user.name,
    is_admin: user.is_admin === 1,
    banned: user.banned === 1,
  });
};
