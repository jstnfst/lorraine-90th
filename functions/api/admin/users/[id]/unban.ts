import type { Env } from '../../../../_shared/types';
import { getSession, json, unauthorized, forbidden } from '../../../../_shared/auth';

export const onRequestPost: PagesFunction<Env> = async ({ env, request, params }) => {
  const session = await getSession(request, env);
  if (!session) return unauthorized();
  if (!session.is_admin) return forbidden();

  const id = params.id as string;

  await env.DB.prepare('UPDATE users SET banned = 0 WHERE id = ?').bind(id).run();

  return json({ ok: true });
};
