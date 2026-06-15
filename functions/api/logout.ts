import type { Env } from '../_shared/types';

export const onRequestPost: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Set-Cookie': 'session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
    },
  });
};
