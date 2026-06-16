export interface Env {
  DB: D1Database;
  PHOTOS_BUCKET: R2Bucket;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  JWT_SECRET: string;
  SITE_URL: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  is_admin: boolean;
  exp: number;
}

export interface DbUser {
  id: string;
  email: string;
  name: string;
  is_admin: number;
  created_at: string;
}
