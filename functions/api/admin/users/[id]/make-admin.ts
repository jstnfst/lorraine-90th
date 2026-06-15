import type { Env } from '../../../../_shared/types';
import { getSession, json, unauthorized, forbidden } from '../../../../_shared/auth';

export const onRequestPost: PagesFunction<Env> = async ({ env, request, params }) => {
  const session = await getSession(request, env);
  if (!session) return unauthorized();
  if (!session.is_admin) return forbidden();

  const id = params['id'] as string;

  const result = await env.DB.prepare(
    'UPDATE users SET is_admin = 1 WHERE id = ? RETURNING id, email, name, is_admin'
  ).bind(id).first();

  if (!result) return json({ error: 'User not found' }, 404);

  return json({ ...result, is_admin: true });
};
