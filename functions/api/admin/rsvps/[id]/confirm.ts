import type { Env } from '../../../../_shared/types';
import { getSession, json, unauthorized, forbidden } from '../../../../_shared/auth';

export const onRequestPost: PagesFunction<Env> = async ({ env, request, params }) => {
  const session = await getSession(request, env);
  if (!session) return unauthorized();
  if (!session.is_admin) return forbidden();

  const id = Number(params['id']);

  const row = await env.DB.prepare(
    'UPDATE rsvps SET confirmed = 1 WHERE id = ? RETURNING id, name, email, confirmed, created_at'
  ).bind(id).first();

  if (!row) return json({ error: 'RSVP not found' }, 404);

  return json({ ...row, confirmed: true });
};
