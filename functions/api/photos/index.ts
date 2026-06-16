import type { Env } from '../../_shared/types';
import { getSession, json, unauthorized } from '../../_shared/auth';

const MAX_PHOTOS_PER_USER = 10;
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

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
  const files = (formData.getAll('photos') as File[]).filter(f => f.type.startsWith('image/'));

  if (!files.length) return json({ error: 'No image files provided' }, 400);

  const { count } = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM photos WHERE user_id = ?'
  ).bind(session.sub).first<{ count: number }>() ?? { count: 0 };

  const slots = MAX_PHOTOS_PER_USER - count;
  if (slots <= 0) {
    return json({ error: `You've reached the ${MAX_PHOTOS_PER_USER}-photo limit.` }, 400);
  }

  const toUpload = files.slice(0, slots);
  const skippedCount = files.length - toUpload.length;
  const oversized = toUpload.filter(f => f.size > MAX_FILE_SIZE).map(f => f.name);

  const uploaded: DbPhoto[] = [];

  for (const file of toUpload) {
    if (file.size > MAX_FILE_SIZE) continue;

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

  return json({ uploaded, skippedCount, oversized }, 201);
};
