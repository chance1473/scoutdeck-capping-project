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
* **Database & ORM:** [Prisma ORM](https://www.prisma.io/) with SQLite (`prisma/dev.db`)
* **Validation:** [Zod](https://zod.dev/) schemas for server-side payload validation
* **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize the Database
```bash
# Push schema to SQLite database
npx prisma db push

# The seed task adds no fictional players; use /mlb to sync live rosters
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
