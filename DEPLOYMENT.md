# Deployment & Security Notes

This document covers production deployment requirements, compromised development
secrets, and documented/deferred security items.

---

## REQUIRED: Fresh Production Secrets (MUST be configured before deployment)

The following environment variables MUST be freshly generated/configured for
production. **None of the values used during development/testing may be reused.**

| Variable          | Requirement |
|-------------------|-------------|
| `JWT_SECRET`      | Generate a NEW random 64+ hex-character secret (e.g. `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`). The development/test JWT secret was printed in terminal logs during verification and **must be treated as COMPROMISED** — do not reuse it. |
| `ADMIN_EMAIL`     | A real, unique admin email address for production. Do NOT reuse `test@example.com`. |
| `ADMIN_PASSWORD`  | A unique, strong password (12+ chars, upper/lower/digit/special). Do NOT reuse `TestPassword123!`. |

The application enforces these at startup:
- Build fails if `JWT_SECRET` is missing.
- Seeding fails if `ADMIN_EMAIL` / `ADMIN_PASSWORD` are missing or weak.

Never commit secrets to version control. Configure them only in the production
environment (secret manager, hosting provider env vars, etc.).

---

## Residual Dependency Risks (documented, accepted for now)

`npm audit` reports 3 HIGH findings that are transitive dependencies bundled by
Next.js 15.5.23 itself:

1. **postcss** (< 8.5.23) — XSS and arbitrary file read via attacker-controlled
   `sourceMappingURL` in CSS processing.
   - Risk assessment: THEORETICAL for this app. No attacker-controlled CSS is
     processed server-side.
2. **sharp** (< 0.35.0) — inherited libvips CVEs in image decoding.
   - Risk assessment: LOW for this app. Only trusted, locally stored research
     media is processed via Next.js image optimization.

These are fixed upstream only in Next.js 16.x (`next@16.3.2+`, a major upgrade).

### Deferred: Future Next.js 16 upgrade

A future upgrade to a patched Next.js 16 release can close these findings, but
it is intentionally DEFERRED because it is another major-version migration
(React/Next breaking changes) requiring its own compatibility testing pass.
Do not attempt speculative dependency overrides to work around it.

---

## Residual Security Hardening Items (deferred)

- **CSP nonce migration**: Content-Security-Policy currently permits
  `'unsafe-inline'` / `'unsafe-eval'` for scripts/styles. Migrating to
  nonce-based CSP requires middleware restructuring of all script/style
  injection. Existing headers must not be weakened; nonce-based CSP is
  scheduled as a future hardening task once the site is otherwise finalized.
- **Session-revocation UI**: Backend fully supports session revocation
  (`revokeAllSessions`); no admin UI exists for listing active sessions.
  Future enhancement.
- **Database backups**: SQLite database lives on local disk. Establish a file
  backup schedule before production launch.

---

## Rate Limiting — Single-Instance Assumption

The current rate limiter (`next-rate-limit`, in-memory) is kept as-is:

- Works ONLY for a single-instance deployment.
- Counters reset when the process restarts.
- NOT suitable for multi-instance, load-balanced, or serverless deployments —
  each instance keeps independent counters.

If deployment later changes to multiple instances, replace with Redis,
Upstash, or a database-backed rate limiter.

`TRUSTED_PROXY` behavior is unchanged: unless explicitly enabled,
`X-Forwarded-For` client-supplied headers are ignored for rate limiting and
audit logging.

---

## Linting

ESLint runs via the plain ESLint CLI (the `next lint` wrapper is deprecated):

```
npm run lint    # eslint .
```

Configuration lives in `.eslintrc.json` (extends `next/core-web-vitals`).
Known pre-existing warning: one `react-hooks/exhaustive-deps` warning in
`src/app/admin/page.tsx` (intentionally left untouched to avoid behavioral
changes).
