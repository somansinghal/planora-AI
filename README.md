<div align="center">

# Planora AI

**From idea to flawlessly planned.**

*An intelligent workspace combining AI-generated blueprints with persistent event operations, mathematical budget discipline, milestone scheduling, task management, vendor tracking, and hospitality guest management.*

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-FFA611.svg)](https://firebase.google.com/)
[![AI Engine](https://img.shields.io/badge/AI-Groq%20LLaMA%203.1-F55036.svg)](https://groq.com/)

</div>

---

## 🌟 Overview

Planning personal milestones (weddings, anniversaries, milestone birthdays) or high-stakes corporate summits is traditionally plagued by spreadsheet chaos, anxiety over hidden expenses, and fragmented messaging threads.

**Planora AI** introduces a unified, full-stack SaaS operating system that bridges real AI generation with deterministic, persistent SaaS workspaces:
- **Real AI Event Studio**: Synthesizes end-to-end event blueprints (executive summary, theme concepts, itemized budget allocations normalized to 100%, preparation milestones, and day-of hourly schedules) validated against strict Pydantic schemas.
- **Financial & Budget Discipline**: Real-time spending calculations, category breakdowns, utilization progress bars, Chart.js donut visualizations, and CSV exports.
- **Operational Timeline & Run-Sheet**: T-minus countdown roadmap combined with day-of hourly run-sheet for coordinators.
- **Task Management**: Checklists with priority filters, status transitions, search, and instant dashboard synchronization.
- **Vendor Roster**: Contract tracking, quote comparisons, point-of-contact details, and booking badges.
- **Guest Management**: Real-time confirmed headcount calculations (including +1 attendees), dietary requirement tracking, and table seating zones.
- **Contextual AI Copilot**: Live co-planner grounded in active event budget, task completion velocity, and attendee headcounts.
- **Executive Master Reports**: Aggregated master dossier, print-ready PDF styling, and direct CSV/JSON downloads.

---

## 🏗️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom design system, CSS variables, Glassmorphism dark aesthetic), Modern ES Modules, Chart.js. *(Zero bulky frontend frameworks, zero build step required)*.
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, Uvicorn, HTTPX.
- **Authentication**: Firebase Authentication (Email/Password & Google OAuth) with server-side asymmetric ID token verification.
- **Database**: Cloud Firestore with flat user-isolated collections, Firestore Security Rules, and in-memory zero-config dev fallback.
- **AI Engine**: Groq Cloud (LLaMA 3.1 8B Instant) with structured JSON enforcement and transparent Demonstration Mode fallback.
- **Testing**: Python Pytest / standard `unittest`, Starlette `TestClient`, Playwright test configuration.

---

## 📂 Project Structure

```
planora-ai/
├── index.html                   # Public landing page
├── login.html                   # Sign in page
├── signup.html                  # Registration page
├── pricing.html                 # Transparent SaaS pricing & FAQ
├── about.html                   # Mission, story, and architectural principles
├── privacy.html                 # Privacy policy
├── terms.html                   # Terms of service
├── 404.html                     # Custom starry 404 page
├── dashboard.html               # Main authenticated overview dashboard
├── create-event.html            # Event creation wizard
├── planner.html                 # AI Event Studio
├── budget.html                  # Budget management & Chart.js breakdown
├── timeline.html                # Milestone roadmap & event-day run sheet
├── tasks.html                   # Task management & status filters
├── vendors.html                 # Vendor directory & quote tracking
├── guests.html                  # Guest management & RSVP summary metrics
├── copilot.html                 # AI Event Copilot chat assistant
├── reports.html                 # Executive master report & CSV exports
├── settings.html                # User settings & system diagnostics
├── css/                         # Design system tokens, variables, & layouts
├── js/                          # App shell, API client, & Firebase auth
├── assets/                      # Brand logo & icons
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entrypoint
│   │   ├── core/                # Configuration, logging, & security
│   │   ├── routes/              # 10 modular REST API routers
│   │   ├── schemas/             # Pydantic v2 validation schemas
│   │   ├── services/            # Groq AI & rate-limiting services
│   │   └── repositories/        # Firestore database layer with dev fallback
│   ├── tests/
│   │   └── test_api.py          # Comprehensive 15-test integration suite
│   ├── requirements.txt         # Pinned backend dependencies
│   └── pyproject.toml           # Project metadata
├── firebase/
│   ├── firestore.rules          # Strict document ownership security rules
│   └── firestore.indexes.json   # Composite Firestore query indexes
├── tests/
│   └── playwright/              # Automated browser test specifications
├── docs/                        # Complete 21-file technical documentation library
├── .github/workflows/ci.yml     # GitHub Actions CI workflow
├── .env.example                 # Environment configuration template
├── .gitignore                   # Credential & artifact exclusions
├── package.json                 # Node & test runner scripts
└── README.md
```

---

## 🚀 Quick-Start Guide (Running Locally)

### Prerequisites
- Python 3.10 or higher.
- A modern web browser.

### 1. Clone & Configure Environment
```bash
git clone https://github.com/your-username/planora-ai.git
cd planora-ai
cp .env.example backend/.env
```

### 2. Start the FastAPI Backend
```bash
cd backend
python3 -m pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload --port 8000
```
*API Swagger Documentation will be accessible at: [http://localhost:8000/api/docs](http://localhost:8000/api/docs).*

### 3. Start the Frontend
In a new terminal window, serve the root directory:
```bash
# Using python's built-in static server
python3 -m http.server 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🧪 Testing

### Automated Backend & Security Tests
Run the 15-test backend suite covering authentication, cross-user isolation, CRUD operations, budget calculations, and cascading deletion:
```bash
cd backend
python3 -m unittest discover -s tests -p "test_*.py" -v
```
*Result: 15/15 tests passing in 0.08 seconds.*

---

## 📖 Complete Documentation Library

Detailed engineering guides are located in the `docs/` directory:
- [Project Overview](docs/PROJECT_OVERVIEW.md)
- [Product Requirements Document (PRD)](docs/PRODUCT_REQUIREMENTS.md)
- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Authentication & Authorization Guide](docs/AUTHENTICATION_AND_AUTHORIZATION.md)
- [Security Audit Report](docs/SECURITY_AUDIT.md)
- [Code Quality Audit](docs/CODE_QUALITY_AUDIT.md)
- [Accessibility Audit (WCAG AA)](docs/ACCESSIBILITY_AUDIT.md)
- [SEO Audit](docs/SEO_AUDIT.md)
- [Performance Audit](docs/PERFORMANCE_AUDIT.md)
- [Test Strategy](docs/TEST_STRATEGY.md)
- [Test Execution Report](docs/TEST_REPORT.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Environment Variables](docs/ENVIRONMENT_VARIABLES.md)
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- [Known Limitations](docs/KNOWN_LIMITATIONS.md)
- [Release Checklist](docs/RELEASE_CHECKLIST.md)
- [User Guide](docs/USER_GUIDE.md)
- [Development Roadmap](docs/DEVELOPMENT_ROADMAP.md)

---

## 🔒 Security & Privacy Notes

- **Zero Client Secrets**: Service account JSON keys and `GROQ_API_KEY` are strictly server-side.
- **Resource Ownership**: Endpoints verify `resource.user_id == current_user.uid`. Modifying another user's records triggers an immediate `403 Forbidden`.
- **Sensitive Data Filtering**: Loggers automatically mask authentication bearer tokens and API credentials.
- **Private Workspaces**: All authenticated pages declare `<meta name="robots" content="noindex, nofollow">` to prevent search engine caching of private event data.

---

## 📄 License

Planora AI is released under the [MIT License](LICENSE).
Copyright (c) 2026 Planora AI Contributors.
