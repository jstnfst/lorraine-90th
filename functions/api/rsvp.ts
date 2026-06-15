import type { Env } from '../_shared/types';
import { getSession, json, unauthorized } from '../_shared/auth';

export const onRequest: PagesFunction<Env> = async ({ env, request }) => {
  const session = await getSession(request, env);
  if (!session) return unauthorized();

  if (request.method === 'GET') {
    const row = await env.DB.prepare(
      'SELECT id, name, email, confirmed, created_at FROM rsvps WHERE user_id = ?'
    ).bind(session.sub).first();
    return json(row ?? null);
  }

  if (request.method === 'POST') {
    const body = await request.json() as { name?: string; email?: string };
    const name = (body.name ?? '').trim();
    const email = (body.email ?? session.email).trim();
    if (!name) return json({ error: 'Name is required' }, 400);

    const existing = await env.DB.prepare('SELECT id FROM rsvps WHERE user_id = ?')
      .bind(session.sub).first();

    if (existing) {
      const row = await env.DB.prepare(
        'SELECT id, name, email, confirmed, created_at FROM rsvps WHERE user_id = ?'
      ).bind(session.sub).first();
      return json(row);
    }

    const row = await env.DB.prepare(
      'INSERT INTO rsvps (user_id, name, email) VALUES (?, ?, ?) RETURNING id, name, email, confirmed, created_at'
    ).bind(session.sub, name, email).first();

    return json(row, 201);
  }

  return json({ error: 'Method not allowed' }, 405);
};
