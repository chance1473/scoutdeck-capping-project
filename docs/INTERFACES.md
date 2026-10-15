# Integration boundaries

ScoutDeck is one Next.js service with one PostgreSQL database. It has no CRM, ERP, HR, identity-provider, message-queue or other internal enterprise integration. Every boundary it does have is listed below.

Owner of every boundary: the repository owner, GitHub account `chance1473`.

## Inventory

| Boundary | Direction | Identity and authorization | Data crossing it | Contract | Failure handling |
| --- | --- | --- | --- | --- | --- |
| Browser to server actions (`src/app/actions.ts`) | Inbound | Writer cookie, an HMAC of `SCOUTDECK_ACCESS_SECRET` that expires after 12 hours, checked by `requireWriter()` before any input is read | Prospect and report form fields; MLB ids for import | Zod schemas in `src/lib/validation.ts`; prospects are written from an explicit field list | Signed-out callers are redirected to `/access`; invalid input throws before any write; a missing secret fails closed |
| Browser to pages and `/api/health` | Inbound | None; pages are read-only | Rendered prospect, report and MLB data | Next.js App Router routes | Errors render `src/app/error.tsx`; unknown routes render `not-found.tsx`; health returns 503 when the database is unreachable |
| App to PostgreSQL (Prisma) | Outbound, private | `DATABASE_URL` credential, supplied only from the operator's uncommitted `.env` | All prospects, reports, MLB stat lines | `prisma/schema.prisma` | Health check runs `SELECT 1`; Prisma errors surface through the error page and the `[health]` log line |
| App to MLB Stats API (`src/lib/mlb.ts`) | Outbound, public HTTPS | None; public read-only API at `statsapi.mlb.com` | Teams, 40-man rosters, player bio and season stats; nothing is sent except ids and search names | Zod schemas for teams, people and roster entries; responses that break them are rejected before any write | 10-second timeout; non-2xx, timeout and network failures raise named errors; results are cached 5 minutes to 24 hours |
| Operator to the app container | Inbound, administrative | Shell access to the host running Docker Compose | Environment variables | `docker-compose.yml`, `.env.example` | Compose healthchecks on `db` and `app` |

Accounts, administrative access and network exposure are covered in [OWNERSHIP.md](OWNERSHIP.md).

## Verification

- `npm test` runs `tests/mlb.test.ts`, which stubs `fetch` and checks the MLB request URL and timeout signal, the 503 path, a contract-breaking payload, timeout and network errors, and the short-query guard.
- `tests/writer-token.test.ts` and `tests/validation.test.ts` cover the writer cookie, input bounds and the explicit prospect field list.
- The health endpoint's 200 and 503 behaviour is described in the README under "Health and diagnosis".
