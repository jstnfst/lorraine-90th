import type { Env } from '../../_shared/types';
import { getSession } from '../../_shared/auth';

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
