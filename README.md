# ⚾ ScoutDeck: Baseball Scouting & Draft War Room

> Built for the **Cybersecurity Capping Project: Passo, by PyxCloud** (Phase 1 Test Bed).

**ScoutDeck** is a high-performance amateur baseball scouting and draft-room platform. It provides scouts, crosscheckers, and front-office analysts with an end-to-end environment to evaluate high school and college prospects, track recruitment pipelines, visualize **20–80 tool projections** via interactive radar charts, analyze **Statcast showcase metrics**, and compare draft targets head-to-head.

---

## 🌟 Key Features

* **Draft Board / War Room:** Filterable, searchable war-room board supporting position groupings (Pitchers, Infield, Outfield, Catchers), class years ('25, '26), and recruitment status (`Top Target`, `Offered`, `Watchlist`, `Committed`, `Signed`).
* **20–80 Major League Scouting Scale:** Full support for industry-standard Present vs. Future grades (Hit, Power, Run, Arm, Field for position players; Fastball, Slider, Curveball, Changeup, Command for pitchers) with automated **Overall Future Potential (OFP)** composite calculations.
* **Interactive 5-Axis Radar Chart:** Responsive, mathematically calibrated SVG polygon visualizer plotting Present and Future tool trajectories against the 50 (MLB Average) baseline.
* **Statcast Combine & Showcase Analytics:** Track verified metrics including Exit Velocity Max (mph), 60-Yard Dash times, Catcher Pop Times, Fastball Peak & Sitting Velocities, and Trackman Spin Rates.
* **Head-to-Head Compare Engine:** Select any two prospects to render an overlay radar comparison and automated attribute delta tables.
* **Field Observation Logs:** Chronological scouting reports filed by scouts at showcases (Area Code Games, PG National, Cape Cod League, CWS) with narrative summaries, strengths, weaknesses, and film breakdown links.
* **Printable Scouting Dossier:** Built-in print media layout to export clean, single-sheet scouting cards.

---

## 🛠️ Architecture & Tech Stack

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions, TypeScript)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) with custom sports-analytics slate/navy palette
* **Database & ORM:** [Prisma ORM](https://www.prisma.io/) with SQLite (`prisma/dev.db`)
* **Validation:** [Zod](https://zod.dev/) schemas for server-side payload validation
* **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed Sample Prospects
```bash
# Push schema to SQLite database
npx prisma db push

# Seed realistic draft prospects and field reports
npm run prisma:seed
```

### 3. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Passo & Cybersecurity Test-Bed Context

This repository is designed as an authentic, high-quality test bed application for evaluating **Passo by PyxCloud**:
* **Static Application Security Testing (SAST):** Evaluates how Passo scans modern Next.js 15 Server Actions, dynamic routes, file system access, and input validation schemas.
* **Software Composition Analysis (SCA):** Tests Passo's dependency auditor against npm ecosystem packages and lockfile resolutions.
* **Secret Detection:** Exercises Passo's ability to verify absence of hardcoded tokens, sensitive database credentials, and webhook endpoints.
* **Deployment Gates & Board OS:** Provides realistic production infrastructure targets (e.g. Dockerizing or cloud migration from SQLite to PostgreSQL) to evaluate deployment gates and remediation workflows.
