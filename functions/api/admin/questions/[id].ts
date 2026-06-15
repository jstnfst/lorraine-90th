import type { Env } from '../../../_shared/types';
import { getSession, json, unauthorized, forbidden } from '../../../_shared/auth';

const ANSWER_MAX = 1000;

export const onRequestPut: PagesFunction<Env> = async ({ env, request, params }) => {
  const session = await getSession(request, env);
  if (!session) return unauthorized();
  if (!session.is_admin) return forbidden();

  const id = Number(params['id']);
  const body = await request.json() as { answer?: string };
  const answer = (body.answer ?? '').trim().slice(0, ANSWER_MAX);
  if (!answer) return json({ error: 'Answer is required' }, 400);

  const row = await env.DB.prepare(
    `UPDATE questions SET answer = ?, answered_at = datetime('now')
     WHERE id = ?
     RETURNING id, user_id, question, answer, answered_at, created_at`
  ).bind(answer, id).first<{ user_id: string } & Record<string, unknown>>();

  if (!row) return json({ error: 'Not found' }, 404);

  const user = await env.DB.prepare('SELECT name, email FROM users WHERE id = ?')
    .bind(row.user_id).first<{ name: string; email: string }>();

  return json({ ...row, user_name: user?.name, user_email: user?.email });
};
