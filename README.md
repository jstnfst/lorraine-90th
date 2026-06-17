# Lorraine's 90th Birthday Party

A Cloudflare Pages app for Lorraine's 90th birthday — guests can RSVP, leave messages, and upload photos.

## Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Cloudflare Pages Functions (TypeScript)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (photo uploads)
- **Auth**: OAuth 2.0 (Google, Microsoft, Yahoo)
- **Deploy**: GitHub Actions → Cloudflare Pages

## Auth

Three OAuth providers are supported. All share the same session/JWT logic via `functions/_shared/oauthCallback.ts`.

### Google
- Initiation: `GET /api/auth/google`
- Callback: `GET /api/auth/callback`
- Set up at: https://console.cloud.google.com → APIs & Services → Credentials
- Env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### Microsoft
- Initiation: `GET /api/auth/microsoft`
- Callback: `GET /api/auth/microsoft/callback`
- Set up at: https://portal.azure.com → App registrations
- Env vars: `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`

### Yahoo
- Initiation: `GET /api/auth/yahoo`
- Callback: `GET /api/auth/yahoo/callback`
- Set up at: https://developer.yahoo.com/apps/
- App type: **Confidential Client** (server-side, secret never exposed to browser)
- Token exchange uses HTTP Basic Auth (`base64(client_id:client_secret)`)
- Scopes: `openid email profile`
- Env vars: `YAHOO_CLIENT_ID`, `YAHOO_CLIENT_SECRET`

## Environment Variables

For local dev, create a `.dev.vars` file (gitignored):

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
YAHOO_CLIENT_ID=...
YAHOO_CLIENT_SECRET=...
JWT_SECRET=...
SITE_URL=http://localhost:8788
```

For production, set these as secrets in the Cloudflare Pages dashboard (Settings → Environment variables), or via the CLI:

```
echo "value" | npx wrangler pages secret put SECRET_NAME --project-name lorraine-90th
```

## Admin

Admin access is granted to the designated admin email on first login, or by promoting any user via the make-admin endpoint. All admin routes require a valid session with `is_admin: true`.

### User Management

| Action | Endpoint |
|---|---|
| List all users | `GET /api/admin/users` |
| Promote user to admin | `POST /api/admin/users/:id/make-admin` |
| Ban user | `POST /api/admin/users/:id/ban` |
| Unban user | `POST /api/admin/users/:id/unban` |

Notes:
- Banned users' RSVPs are excluded from the admin RSVP list
- An admin cannot ban themselves

### RSVPs

| Action | Endpoint |
|---|---|
| List all RSVPs | `GET /api/admin/rsvps` |
| Confirm an RSVP | `POST /api/admin/rsvps/:id/confirm` |

### Questions

| Action | Endpoint |
|---|---|
| Answer a question | `PUT /api/admin/questions/:id` (body: `{ "answer": "..." }`) |

Answers are capped at 1000 characters. Answering records an `answered_at` timestamp.

## Local Development

```
npm install
npm run dev
```

The app runs at `http://localhost:8788` with Pages Functions and D1 via Wrangler.

## Deployment

Push to `master` — a GitHub Action handles the Cloudflare Pages deployment automatically.
