Manual Test Plan – Phase 1

Fresh profile
- First load → list is empty.
- Create note → appears at top with timestamps.

Edit / Delete
- Edit a note → updatedAt > createdAt.
- Delete a note → disappears; editing after delete fails.

Isolation
- Open site in another browser/profile → sees different (empty) list.

Validation
- Overlong title (>120) or body (>5000) → API returns 400 with clear JSON error.

Error handling
- Temporarily break a server env var in Preview → API returns 500; logs show no secrets.

Observability
- Vercel Functions logs show method, path, status; no secrets; 0 crashes under normal flow.
