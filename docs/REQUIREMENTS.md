# ScoutDeck Requirements Coverage

This file maps each product requirement to the code that implements it and to how it is verified. It describes the code as it exists on `main`; it is not a roadmap.

Status values:

- **implemented**: behavior exists and an automated test covers the core logic.
- **partial**: behavior exists but part of the requirement is missing or only some of it is tested.
- **manual**: behavior exists, but it is checked only by hand (no automated test).
- **not verified**: behavior exists in code but has no test and no documented manual check.

Automated tests run with `npm test` (`node --experimental-strip-types --test`). They cover pure functions only; nothing in the suite touches the database, Next.js runtime, the MLB Stats API, or Docker.

## Summary

| ID | Requirement | Status |
| --- | --- | --- |
| DC-001 | Writer-token access control for mutating operations | partial |
| DC-002 | Live MLB roster and player synchronization | partial |
| DC-003 | 20-80 scouting evaluations and observation reports | partial |
| DC-004 | Head-to-head player comparison with radar overlay | manual |
| DC-005 | Radar chart visualization and printable scouting dossier | manual |
| DC-006 | Scouting board with organization/position filtering | manual |
| DC-007 | Dockerized PostgreSQL deployment with health check | manual |
| CAP-001 | MLB Stats API client | not verified |
| CAP-002 | OFP composite calculation | implemented |
| CAP-003 | Health endpoint | manual |
| CAP-004 | Writer sign-in / sign-out | partial |
| NFR-001 | Grades bounded to the 20-80 scale | partial |
| NFR-002 | Error handling: 404 for missing pages and records, error boundary | manual |
| NFR-003 | Observability via `/api/health` | partial |

## Functional requirements

### DC-001 Writer-token access control for mutating operations

**Statement:** Every server action that writes to the database requires a valid writer cookie; otherwise the user is redirected to `/access`.

**Implementation:**
- `src/lib/access.ts`: `requireWriter()` reads `SCOUTDECK_ACCESS_SECRET` and the `scoutdeck_writer` cookie (`WRITER_COOKIE`), and calls `redirect("/access")` if the secret is unset or the token does not match.
- `src/lib/writer-token.ts`: `writerToken()` (HMAC-SHA256 of a fixed label keyed by the secret), `writerTokenMatches()` (constant-time compare with `timingSafeEqual`).
- `src/app/actions.ts`: `requireWriter()` is the first call in all five mutating actions: `createProspectAction`, `createReportAction`, `importMlbPlayerAction`, `syncMlbTeamRosterAction`, `clearImportedMlbPlayersAction`.

**Verification:**
- `tests/writer-token.test.ts` ("writer token matches only the token derived from the configured secret") covers `writerToken` / `writerTokenMatches`.
- Not tested: `requireWriter()` itself (needs the Next.js `cookies()` / `redirect()` runtime), and that each action calls it. Checked by reading `src/app/actions.ts`.

**Status:** partial. Token logic is tested; the guard wiring is review-only.

**Notes:** Read-only pages (`/`, `/mlb`, `/compare`, `/prospects/[id]`, `/reports/new`) are not gated; only the actions are.

### DC-002 Live MLB roster and player synchronization

**Statement:** Writers can import one MLB player or a whole 40-man roster from the MLB Stats API, and a script refreshes stats for every imported player.

**Implementation:**
- `src/lib/mlb.ts` (CAP-001): `getMlbTeams`, `getMlbRoster`, `getMlbPlayer`, `searchMlbPlayers`.
- `src/app/actions.ts`: `syncMlbPlayerRecord()` upserts `Prospect` by `mlbId` and upserts `MlbStatLine` per season/group; falls back to the previous season when the current season has no splits. Exposed through `importMlbPlayerAction` and `syncMlbTeamRosterAction` (roster synced in batches of 5).
- `src/lib/performance.ts`: `calculatePerformanceGrade()` sets `ofpScore` for imported players from season stats.
- `src/app/mlb/page.tsx`: `/mlb` page with team picker, roster list, player search, and import/refresh forms.
- `scripts/refresh-mlb.ts` (`npm run mlb:refresh`): refreshes position, `ofpScore`, and stat lines for every prospect with an `mlbId`.
- `src/app/actions.ts`: `clearImportedMlbPlayersAction` deletes all prospects with an `mlbId` (`ClearImportedPlayersButton`).

**Verification:**
- `tests/performance.test.ts` covers `calculatePerformanceGrade` (league-average baseline, missing-stats fallback of 40, clamping to 20-80).
- Not tested: the MLB API client, the upsert logic, the `/mlb` page, and `scripts/refresh-mlb.ts`. These need network access and a database. Manual check: run `npm run mlb:refresh` against a seeded database, or import a player from `/mlb`.

**Status:** partial.

### DC-003 20-80 scouting evaluations and observation reports

**Statement:** Players carry Present/Future tool grades on the 20-80 scale with an OFP composite, and writers can file dated observation reports (scout, event, summary, strengths, weaknesses, optional video link and 20-80 grade).

**Implementation:**
- `prisma/schema.prisma`: `Prospect` tool grade columns (`hitPresent` ... `commandFuture`, `ofpScore`) and `ScoutingReport` (`grade Int?`).
- `src/app/actions.ts`: `ReportSchema` + `createReportAction` (report creation, `grade` validated `min(20).max(80)`); `ProspectSchema` + `createProspectAction` (OFP via CAP-002).
- `src/components/NewReportClient.tsx`: report form at `/reports/new` (`src/app/reports/new/page.tsx`).
- `src/lib/scouting.ts`: `getGradeLabel()` maps a grade to a 20-80 label.
- `src/app/prospects/[id]/page.tsx`: shows tool grades and the report log.

**Verification:**
- `tests/writer-token.test.ts` ("hitter and pitcher OFP composites round to the 20-80 scale") covers the OFP calculation.
- Not tested: Zod schemas, report persistence, `getGradeLabel`. Manual check: file a report from `/reports/new` and confirm it appears on the player dossier.

**Status:** partial.

**Notes:** `/prospects/new` now only redirects to `/mlb` (`src/app/prospects/new/page.tsx`), so `createProspectAction` has no UI caller in the current app. Tool grades in `ProspectSchema` are not bounded (see NFR-001).

### DC-004 Head-to-head player comparison with radar overlay

**Statement:** `/compare` lets the user pick two imported MLB players and shows an overlaid radar chart plus a per-attribute delta table.

**Implementation:**
- `src/app/compare/page.tsx`: `ComparePage` loads prospects with an `mlbId`; accepts `?a=` and `?b=` to preselect players.
- `src/components/CompareClient.tsx`: player selection state, `RadarChart` with `compareMetrics`, delta rows (`row.valA - row.valB`).

**Verification:** No automated test. Manual check: open `/compare?a=<id>&b=<id>` with two imported players and confirm both polygons and the delta table render.

**Status:** manual.

### DC-005 Radar chart visualization and printable scouting dossier

**Statement:** Player dossiers show a 20-80 radar chart of Present vs. Future tools and can be printed as a clean single card.

**Implementation:**
- `src/components/RadarChart.tsx`: SVG radar; `getCoordinates()` clamps values to 20-80; optional comparison polygon.
- `src/app/prospects/[id]/page.tsx`: dossier page rendering `RadarChart` and `PrintButton`.
- `src/components/PrintButton.tsx`: calls `window.print()`.
- `src/app/globals.css`: `@media print` rules for `.no-print`, `.print-only`, `.print-card`.

**Verification:** No automated test. Manual check: open `/prospects/<id>`, confirm the radar renders, then use Print and confirm the action bar is hidden in the print preview.

**Status:** manual.

### DC-006 Scouting board with organization/position filtering

**Statement:** The home page lists imported MLB players sorted by `ofpScore`, with free-text search, organization filter, position-group filter, and card/table views.

**Implementation:**
- `src/app/page.tsx`: `HomePage` queries prospects with an `mlbId`, ordered by `ofpScore` desc, including the latest stat lines and report counts.
- `src/components/DraftBoardClient.tsx`: client-side filtering (`search`, `team`, `position` state over ALL / PITCHERS / INFIELD / OUTFIELD / CATCHERS), card and table views, summary counters.

**Verification:** No automated test (the filter is inline in a React component, not an exported function). Manual check: on `/`, pick an organization and each position group and confirm the list narrows.

**Status:** manual.

**Notes:** Prospects without an `mlbId` (seeded or manually created) do not appear on the board.

### DC-007 Dockerized PostgreSQL deployment with health check

**Statement:** `docker compose up --build` starts PostgreSQL and the app; the app waits for a healthy database, applies the Prisma schema, and serves `/api/health`.

**Implementation:**
- `Dockerfile`: `node:22-bookworm-slim`, `npm ci`, `prisma generate`, `npm run build`, runs `docker/entrypoint.sh`.
- `docker/entrypoint.sh`: `npx prisma db push` then `exec npm start`.
- `docker-compose.yml`: `db` (`postgres:16-alpine`, `pg_isready` healthcheck) and `app` (`depends_on: db: condition: service_healthy`); credentials pass through from the environment.
- `src/app/api/health/route.ts`: see CAP-003.

**Verification:** No automated test. `npm run build` covers the build step the Dockerfile runs, not the container. Manual check: `docker compose up --build`, then `curl http://localhost:3000/api/health`.

**Status:** manual.

**Notes:** The compose healthcheck covers the database only; the `app` service has no healthcheck that calls `/api/health`.

## Detected capabilities

### CAP-001 MLB Stats API client

**Statement:** A typed client for `https://statsapi.mlb.com/api/v1` that validates every response with Zod.

**Implementation:** `src/lib/mlb.ts`: `mlbFetch()` (throws `MLB data request failed (<status>)` on non-2xx; uses Next.js `revalidate` caching), `getMlbTeams`, `getMlbRoster` (40-man), `getMlbPlayer` (season stats hydrate), `searchMlbPlayers` (returns `[]` for queries under 2 characters, caps at 20 results).

**Verification:** No automated test. The client calls the live API through `fetch`, and no fixtures exist.

**Status:** not verified.

### CAP-002 OFP composite calculation

**Statement:** OFP is a weighted composite of future tool grades rounded to the nearest 5. Hitter weights: hit 30%, power 30%, field 15%, run 15%, arm 10%. Pitcher weights: fastball 35%, primary breaking 25%, command 25%, secondary offspeed 15%.

**Implementation:** `src/lib/scouting.ts`: `calculateHitterOFP`, `calculatePitcherOFP`; used by `createProspectAction` in `src/app/actions.ts`.

**Verification:** `tests/writer-token.test.ts` ("hitter and pitcher OFP composites round to the 20-80 scale").

**Status:** implemented.

**Notes:** The OFP functions do not clamp to 20-80; they rely on the inputs already being in range.

### CAP-003 Health endpoint

**Statement:** `GET /api/health` returns `{"ok":true,"service":"scoutdeck"}`.

**Implementation:** `src/app/api/health/route.ts`: `GET` with `dynamic = "force-dynamic"`.

**Verification:** No automated test. `npm run build` lists the route as dynamic. Manual check: `curl http://localhost:3000/api/health`.

**Status:** manual.

**Notes:** This is a liveness check only; it does not query the database.

### CAP-004 Writer sign-in / sign-out

**Statement:** A writer enters the shared secret at `/access` to receive an `httpOnly`, `sameSite=lax` writer cookie (`secure` in production); signing out deletes it.

**Implementation:**
- `src/app/access/page.tsx`: sign-in form bound to `signInAction`.
- `src/app/access/actions.ts`: `signInAction` (constant-time `secretMatches`, sets cookie to `writerToken(secret)`, redirects to `/access?error=1` on failure), `signOutAction` (deletes cookie).

**Verification:**
- `tests/writer-token.test.ts` ("submitted secret must match the configured secret exactly") covers `secretMatches`.
- Not tested: cookie attributes and redirects.

**Status:** partial.

**Notes:** `signOutAction` is not referenced by any page or component, so sign-out is not reachable from the UI.

## Non-functional requirements

### NFR-001 Grades bounded to the 20-80 scale

**Statement:** Scouting grades stay within 20-80.

**Implementation:**
- `src/lib/limits.ts`: `GRADE_MIN = 20`, `GRADE_MAX = 80` (named constants; not imported by the schemas).
- `src/app/actions.ts`: `ReportSchema.grade` is `z.coerce.number().min(20).max(80)`.
- `src/lib/performance.ts`: `clampGrade()` clamps MLB-derived grades to 20-80.
- `src/components/RadarChart.tsx`: clamps plotted values to 20-80 (display only).

**Verification:** `tests/performance.test.ts` ("extreme stat lines are clamped to the 20-80 scale"). Not tested: `ReportSchema`.

**Status:** partial.

**Notes:** `ProspectSchema` tool grades (`hitPresent` ... `commandFuture`) have no min/max, and the database columns are plain `Int`. The report form input uses `min="30"`, which is stricter than the server-side bound of 20.

### NFR-002 Error handling: 404 for missing pages and records, error boundary

**Statement:** Unknown routes and unknown player IDs return the app's 404 page; unexpected render errors show a retryable error page.

**Implementation:**
- `src/app/not-found.tsx`: "Page not found" with a link back to the board.
- `src/app/prospects/[id]/page.tsx`: calls `notFound()` when `prisma.prospect.findUnique` returns null.
- `src/app/error.tsx`: client error boundary with `reset()`; calls `unstable_rethrow(error)` so Next.js redirect/notFound signals pass through.
- `src/app/actions.ts`: invalid form data throws `Validation failed: ...`.

**Verification:** No automated test. Manual check: request `/does-not-exist` and `/prospects/unknown-id` and confirm a 404 status with the "Page not found" page.

**Status:** manual.

### NFR-003 Observability via `/api/health`

**Statement:** Operators can probe service liveness over HTTP.

**Implementation:** `src/app/api/health/route.ts` (CAP-003). `scripts/refresh-mlb.ts` logs progress (`Refreshed N of M`).

**Verification:** Manual (see CAP-003).

**Status:** partial. Liveness exists, but there is no database readiness check, no structured logging, and no metrics.
