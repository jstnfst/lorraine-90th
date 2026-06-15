import type { Env, JWTPayload } from './types';
import { verifyJWT } from './jwt';

export function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k.trim(), v.join('=')];
    })
  );
}

export async function getSession(request: Request, env: Env): Promise<JWTPayload | null> {
  const token = parseCookies(request.headers.get('Cookie'))['session'];
  if (!token) return null;
  return verifyJWT(token, env.JWT_SECRET);
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function unauthorized(): Response {
  return json({ error: 'Unauthorized' }, 401);
}

export function forbidden(): Response {
  return json({ error: 'Forbidden' }, 403);
}
