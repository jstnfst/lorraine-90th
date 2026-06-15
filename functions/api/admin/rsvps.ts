import type { Env } from '../../_shared/types';
import { getSession, json, unauthorized, forbidden } from '../../_shared/auth';

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const session = await getSession(request, env);
  if (!session) return unauthorized();
  if (!session.is_admin) return forbidden();

  const rows = await env.DB.prepare(
    'SELECT id, name, email, confirmed, created_at FROM rsvps ORDER BY created_at ASC'
  ).all();

  return json(rows.results.map(r => ({ ...r, confirmed: r.confirmed === 1 })));
};
