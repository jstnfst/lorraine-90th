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
- Set up at: https://console.cloud.google.com → APIs & Services → Credentials → OAuth client ID → Web application
- Authorization endpoint: `https://accounts.google.com/o/oauth2/v2/auth`
- Token endpoint: `https://oauth2.googleapis.com/token`
- Userinfo endpoint: `https://www.googleapis.com/oauth2/v2/userinfo`
- Token exchange uses POST body params (client_id + client_secret in body)
- Required authorization parameters: `client_id`, `redirect_uri`, `response_type=code`, `scope`, `state`, `access_type=online`
- Scopes: `openid email profile`
- Consent screen: set to External; no special API permissions needed beyond the OAuth client itself
- Env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### Microsoft
- Initiation: `GET /api/auth/microsoft`
- Callback: `GET /api/auth/microsoft/callback`
- Set up at: https://portal.azure.com → App registrations → New registration
- Authorization endpoint: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`
- Token endpoint: `https://login.microsoftonline.com/common/oauth2/v2.0/token`
- Userinfo endpoint: `https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName`
- Token exchange uses POST body params (client_id + client_secret in body)
- Required authorization parameters: `client_id`, `redirect_uri`, `response_type=code`, `scope`, `response_mode=query`, `state`
- Scopes: `openid email profile User.Read`
- Use `/common` tenant to support both personal and work Microsoft accounts
- `mail` can be null on some personal accounts; fall back to `userPrincipalName`
- Env vars: `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`

### Yahoo
- Initiation: `GET /api/auth/yahoo`
- Callback: `GET /api/auth/yahoo/callback`
- Set up at: https://developer.yahoo.com/apps/
- App type: **Confidential Client** (server-side, secret never exposed to browser)
- Authorization endpoint: `https://api.login.yahoo.com/oauth2/request_auth`
- Token endpoint: `https://api.login.yahoo.com/oauth2/get_token`
- Userinfo endpoint: `https://api.login.yahoo.com/openid/v1/userinfo`
- Token exchange uses HTTP Basic Auth (`base64(client_id:client_secret)`)
- Required authorization parameters: `client_id`, `redirect_uri`, `response_type=code`, `scope`, `nonce`, `state`
- Scopes: `openid email profile`
- API permissions required in Yahoo app: OpenID Connect → Email + Profile
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
