# Job Tracker 🎯

[![Playwright Tests](https://github.com/AndresM412/Job-Tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/AndresM412/Job-Tracker/actions/workflows/ci.yml)
![Playwright Tests](https://img.shields.io/badge/playwright-162%20tests%20passing-green?logo=playwright&logoColor=white)
![Pytest Backend](https://img.shields.io/badge/pytest-30%20tests%20passing-green?logo=pytest&logoColor=white)
![React](https://img.shields.io/badge/react-19-61dafb?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/typescript-6-blue?logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/fastapi-0.115-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-18-336791?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-v4-38bdf8?logo=tailwindcss&logoColor=white)

A full-stack, production-grade web application designed to help tech professionals track, organize, and analyze their job applications. Built with **FastAPI**, **React 19**, **PostgreSQL 18**, **Leaflet**, and automated end-to-end with **Playwright (POM)** and **Pytest**.

---

## 📌 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Testing Architecture & QA Strategy](#-testing-architecture--qa-strategy)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Running Tests](#-running-tests)
- [CI/CD Pipeline](#-cicd-pipeline)
- [License](#-license)

---

## 📖 Overview

Spreadsheets are unstructured, difficult to query, and offer zero actionable insights during a high-stakes job search. **Job Tracker** solves this problem by delivering a modern **"Command Center"** workspace where candidates can:
1. Centralize job postings with full-screen Master-Detail inspection (`JobDetailView` & `JobFormView`), compensation ranges, priority stars, work modes, and interactive office geolocation.
2. Track stage progression chronologically with an automated **Timeline & Milestones** audit trail (`Applied`, `Interview`, `Offer`, `Rejected`).
3. Maintain structured, searchable **Modular Notes** and formatted **Job Descriptions** with unified in-situ read/edit modals.
4. Filter, sort, and inspect opportunities across responsive **Cards** (infinite scroll) and **Table** (paginated) views backed by multi-tenant JWT security.

---

## ✨ Key Features

- **🌐 Modular Landing Page & Interactive Sandbox:** Three-tab public showcase (`Overview`, `Live Sandbox` with interactive telemetry, and 4-step `How It Works`) synced with the HTML5 History API (`pushState` / `popstate`) for `/login`, `/register`, and native browser Back/Forward navigation.
- **🔒 Multi-Tenant JWT Authentication & Cascade Self-Deletion:** Strict per-user isolation with non-nullable `user_id` foreign keys, tabbed `AuthView` (`tab-login` / `tab-register`) with password visibility toggles, `bcrypt` hashing (4.0.1), and a secure `DELETE /users/me` endpoint with SQLAlchemy `cascade="all, delete-orphan"` purging all related applications, notes, and timeline events.
- **🧭 Command Center Layout (`Sidebar` & `DashboardView`):** Collapsible navigation sidebar (`200ms ease-out` width transition), executive `DashboardView` telemetry overview, and skeleton loading states (`animate-pulse`) matching real card/table geometries.
- **📋 Dual View Mode (`Cards` vs. `Table`) & Rich Toolbar Filters:**
  - Persistent view switcher (`localStorage`) between infinite-scroll Cards (6 per batch) and structured paginated `JobTable` (6 rows per page).
  - Single-row filter toolbar featuring live text search, `StatusDropdown` with counts, visual calendar `DateRangeDropdown` (two-click range selection & presets), `PriorityDropdown`, `LocationFilterDropdown` (work mode & location), and `SortControl` defaulting to LIFO (*Recently added*).
- **🗂️ Master-Detail Application Workspace (`JobDetailView` & `JobFormView`):**
  - Full-screen create/edit view (`JobFormView`) and modularized detail workspace (`job-detail/`: `JobDetailHeader`, `JobDetailOverview`, `JobDescriptionCard`, `JobNotesSection`, `JobTimelineSection`).
  - **5-Star Priority Rating (`StarRating`):** Interactive in-situ `PATCH` updates on Cards and Table rows.
  - **Extra Application Metadata & XSS-Safe Links:** Optional job posting URL with automatic `https://` normalization and strict protocol sanitization (`http`/`https` only, blocking `javascript:`), location, and work mode badges (`Remote`, `Hybrid`, `On-site`).
  - **🗺️ Interactive Office Map (`OfficeMapModal` & `LeafletMapCanvas`):** OpenStreetMap / Nominatim address lookup, draggable SVG pin, dark/light tile toggle, persisted coordinates (`office_lat`, `office_lng`), and direct Google Maps link.
- **⏳ Stage Timeline & Milestones (`JobTimelineSection` & `TimelineEventModal`):**
  - Relational `JobTimelineEvent` model automatically logging the initial milestone on creation and new milestones whenever `status` transitions via `PATCH`.
  - Chronological vertical timeline (available in both `Overview` and the dedicated `Timeline` tab) with stage-colored nodes, `Current Stage` badge, 10-milestone cap per application (`Max 10`), 2-line note preview with conditional `Read more`, unified `Details` / `Editing` modal, and a 500-character limit.
- **📝 Modular Notes & Job Descriptions (`JobNotesSection`, `NoteModal`, `JobDescriptionModal`):**
  - Independent titled notes (50-char title limit, 4000-char content limit) with real-time title search, fixed-height 2-column grid (4 per page) to prevent CLS scroll jumps, clickable URL auto-detection, and unified in-situ read/edit modals.
  - Shared atomic `CharacterCounter` (`src/components/ui/`) and unified `calendar_today` date formatting (`src/utils/dateUtils.ts`) across Notes and Timeline.
- **💰 Unified Multi-Currency Salary Input (`SalaryRangeInput`):** Interactive popover supporting `USD`, `EUR`, and `COP` compensation ranges with numeric validation up to `999,999,999`.
- **♿ Accessibility & 60 FPS Modal Performance:** WAI-ARIA compliant dialogs (`role="dialog"`, `aria-modal="true"`, `Escape` handling), GPU-accelerated modal scroll containers (`overscroll-contain transform-gpu`), and `@media (prefers-reduced-motion: reduce)` support.

---

## 🧪 Testing Architecture & QA Strategy

The testing strategy follows the **Testing Pyramid** to ensure maximum reliability, cross-browser confidence, and rapid CI feedback.

```
       / \
      / E2E \         162 Playwright Executions (54 Specs × 3 Browsers)
     /-------\        Chromium, Firefox, WebKit · Page Object Model (POM)
    /   API   \       Contract, Cascade Delete & Multi-Tenancy Isolation
   /-----------\
  /    UNIT     \     30 Pytest Tests (FastAPI + SQLite In-Memory)
 /---------------\    Auth, XSS URL sanitization, Notes, Timeline & Limits
```

### 1. Base Layer: Backend Integration & Unit Tests (Pytest)
- **Engine:** Pytest running against an isolated in-memory SQLite database (`conftest.py`).
- **Coverage (30/30 tests green):**
  - `test_auth.py` (6 tests): Registration, duplicate email guard, JWT issuance, invalid credentials, and `DELETE /users/me` cascade purge.
  - `test_jobs.py` (9 tests): CRUD, partial `PATCH` preservation, priority range validation, XSS URL rejection/normalization, and strict multi-tenancy isolation.
  - `test_notes.py` (6 tests): Modular notes CRUD, LIFO ordering, cascade delete, multi-tenancy isolation, and 50-char title validation.
  - `test_timeline.py` (9 tests): Initial milestone auto-creation, status-change milestone tracking, chronological ordering, manual CRUD, 500-char note cap, legacy >500-char serialization resilience, 10-milestone limit, and multi-tenancy isolation.

### 2. Top Layer: End-to-End Tests (Playwright)
- **Cross-Browser:** 54 test specs executed across **Chromium**, **Firefox**, and **WebKit (Safari)** (**162 total executions**), configured with `reducedMotion: "reduce"` for deterministic modal testing.
- **Domain-Organized Suites & Page Object Model (`tests/pages/`):**
  - **`tests/auth/`**: Auth flows, tabbed login/register, 401 expiration handling, and instant HTTP `afterEach` test-user teardown (`deleteUserByCredentials`).
  - **`tests/landing/`**: 3-tab Landing Page, interactive sandbox, and native browser Back/Forward history assertions.
  - **`tests/applications/`**: Core CRUD, Master-Detail (`JobFormView`/`JobDetailView`), Cards vs. Table pagination, Toolbar filters, Modular Notes (`modular-notes.spec.ts`), Extra Fields & Leaflet Map with mocked Nominatim (`job-extra-fields.spec.ts`), and Stage Timeline (`timeline.spec.ts`).

---

## 🛠️ Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript 6 | Feature-based reactive user interface |
| **Styling** | Tailwind CSS v4 | Material 3 Dark Slate ("Command Center") design system |
| **Maps** | Leaflet 1.9 + OpenStreetMap | Interactive office geolocation & coordinate pinning |
| **Build Tool** | Vite 8 | Lightning-fast HMR and production bundling |
| **Backend** | FastAPI (Python 3.12+) | High-performance REST API with Pydantic validation |
| **ORM / DB** | SQLAlchemy + PostgreSQL 18 | Relational persistence with cascade deletes & idempotent migrations |
| **Authentication** | OAuth2 + JWT (`python-jose`) | Stateless token auth & `bcrypt` (4.0.1) password hashing |
| **Containerization** | Docker + Docker Compose | Reproducible PostgreSQL 18 container with persistent volume |
| **E2E Testing** | Playwright (TypeScript) | Cross-browser automated journeys with POM & route mocking |
| **API Testing** | Pytest | Fast unit, schema validation, and multi-tenant isolation tests |
| **CI / CD** | GitHub Actions | Automated Pytest + multi-browser Playwright pipeline on every push/PR |

---

## 📂 Project Structure

```bash
Job-Tracker/
├── .github/
│   └── workflows/
│       └── ci.yml                       # GitHub Actions CI (PostgreSQL 18 + Pytest + Playwright)
├── backend/
│   ├── app/
│   │   ├── main.py                      # FastAPI endpoints, CORS & idempotent startup migrations
│   │   ├── database.py                  # SQLAlchemy engine & session dependency
│   │   ├── models.py                    # User, JobApplication, JobNote & JobTimelineEvent models
│   │   ├── schemas.py                   # Pydantic validation (XSS URLs, input limits, responses)
│   │   ├── crud.py                      # Data access, auto-timeline tracking & 10-milestone cap
│   │   └── auth.py                      # bcrypt hashing & JWT verification
│   ├── scripts/
│   │   └── clean_test_users.py          # Utility CLI (`npm run test:clean`) to purge test users
│   ├── tests/                           # 30 Pytest tests (auth, jobs, notes, timeline)
│   └── requirements.txt                 # Pinned Python dependencies
├── src/
│   ├── components/
│   │   ├── auth/                        # AuthView (tabbed Login/Register)
│   │   ├── landing/                     # LandingView (Overview, Live Sandbox, How It Works)
│   │   ├── dashboard/                   # Sidebar, DashboardView, StatsBanner
│   │   ├── applications/                # JobList, JobItem, JobTable, JobDetailView, JobFormView,
│   │   │   │                            # NoteModal, JobDescriptionModal, TimelineEventModal,
│   │   │   │                            # OfficeMapModal, LeafletMapCanvas, ConfirmDeleteNoteModal
│   │   │   ├── job-detail/              # JobDetailHeader, JobDetailOverview, JobDescriptionCard,
│   │   │   │                            # JobNotesSection, JobTimelineSection
│   │   │   └── filters/                 # FilterBar, SearchBar, SortControl, StatusDropdown,
│   │   │                                # DateRangeDropdown, PriorityDropdown, LocationFilterDropdown
│   │   ├── placeholders/                # CalendarPlaceholderView, TargetHubPlaceholderView
│   │   └── ui/                          # CharacterCounter, ConfirmDeleteModal, SalaryRangeInput,
│   │                                    # StarRating, StatusBadge, WorkModeBadge, Card
│   ├── services/                        # API clients (authApi.ts, jobsApi.ts)
│   ├── utils/                           # dateUtils.ts, salary.ts, urlUtils.ts
│   └── types/                           # TypeScript domain types (job.ts)
├── tests/
│   ├── pages/                           # POM classes (LandingPage, AuthPage, DashboardPage)
│   ├── auth/                            # Auth & self-deletion cleanup E2E specs
│   ├── landing/                         # Landing page & history navigation E2E specs
│   ├── applications/                    # CRUD, Master-Detail, Notes, Extra Fields, Map & Timeline specs
│   └── helpers.ts                       # Shared API auth setup & teardown helpers
├── docker-compose.yml                   # PostgreSQL 18 container with persistent volume
├── package.json                         # Frontend & test scripts (`test:e2e`, `test:e2e:all`, `test:clean`)
└── playwright.config.ts                 # Multi-browser config (Chromium, Firefox, WebKit)
```

---

## 🚀 Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/)
- [Node.js (v18+)](https://nodejs.org/)
- [Python (3.12+)](https://www.python.org/)

### 1. Clone the repository
```bash
git clone https://github.com/AndresM412/Job-Tracker.git
cd Job-Tracker
```

### 2. Start PostgreSQL via Docker
```bash
docker compose up -d
```

### 3. Setup and run the Backend
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```
The FastAPI backend will start on `http://127.0.0.1:8000`. Interactive API docs are available at `http://127.0.0.1:8000/docs`.

### 4. Setup and run the Frontend
In a new terminal (from the project root):
```bash
npm install
npm run dev
```
Open `http://localhost:5173` to explore Job Tracker.

---

## 🧪 Running Tests

### Backend Unit & Integration Tests (Pytest)
```bash
pytest backend
```

### End-to-End Tests (Playwright)
Run fast local feedback on Chromium (54 tests):
```bash
npm run test:e2e
```

Run the full cross-browser suite across Chromium, Firefox, and WebKit (162 executions):
```bash
npm run test:e2e:all
```

Run a specific domain suite or open Playwright Interactive UI:
```bash
npx playwright test tests/applications/timeline.spec.ts --project=chromium
npm run test:e2e:ui
```

View the HTML report:
```bash
npx playwright show-report
```

Purge leftover E2E test users from local PostgreSQL (if needed):
```bash
npm run test:clean
```

---

## 🔄 CI/CD Pipeline

Every push and pull request to `main` triggers the GitHub Actions workflow (`.github/workflows/ci.yml`), which:
1. Spawns an ephemeral PostgreSQL 18 service container with health checks.
2. Installs Node.js and Python dependencies.
3. Installs Playwright browser binaries for Chromium, Firefox, and WebKit.
4. Executes the **Pytest** backend suite (30 tests).
5. Executes the full **Playwright E2E** suite across all 3 browser engines (162 executions).
6. Uploads the Playwright HTML test report as a build artifact.

---

## 📄 License

All Rights Reserved © 2026 Andres M.  
Unauthorized copying, modification, or distribution of this software via any medium is strictly prohibited.
