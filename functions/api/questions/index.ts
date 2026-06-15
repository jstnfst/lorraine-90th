import type { Env } from '../../_shared/types';
import { getSession, json, unauthorized } from '../../_shared/auth';

const QUESTION_MAX = 500;

export const onRequest: PagesFunction<Env> = async ({ env, request }) => {
  const session = await getSession(request, env);
  if (!session) return unauthorized();

  if (request.method === 'GET') {
    const rows = session.is_admin
      ? await env.DB.prepare(
          `SELECT q.id, q.user_id, u.name AS user_name, u.email AS user_email,
                  q.question, q.answer, q.answered_at, q.created_at
           FROM questions q JOIN users u ON q.user_id = u.id
           ORDER BY q.created_at DESC`
        ).all()
      : await env.DB.prepare(
          `SELECT q.id, q.user_id, u.name AS user_name, u.email AS user_email,
                  q.question, q.answer, q.answered_at, q.created_at
           FROM questions q JOIN users u ON q.user_id = u.id
           WHERE q.user_id = ?
           ORDER BY q.created_at DESC`
        ).bind(session.sub).all();

    return json(rows.results);
  }

  if (request.method === 'POST') {
    const body = await request.json() as { question?: string };
    const text = (body.question ?? '').trim().slice(0, QUESTION_MAX);
    if (!text) return json({ error: 'Question is required' }, 400);

    const result = await env.DB.prepare(
      'INSERT INTO questions (user_id, question) VALUES (?, ?) RETURNING id, user_id, question, answer, answered_at, created_at'
    ).bind(session.sub, text).first();

    const row = {
      ...result,
      user_name: session.name,
      user_email: session.email,
    };

    return json(row, 201);
  }

  return json({ error: 'Method not allowed' }, 405);
};
