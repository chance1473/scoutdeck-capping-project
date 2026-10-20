# Enterprise-readiness verification

Verification record for the Passo task "Verify what the analysis could not confirm". Each item states whether it is **in place**, **partly built** or **missing**, with the code, configuration or observed run that shows it. This is a check, not a build: gaps are listed for the next analysis to turn into their own tasks.

- Commit checked: `dabc128` (`main`), 2026-10-20.
- Runs observed: `docker compose up --build` from a clean checkout, a live read/write journey, a PostgreSQL outage and recovery, `npm ci`, `npm run build`, `npm test` (22 pass, 0 fail), and read-only `gh` queries of the repository settings.

| Item | Status |
|---|---|
| Core user journey | in place |
| Reproducible application startup | in place |
| Declared product limits | partly built |
| Error handling and recovery | in place |
| Product requirements coverage | partly built |
| Private network access | not applicable (owner decision) |
| Operational observability | partly built |
| SDLC verification and release controls | partly built |
| Support ticketing and development traceability | partly built |
| Internal integration boundaries | partly built |
| Enterprise network, account and cloud ownership | in place |

## Core user journey — in place

Evidence:
- Against the compose stack with a real database, `/`, `/mlb`, `/compare`, `/reports/new` and `/access` returned 200; `/prospects/new` redirects (307) to `/mlb` (`src/app/prospects/new/page.tsx:4`); an imported prospect's detail page returned 200.
- Every mutating action starts with `await requireWriter();` (`src/app/actions.ts:14,58,151,164,181`), enforced by `tests/access-guard.test.ts`. `requireWriter` fails closed without `SCOUTDECK_ACCESS_SECRET` and redirects to `/access` otherwise (`src/lib/access.ts`).
- Observed writes: a signed-out import and a forged cookie were redirected to `/access` with no row written; a wrong secret returned `/access?error=1`; the correct secret set `scoutdeck_writer` (`HttpOnly`, `SameSite=lax`, `Max-Age=43200`); a signed-in MLB import and a signed-in scouting report were both written and shown on the prospect page.

Gaps:
- `prisma/seed.ts` only prints a message, so a fresh install has no data until a live import from `statsapi.mlb.com`.
- `createProspectAction` has no UI form, because `/prospects/new` redirects to `/mlb`.
- The writer cookie is `Secure` in production while compose serves plain HTTP; sessions only persist on `localhost` without TLS.

## Reproducible application startup — in place

Evidence:
- Documented steps: `README.md:38-55` (`npm install`, `cp .env.example .env`, `docker compose up --build`, or local `npm run dev`).
- `Dockerfile:1-10` builds on `node:22-bookworm-slim` with `npm ci`, `prisma generate` and `npm run build`; `docker/entrypoint.sh:3-4` runs `prisma db push` then `npm start`; the app waits for a healthy database (`docker-compose.yml:21-23`).
- Observed: `docker compose up --build -d` exited 0; the app was healthy at 151 s, of which the image build took about 146 s. The log showed the schema in sync and "Ready in 565ms"; `\dt` listed `MlbStatLine`, `Prospect` and `ScoutingReport`.
- From a clean export of the commit: `npm ci` (0 vulnerabilities), `npm run build` and `npm test` all exited 0. CI runs the same commands plus `docker compose config` and `docker build` (`.github/workflows/ci.yml`).

Gaps:
- No migrations directory: the schema is applied with `prisma db push` on every start, so schema changes are not versioned.
- Compose has no `restart:` policy.
- The README uses `npm install` rather than `npm ci`, and its `npm run prisma:seed` step creates nothing.

## Declared product limits — partly built

Evidence:
- `src/lib/limits.ts:5-11` declares grade 20-80, weight 100-350 and the `CLEAR` confirmation word.
- `src/lib/validation.ts` applies the 20-80 grade schema to every tool grade and the report grade, bounds weight and graduation year (2024-2030), and restricts `bats`, `throws`, `schoolType` and `status` to enums.
- `src/app/actions.ts:101-102,165-166` bound MLB ids, roster status (80 chars) and team name (100 chars); `src/lib/performance.ts:6-7` clamps MLB-derived grades; `src/lib/mlb.ts` skips searches under 2 characters and caps results at 20.
- Passing tests: `tests/validation.test.ts` (grade bounds, tool grades, status, CLEAR, weight), `tests/performance.test.ts` (clamping), the OFP rounding test in `tests/writer-token.test.ts`, and the short-query test in `tests/mlb.test.ts`.

Gaps:
- Text fields have no maximum length: prospect `name`, `position`, `height`, `school`, `summary`, `tags` and others; report `scoutName`, `eventName`, `summary`, `strengths`, `weaknesses`. `videoUrl` is not validated as a URL.
- `position` accepts any string even though `POSITIONS` is defined in `src/lib/scouting.ts`.
- Showcase metrics (exit velocity, sixty time, pop time, fastball velocity, spin rate) are unbounded.
- Lists are unbounded: `findMany` without `take` in `src/app/page.tsx:9`, `src/app/compare/page.tsx:13`, `src/app/reports/new/page.tsx:13` and `scripts/refresh-mlb.ts:33`.
- The roster sync batch size of 5 is hard-coded (`src/app/actions.ts:168-169`, `scripts/refresh-mlb.ts:34-35`) rather than declared in `limits.ts`.
- OFP (`src/lib/scouting.ts:41-71`) is not clamped. It stays within 20-80 only because its weights sum to 1 and its inputs are validated.
- No rate limiting anywhere, including sign-in.
- The README declares no limits.

## Error handling and recovery — in place

Evidence:
- Unknown routes and unknown prospect ids return 404 (`notFound()` in `src/app/prospects/[id]/page.tsx:43`); `src/app/not-found.tsx` and `src/app/error.tsx` render custom pages.
- Observed outage: with PostgreSQL stopped, `/api/health` returned 503 `{"ok":false,"service":"scoutdeck","database":"unreachable"}`, database-backed pages returned 500 and rendered "Something went wrong" in a browser, and `/access` still returned 200.
- Observed recovery: after PostgreSQL restarted, `/api/health` returned 200 within about 1 s and every page returned 200, with the app container's restart count still 0.
- MLB failures: 10 s timeout (`src/lib/mlb.ts:4,52`), timeout, network and non-2xx errors wrapped with clear messages (`:55-60`), responses validated with Zod; covered by 5 passing tests in `tests/mlb.test.ts`.

Gaps:
- No `src/app/global-error.tsx`, so a root-layout failure falls back to Next's default page.
- An MLB outage fails the whole `/mlb` page rather than degrading it, and there are no retries. This was verified by unit tests, not a live outage.

## Product requirements coverage — partly built

Evidence:
- `docs/REQUIREMENTS.md` maps 12 requirements (DC-001 to DC-007, CAP-001 to CAP-004, NFR-001 to NFR-003) to code and verification, and every cited file exists.
- Spot-checks matching the code: DC-002 (roster batches of 5, previous-season fallback), NFR-001 (limits and their tests), CAP-002 (OFP functions and test), CAP-003 (health responses), and the CAP-004 note that `signOutAction` has no UI caller.

Gaps:
- DC-001 is stale: it says `requireWriter` redirects when the secret is unset (it now throws), describes the old untimestamped token (now `scoutdeck-writer-v2` with a 12-hour expiry), and says the per-action guard is untested (now covered by `tests/access-guard.test.ts`).
- CAP-001 is stale: it says the MLB client has no automated test (`tests/mlb.test.ts` has 5) and omits the 10 s timeout.
- DC-003 is stale: it says the Zod schemas are untested (`tests/validation.test.ts` covers them).
- None of the six requirements verified manually (DC-004 to DC-007, CAP-003, NFR-002) has a recorded result.
- `README.md:62` documents the health response without the `service` field the code returns.

## Private network access — not applicable (owner decision)

Evidence:
- `docs/OWNERSHIP.md:5-7` records the owner decision of 2026-10-14 that no corporate VPN, enterprise network or segmentation applies, to be revisited before any hosted deployment. The Passo VPN task is parked as deferred for the same reason.
- PostgreSQL is published on loopback only (`docker-compose.yml:12-13`, `"127.0.0.1:5432:5432"`).
- A search for `vpn|wireguard|tailscale|ingress|terraform|vpc|security_group|allowlist|firewall|nginx|caddy|traefik` outside `node_modules` finds only the decision in `docs/OWNERSHIP.md`; there is no infrastructure-as-code, proxy or middleware.
- Writes are protected by the shared writer secret (`src/app/access/actions.ts`, `src/lib/access.ts`), not by network.

Gaps (only relevant if the decision changes):
- The app port is published on all host interfaces (`docker-compose.yml:28`, `"3000:3000"`) with no TLS, proxy or IP allowlist.
- `signInAction` has no rate limiting or lockout.

## Operational observability — partly built

Evidence:
- `src/app/api/health/route.ts:4-22` runs `SELECT 1` and returns 200 or 503 with a JSON body; both were observed and match `README.md:61-67`. Failures are logged with a `[health]` prefix, and page errors are logged with a digest.
- Compose healthchecks: `pg_isready` for the database (`docker-compose.yml:15-19`) and a `/api/health` probe for the app (`:29-34`). The app was observed turning `unhealthy` during the outage and `healthy` again afterwards.

Gaps:
- No metrics, tracing or structured logs (no OpenTelemetry, Prometheus, pino or Sentry, and no `src/instrumentation.ts`).
- No request logging or correlation ids beyond Next's error digest.
- The `Dockerfile` has no `HEALTHCHECK`, and nothing acts on `unhealthy` (no restart policy, no alerting).
- The health check covers the database only, not the MLB API.

## SDLC verification and release controls — partly built

Evidence:
- `.github/workflows/ci.yml` runs on pull requests and pushes to `main` with `contents: read`: a "Build and test" job (`npm ci`, `npm run build`, `npm test`) and a "Validate compose and Docker image" job.
- `gh run list --branch main --limit 10`: 8 successful runs and 1 cancelled by the concurrency setting; the latest (`dabc128`) passed.
- `.github/pull_request_template.md` and the issue templates exist.

Gaps:
- `main` is not protected: `gh api .../branches/main/protection` returns "Branch not protected" (404), and there are no rulesets, required reviews or required checks.
- No CODEOWNERS file, no `.github/dependabot.yml`, and no releases or tags.
- Recent commits (`1c72ac4`, `f7f52d2`, `83567b6`, `b3eaed2`, `dabc128`) were pushed directly to `main`, so CI ran after merging rather than gating it; only PRs #1-#3 went through review.
- `actions/checkout@v4` and `actions/setup-node@v4` target the deprecated Node 20 runtime.

## Support ticketing and development traceability — partly built

Evidence:
- `SUPPORT.md` routes requests to GitHub Issues, sends security reports to private advisories, names `chance1473` as owner and escalation contact (`urgent` label), and defines the path from request to release.
- `.github/ISSUE_TEMPLATE/` disables blank issues and provides bug and support forms that auto-label and assign `chance1473`; `support`, `security` and `urgent` labels exist.
- Issue #4 links the mass-assignment finding to fix commit `1c72ac4` and passing CI run `38670352965`, and is closed.
- Private vulnerability reporting, secret scanning and push protection are enabled.

Gaps:
- No `SECURITY.md`.
- No commit references an issue: `SUPPORT.md` asks for `Fixes #<issue>`, but `1c72ac4` does not mention `#4`, so the link only runs from the issue to the commit. Issue #4 was closed by hand.
- Work has not gone through PRs, so the PR template has not been exercised.
- Dependabot security updates are disabled.

## Internal integration boundaries — partly built

Evidence:
- Every boundary in `docs/INTERFACES.md` exists in code: browser to server actions (`src/app/actions.ts`, guarded and validated), browser to pages and `/api/health`, app to PostgreSQL through the Prisma singleton (`src/lib/prisma.ts`, `prisma/schema.prisma`), and app to the MLB Stats API (`src/lib/mlb.ts`, timeout, wrapped errors, Zod parsing, 5 minute to 24 hour revalidation).
- The only outbound HTTP call in `src/`, `scripts/` and `next.config.ts` is `src/lib/mlb.ts:49`.

Gaps:
- `docs/INTERFACES.md` says it lists every boundary but omits two:
  - The ungated sign-in action (`src/app/access/actions.ts:8-24`).
  - The operator-run `scripts/refresh-mlb.ts` (`npm run mlb:refresh`), which reads and writes PostgreSQL with its own `PrismaClient` and calls the MLB API.
- `/mlb` calls the MLB API during page rendering, which the doc covers only by implication.

## Enterprise network, account and cloud ownership — in place

Evidence:
- `docs/OWNERSHIP.md` matches the observed state:
  - `chance1473` is the only collaborator (admin), with no outside collaborators or invitations.
  - There are no deploy keys or webhooks, no Actions secrets, variables or environments, and no Pages site.
  - The repository is public.
  - CI uses `contents: read` and no secrets.
- No cloud or infrastructure configuration exists in the repository.

Gaps:
- Installed GitHub Apps could not be listed with the owner's token (the API needs an app token). The Passo account is outside GitHub and was not checked.
