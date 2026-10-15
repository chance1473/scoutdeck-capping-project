# ⚾ ScoutDeck: MLB Scouting & Player Intelligence

> Built for the **Cybersecurity Capping Project: Passo, by PyxCloud** (Phase 1 Test Bed).

**ScoutDeck** is a professional baseball scouting platform built around current MLB rosters and season statistics. It combines validated data from MLB Stats API with private, scout-authored **20–80 evaluations**, observation reports, comparisons, and printable player dossiers.

---

## 🌟 Key Features

* **Live MLB Directory:** Browse current organizations and 40-man rosters, then synchronize an entire roster or an individual player into ScoutDeck.
* **Professional Scouting Board:** Filter imported MLB players by organization and position while tracking report coverage and synchronized stat lines.
* **20–80 Major League Scouting Scale:** Full support for industry-standard Present vs. Future grades (Hit, Power, Run, Arm, Field for position players; Fastball, Slider, Curveball, Changeup, Command for pitchers) with automated **Overall Future Potential (OFP)** composite calculations.
* **Interactive 5-Axis Radar Chart:** Responsive, mathematically calibrated SVG polygon visualizer plotting Present and Future tool trajectories against the 50 (MLB Average) baseline.
* **Live Season Statistics:** Store validated hitting and pitching stat snapshots independently from private scouting analysis.
* **Head-to-Head Compare Engine:** Select any two MLB players to render an overlay radar comparison and automated attribute delta tables.
* **Professional Observation Logs:** Chronological reports with narrative summaries, strengths, weaknesses, grades, and film links.
* **Printable Scouting Dossier:** Built-in print media layout to export clean, single-sheet scouting cards.

---

## 🛠️ Architecture & Tech Stack

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions, TypeScript)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) with custom sports-analytics slate/navy palette
* **Database & ORM:** [Prisma ORM](https://www.prisma.io/) with PostgreSQL
* **Validation:** [Zod](https://zod.dev/) schemas for server-side payload validation
* **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure the environment
```bash
cp .env.example .env
```
Set `POSTGRES_PASSWORD`, `DATABASE_URL`, and `SCOUTDECK_ACCESS_SECRET` before starting. The writer secret is required to create prospects, file reports, import MLB players, or clear imported players. Sign in at `/access`.

### 3. Start PostgreSQL and the app
```bash
docker compose up --build
```
The app container applies the Prisma schema to PostgreSQL on startup. For a local process instead of the app container, start only the database and then run:
```bash
npx prisma db push
npm run prisma:seed
npm run dev
```
Inside Docker Compose the app reaches PostgreSQL at host `db`, so `DATABASE_URL` takes the form `postgresql://<user>:<password>@db:5432/<db>`. For a local process, use `localhost` instead of `db`.

Open [http://localhost:3000](http://localhost:3000).

### Health and diagnosis
`GET /api/health` runs `SELECT 1` against PostgreSQL. It returns `200 {"ok":true,"database":"ok"}` when the database answers and `503 {"ok":false,"database":"unreachable"}` when it does not. On a 503, the app logs the Prisma error with a `[health]` prefix:
```bash
docker compose logs app | grep -A4 "\[health\]"
```
The app reconnects on its own once PostgreSQL is back; no app restart is needed.

---

## ✅ Continuous integration

The [`CI` workflow](.github/workflows/ci.yml) runs on every pull request and on pushes to `main`:
* **Build and test:** `npm ci`, `npm run build` (Prisma client generation plus `next build`), and `npm test`, on Node 22.
* **Validate compose and Docker image:** `docker compose config` with non-secret placeholder environment values, then `docker build .` of the app image.

The workflow uses read-only repository permissions and no repository secrets. The repository owner should protect `main` in GitHub branch protection settings and require the `Build and test` and `Validate compose and Docker image` status checks to pass before merging.

---

## 🔒 Passo & Cybersecurity Test-Bed Context

This repository is designed as an authentic, high-quality test bed application for evaluating **Passo by PyxCloud**:
* **Static Application Security Testing (SAST):** Evaluates how Passo scans modern Next.js 15 Server Actions, dynamic routes, file system access, and input validation schemas.
* **Software Composition Analysis (SCA):** Tests Passo's dependency auditor against npm ecosystem packages and lockfile resolutions.
* **Secret Detection:** Exercises Passo's ability to verify absence of hardcoded tokens, sensitive database credentials, and webhook endpoints.
* **Deployment Gates & Board OS:** Runs from the Docker Compose PostgreSQL deployment so deployment gates and remediation workflows have a production-shaped target.
