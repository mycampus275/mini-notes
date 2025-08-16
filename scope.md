Mini Notes – Scope (Phase 1)

Architecture
- Browser (untrusted) → Vercel serverless (/api, trusted) → Supabase Postgres (trusted).
- Secrets live only in Vercel env vars (server). No NEXT_PUBLIC secrets.

API contracts (JSON in/out)
- POST /api/notes        body: { deviceId, title, body }          → { note }
- GET  /api/notes?deviceId=…                                      → { notes: [...] }
- PUT  /api/notes/:id    body: { deviceId, title?, body? }        → { note }
- DELETE /api/notes/:id  body: { deviceId }                       → { ok: true }

Status codes
- 400 validation (missing/invalid UUID, title>120, body>5000)
- 403 origin/ownership check fails
- 405 wrong method
- 500 server/db issues

Security rules (Phase 1)
- Same-origin only: API accepts requests from this site’s origin.
- Validate UUID + length limits server-side.
- No logging of secrets or request bodies with secrets.
- RLS disabled in DB for Phase 1 (service role key used only on server).
