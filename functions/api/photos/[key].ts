import type { Env } from '../../_shared/types';
import { getSession, json, unauthorized, forbidden } from '../../_shared/auth';

export const onRequestGet: PagesFunction<Env> = async ({ env, request, params }) => {
  const session = await getSession(request, env);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const key = params.key as string;
  const object = await env.PHOTOS_BUCKET.get(key);

  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new Response(object.body, { headers });
};

export const onRequestDelete: PagesFunction<Env> = async ({ env, request, params }) => {
  const session = await getSession(request, env);
  if (!session) return unauthorized();

  const key = params.key as string;

  const photo = await env.DB.prepare(
    'SELECT user_id FROM photos WHERE key = ?'
  ).bind(key).first<{ user_id: string }>();

  if (!photo) return json({ error: 'Not found' }, 404);
  if (!session.is_admin && photo.user_id !== session.sub) return forbidden();

  await env.PHOTOS_BUCKET.delete(key);
  await env.DB.prepare('DELETE FROM photos WHERE key = ?').bind(key).run();

  return json({ ok: true });
};
