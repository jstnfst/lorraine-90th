import type { Env } from '../../_shared/types';
import { getSession, json, unauthorized } from '../../_shared/auth';

interface DbPhoto {
  id: number;
  user_id: string;
  user_name: string;
  key: string;
  created_at: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const session = await getSession(request, env);
  if (!session) return unauthorized();

  const result = await env.DB.prepare(
    'SELECT id, user_id, user_name, key, created_at FROM photos ORDER BY created_at DESC'
  ).all<DbPhoto>();

  return json(result.results);
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const session = await getSession(request, env);
  if (!session) return unauthorized();

  const formData = await request.formData();
  const files = formData.getAll('photos') as File[];

  if (!files.length) return json({ error: 'No files provided' }, 400);

  const uploaded: DbPhoto[] = [];

  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const key = `${crypto.randomUUID()}.${ext}`;

    await env.PHOTOS_BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });

    const row = await env.DB.prepare(
      'INSERT INTO photos (user_id, user_name, key) VALUES (?, ?, ?) RETURNING id, user_id, user_name, key, created_at'
    ).bind(session.sub, session.name, key).first<DbPhoto>();

    if (row) uploaded.push(row);
  }

  return json(uploaded, 201);
};
