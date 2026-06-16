import type { Env } from '../../_shared/types';
import { getSession, json, unauthorized, forbidden } from '../../_shared/auth';

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const session = await getSession(request, env);
  if (!session) return unauthorized();
  if (!session.is_admin) return forbidden();

  const rows = await env.DB.prepare(
    `SELECT r.id, r.name, r.email, r.confirmed, r.created_at
     FROM rsvps r
     JOIN users u ON u.id = r.user_id
     WHERE u.banned = 0
     ORDER BY r.created_at ASC`
  ).all();

  return json(rows.results.map(r => ({ ...r, confirmed: r.confirmed === 1 })));
};
