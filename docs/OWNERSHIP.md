# Accounts, network and ownership

## Owner decision

Recorded 2026-10-14 by the project owner (Capping, GitHub `chance1473`, Passo account `chance.hobin1@marist.edu`):

ScoutDeck runs on no enterprise network and in no cloud account. There is no corporate VPN, landing zone, shared tenancy or separate operations team, so the enterprise segmentation and cloud-ownership items do not apply. Revisit this file before any hosted deployment.

## Accounts

| Account | Used for | Who has administrative access |
| --- | --- | --- |
| GitHub repository `chance1473/scoutdeck-capping-project` (public) | Source, issues, GitHub Actions CI | `chance1473` only (admin). No other collaborators, webhooks, deploy keys or Actions secrets. |
| GitHub Actions | Build, test, compose and image validation | Runs with `permissions: contents: read` and no secrets |
| Passo (`staging.passo.build`, project 125) | Readiness board and security gate | Project owner `chance.hobin1@marist.edu` |
| MLB Stats API (`statsapi.mlb.com`) | Public read-only player data | No account or credential |
| Docker Hub | Pulls `postgres:16-alpine` and the Node base image anonymously | No account or credential |

No cloud provider account (AWS, Azure, GCP or similar) is attached to the project.

## Network paths

ScoutDeck runs wherever an operator starts `docker compose up`:

- **App, port 3000:** published on the host so a browser can reach it. Writes require the writer secret; see [INTERFACES.md](INTERFACES.md).
- **PostgreSQL, port 5432:** published on `127.0.0.1` only. The app container reaches it as `db` over the private compose network, and a local `npm run dev` process reaches it on `localhost`. Nothing outside the host can connect.
- **Outbound:** HTTPS to `statsapi.mlb.com`, and image pulls from Docker Hub at build time.

## Secrets

`DATABASE_URL`, `POSTGRES_PASSWORD` and `SCOUTDECK_ACCESS_SECRET` live only in the operator's uncommitted `.env`. `.env.example` lists the names with empty values, and CI uses none of them.

## Verification

- `gh api repos/chance1473/scoutdeck-capping-project/collaborators` lists only `chance1473` (admin); the hooks, deploy-key and Actions-secret endpoints each return zero entries.
- `docker compose config` shows the database port bound to `host_ip: 127.0.0.1`.
