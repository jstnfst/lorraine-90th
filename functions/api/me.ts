import type { Env } from '../_shared/types';
import { getSession, json, unauthorized } from '../_shared/auth';

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const session = await getSession(request, env);
  if (!session) return unauthorized();
  return json({ id: session.sub, email: session.email, name: session.name, is_admin: session.is_admin });
};
