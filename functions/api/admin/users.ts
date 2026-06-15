import type { Env } from '../../_shared/types';
import { getSession, json, unauthorized, forbidden } from '../../_shared/auth';

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const session = await getSession(request, env);
  if (!session) return unauthorized();
  if (!session.is_admin) return forbidden();

  const rows = await env.DB.prepare(
    'SELECT id, email, name, is_admin, created_at FROM users ORDER BY created_at ASC'
  ).all();

  return json(rows.results.map(u => ({ ...u, is_admin: u.is_admin === 1 })));
};
