# Job Tracker 🎯

[![Playwright Tests](https://github.com/AndresM412/Job-Tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/AndresM412/Job-Tracker/actions/workflows/ci.yml)
![Playwright Tests](https://img.shields.io/badge/playwright-72%20tests%20passing-green?logo=playwright&logoColor=white)
![Pytest Backend](https://img.shields.io/badge/pytest-8%20tests%20passing-green?logo=pytest&logoColor=white)
![React](https://img.shields.io/badge/react-19-61dafb?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/typescript-5-blue?logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/fastapi-0.115-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-18-336791?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-v4-38bdf8?logo=tailwindcss&logoColor=white)

A full-stack, production-grade web application designed to help tech professionals track, organize, and analyze their job applications. Built with **FastAPI**, **React 19**, **PostgreSQL**, and automated end-to-end with **Playwright (POM)** and **Pytest**.

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

Spreadsheets are unstructured, difficult to query, and offer zero actionable insights during a high-stakes job search. **Job Tracker** solves this problem by delivering a focused, "Control Room" dashboard experience where candidates can:
1. Centralize job postings with dates, statuses, and recruiter notes.
2. Track interviews and conversions through a real-time KPI banner.
3. Automatically identify and click job offer URLs embedded in notes.
4. Prevent accidental deletions with an accessible confirmation modal.

---

## ✨ Key Features

- **🌐 Modern Landing Page & Native Browser History:** Public showcase page featuring live mockups and feature breakdowns. Full integration with the HTML5 History API (`pushState` and `popstate`) supporting `/login`, `/register`, and native browser Back/Forward (← / →) navigation.
- **🔒 Multi-Tenant JWT Authentication:** Strict user isolation. Passwords hashed using `bcrypt` (pinned to 4.0.1 for stability). Non-nullable `user_id` foreign keys ensure zero data leakage between accounts.
- **📊 Real-Time Metrics & Visual Badges:** "Control Room v2" design featuring glowing badge pills for each stage (`Applied`, `Interview`, `Offer`, `Rejected`) and dynamic KPI calculation (Response Rate, Active Interviews).
- **♿ Accessible Deletion Confirmation Modal (`ConfirmDeleteModal`):** Compliant with **WAI-ARIA** standards (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`). Dismissible via backdrop click, dedicated Cancel button, or the `Escape` key shortcut.
- **🔍 Instant Search & Chronological Sorting:** Client-side live search querying across company names, roles, and statuses, coupled with ascending/descending date sorting.
- **🔗 Smart URL Detection in Notes:** Regex-powered auto-detection transforming raw URLs into secure (`rel="noopener noreferrer"`), clickable links.

---

## 🧪 Testing Architecture & QA Strategy

The testing strategy follows the **Testing Pyramid** to ensure maximum reliability, cost-effective maintenance, and rapid feedback in CI.

```
       / \
      / E2E \         72 Playwright Tests (Chromium, Firefox, WebKit)
     /-------\        Page Object Model (POM) & User Journeys
    /   API   \       Contract & Multi-Tenancy Isolation
   /-----------\
  /    UNIT     \     8 Pytest Tests (FastAPI + SQLite In-Memory)
 /---------------\    Hashing, JWT issuance, Pydantic schemas
```

### 1. Base Layer: Backend Integration & Unit Tests (Pytest)
- **Engine:** Pytest running against an ultra-fast in-memory SQLite database.
- **Coverage (8/8 tests green):**
  - Password hashing and verification with bcrypt.
  - JWT token generation, expiration, and signature validation.
  - Multi-tenancy isolation: asserting that User B receives `404 Not Found` or empty datasets when querying or attempting to modify User A's jobs.

### 2. Top Layer: End-to-End Tests (Playwright)
- **Cross-Browser:** Automated across **Chromium**, **Firefox**, and **WebKit (Safari)**.
- **Page Object Model (POM):**
  - **`LandingPage.ts`**: Header buttons, hero CTA routing, and native browser navigation (`page.goBack()`).
  - **`AuthPage.ts`**: Form authentication, registration mode toggle, and automatic session expiration (401) handling.
  - **`DashboardPage.ts`**: Encapsulates job creation, editing, status filtering, search queries, sorting, and accessible deletion modal confirmation.
- **Coverage (72 tests total):**
  - 42 tests covering core job lifecycle, sorting, filtering, searching, and auth.
  - 15 tests dedicated to the accessible confirmation modal (Escape key, backdrop, cancel vs confirm).
  - 15 tests validating the landing page, corner auth buttons, and native browser back navigation.

---

## 🛠️ Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript | Component-based reactive user interface |
| **Styling** | Tailwind CSS v4 | Curated dark-mode design system ("Control Room v2") |
| **Build Tool** | Vite | Lightning-fast HMR and bundle compilation |
| **Backend** | FastAPI (Python 3.12) | High-performance asynchronous REST API |
| **ORM / DB** | SQLAlchemy + PostgreSQL 18 | Relational data persistence with strict foreign keys |
| **Authentication** | OAuth2 + JWT (`python-jose`) | Stateless token authentication & `bcrypt` password hashing |
| **Containerization**| Docker + Docker Compose | Local and reproducible PostgreSQL database environment |
| **E2E Testing** | Playwright (TypeScript) | Cross-browser automated user journey testing with POM |
| **API Testing** | Pytest | Fast backend unit and multi-tenant security verification |
| **CI / CD** | GitHub Actions | Automated multi-browser test execution on every push/PR |

---

## 📂 Project Structure

```bash
Job-Tracker/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI workflow (Pytest + Playwright)
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point & CORS
│   │   ├── database.py          # SQLAlchemy engine & session dependency
│   │   ├── models.py            # User & JobApplication SQLAlchemy models
│   │   ├── schemas.py           # Pydantic request/response validation schemas
│   │   └── auth.py              # Password hashing & JWT token logic
│   ├── tests/                   # Pytest test suite (multi-tenancy & auth)
│   └── requirements.txt         # Python dependencies
├── src/
│   ├── components/
│   │   ├── LandingPage.tsx      # Public landing page with native history
│   │   ├── AuthForm.tsx         # Unified login & registration component
│   │   ├── JobForm.tsx          # Job creation & editing form
│   │   ├── JobList.tsx          # Grid container & delete modal state
│   │   ├── JobItem.tsx          # Job card with glowing badges
│   │   ├── ConfirmDeleteModal.tsx # Accessible WAI-ARIA confirmation dialog
│   │   ├── StatsBanner.tsx      # Real-time hiring KPI metrics
│   │   └── filters/             # SearchBar, FilterBar, and SortControl
│   ├── services/                # Axios/Fetch API wrappers (authApi & jobsApi)
│   └── types/                   # TypeScript interfaces (JobApplication, User)
├── tests/                       # Playwright E2E Test Suite
│   ├── pages/                   # Page Object Model classes
│   │   ├── LandingPage.ts       # POM: Landing page actions & locators
│   │   ├── AuthPage.ts          # POM: Auth actions & locators
│   │   └── DashboardPage.ts     # POM: Dashboard & modal locators
│   ├── auth.spec.ts             # E2E: Login, register, logout, 401 handling
│   ├── create-job.spec.ts       # E2E: Job creation flow
│   ├── edit-job.spec.ts         # E2E: Job editing flow
│   ├── delete-job.spec.ts       # E2E: Single deletion
│   ├── delete-specific-job.spec.ts # E2E: Specific item deletion among many
│   ├── delete-confirmation-modal.spec.ts # E2E: Modal A11y & cancellation
│   ├── filter-by-status.spec.ts # E2E: Status filtering
│   ├── search.spec.ts           # E2E: Text-based search queries
│   ├── sort.spec.ts             # E2E: Chronological date sorting
│   └── landing-page.spec.ts     # E2E: Landing navigation & page.goBack()
├── docker-compose.yml           # PostgreSQL 18 container setup
└── playwright.config.ts         # Playwright multi-project configuration
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
The FastAPI backend will start on `http://127.0.0.1:8000`. API documentation is available at `http://127.0.0.1:8000/docs`.

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
Run the full 72-test cross-browser suite:
```bash
npx playwright test
```

Run tests with Playwright's Interactive UI mode:
```bash
npx playwright test --ui
```

Generate and view the HTML report:
```bash
npx playwright show-report
```

---

## 🔄 CI/CD Pipeline

Every push and pull request to `main` triggers our GitHub Actions pipeline (`.github/workflows/ci.yml`), which executes:
1. Spawns an ephemeral PostgreSQL 18 service container with health checks.
2. Installs frontend and Python dependencies.
3. Installs Playwright browser binaries for Chromium, Firefox, and WebKit.
4. Executes the **Pytest** backend test suite.
5. Executes the full **Playwright E2E** test suite across all 3 browser engines.
6. Uploads the Playwright HTML test report as an artifact.

---

## 📄 License

All Rights Reserved © 2026 Andres M.  
Unauthorized copying, modification, or distribution of this software via any medium is strictly prohibited.
