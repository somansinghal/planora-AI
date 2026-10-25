<div align="center">

# Planora AI

**From idea to flawlessly planned.**

*An intelligent SaaS workspace combining AI-generated blueprints with persistent event operations, mathematical budget discipline, milestone scheduling, task management, vendor tracking, and hospitality guest management.*

[![Live Website](https://img.shields.io/badge/Live%20Website-planora--ai--india.vercel.app-7C3AED.svg)](https://planora-ai-india.vercel.app/)
[![Judge Demo](https://img.shields.io/badge/Judge%20Demo-No%20Login%20Required-10B981.svg)](https://planora-ai-india.vercel.app/dashboard.html?demo=true)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-FFA611.svg)](https://firebase.google.com/)
[![AI Engine](https://img.shields.io/badge/AI-Groq%20LLaMA%203.1-F55036.svg)](https://groq.com/)

</div>

---

## 🌐 Live Application & Judge Demo

- **Live Production URL**: [https://planora-ai-india.vercel.app/](https://planora-ai-india.vercel.app/)
- **Instant Judge Demo Mode**: [https://planora-ai-india.vercel.app/dashboard.html?demo=true](https://planora-ai-india.vercel.app/dashboard.html?demo=true)
  *(No account creation, email, or credentials required)*

---

## ⚡ Hackathon Judge Demo Mode (Instant Evaluation)

Planora AI features a dedicated, zero-friction **Judge Demo Mode** designed specifically for hackathon evaluators:

- **Zero Sign-In Friction**: Open the demo in one click without creating an account or providing personal details.
- **Pre-Seeded Showcase Event**: Loaded with **"Planora Showcase Wedding"** at The Oberoi Udaivilas, Udaipur (₹1,200,000 budget, 6 categorized expenses totaling ₹785,000, 6 prioritized tasks, 4 vendor contracts, 6 sample guests with dietary requirements, minute-by-minute timeline run-sheet, and full AI Master Plan).
- **Client-Side Isolated Sandbox**: Operates entirely within `localStorage`. Judges can add expenses, toggle tasks, check RSVPs, and test the offline AI Copilot with complete interactivity without reading, querying, or writing to production Firebase databases.
- **Safety & Reset**: Persistent purple **JUDGE DEMO MODE** top banner with a one-click **"Reset Demo Data"** button to restore the pristine showcase state at any time, plus an **"Exit Demo"** link to return to the public website.
- **Zero Shared Account Vulnerabilities**: Each evaluator runs in their own isolated browser storage silo. No judge can overwrite or see another judge's demo actions.

---

## 🌟 Product Overview & Capabilities

Planning personal celebrations (weddings, anniversaries, milestone birthdays) or corporate summits is traditionally plagued by spreadsheet chaos, hidden expenses, and fragmented messaging threads.

**Planora AI** introduces a unified, full-stack SaaS operating system that bridges real AI generation with deterministic, persistent SaaS workspaces:
- **Real AI Event Studio**: Synthesizes end-to-end event blueprints (executive summary, theme concepts, itemized budget allocations normalized to 100%, preparation milestones, and day-of hourly schedules) validated against strict Pydantic schemas.
- **Financial & Budget Discipline**: Real-time spending calculations, category breakdowns, utilization progress bars, Chart.js donut visualizations, and CSV exports.
- **Operational Timeline & Run-Sheet**: T-minus countdown roadmap combined with day-of hourly run-sheet for coordinators.
- **Task Management**: Checklists with priority filters, status transitions, search, and instant dashboard synchronization.
- **Vendor Roster**: Contract tracking, quote comparisons, point-of-contact details, and booking badges.
- **Guest Management**: Real-time confirmed headcount calculations (including +1 attendees), dietary requirement tracking, and table seating zones.
- **Contextual AI Copilot**: Live co-planner grounded in active event budget, task completion velocity, and attendee headcounts (with offline fallback for demo evaluation).
- **Executive Master Reports**: Aggregated master dossier, print-ready PDF styling, and direct CSV/JSON downloads.

---

## 🏗️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom design system tokens, CSS variables, Glassmorphism dark aesthetic), Modern ES Modules, Chart.js. *(Zero bulky frontend frameworks, zero build step required)*.
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, Uvicorn, HTTPX.
- **Authentication**: Firebase Authentication (Email/Password & Google OAuth) with server-side asymmetric ID token verification.
- **Database**: Cloud Firestore with flat user-isolated collections, Firestore Security Rules, and in-memory zero-config dev fallback.
- **AI Engine**: Groq Cloud (LLaMA 3.1 8B Instant) with structured JSON enforcement and transparent Demonstration Mode fallback.
- **Testing**: Python Pytest / standard `unittest`, Starlette `TestClient`, Playwright test configuration.

---

## 🔍 Technical SEO & Social Sharing Foundation

Planora AI implements a rigorous Technical SEO architecture:
- **Canonical URLs**: Every public page features an absolute HTTPS canonical URL pointing to `https://planora-ai-india.vercel.app/`.
- **Open Graph & Twitter Cards**: Complete metadata with high-resolution 1200×630 social preview image (`assets/images/planora-ai-social-preview.png`).
- **Structured Data (JSON-LD)**: Connected `WebSite` and `SoftwareApplication` Schema.org graphs on the homepage with verified creator attribution.
- **Favicon Suite**: Multi-format vector `favicon.svg`, fallback `favicon.ico`, 32×32 PNG, 16×16 PNG, and 180×180 Apple Touch Icon.
- **Strict Privacy Controls**: Production `robots.txt` and `sitemap.xml` strictly index only public pages (`/`, `about.html`, `pricing.html`, `privacy.html`, `terms.html`). All private workspace routes enforce `<meta name="robots" content="noindex, nofollow">`.
- **Web Share API**: Native device share sheet integration with polite clipboard fallback on public pages.

---

## 👤 Creator Attribution & Social Profiles

Planora AI was founded and engineered by **Soman Singhal**. The verified personal and professional profiles are integrated into the public website footer:

- **GitHub**: [https://github.com/somansinghal](https://github.com/somansinghal)
- **Portfolio**: [https://somansinghal.vercel.app/](https://somansinghal.vercel.app/)
- **Instagram**: [https://www.instagram.com/_somansinghal/](https://www.instagram.com/_somansinghal/)
- **LinkedIn**: [https://www.linkedin.com/in/soman-singhal/](https://www.linkedin.com/in/soman-singhal/)
- **X (Twitter)**: [https://x.com/SomanSinghal](https://x.com/SomanSinghal)

*Note: In accordance with project standards, the owner's profiles represent personal/professional attribution and are not corporate brand accounts.*

---

## 📂 Project Structure

```
planora-ai/
├── index.html                   # Public landing page (SEO, JSON-LD, Demo CTAs)
├── login.html                   # Sign in page with Judge Demo entry
├── signup.html                  # Registration page with Judge Demo entry
├── pricing.html                 # Transparent SaaS pricing & FAQ
├── about.html                   # Mission, story, architecture & creator attribution
├── privacy.html                 # Privacy policy
├── terms.html                   # Terms of service
├── 404.html                     # Starry 404 error page with demo link
├── dashboard.html               # Main authenticated overview & Judge Demo sandbox
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
├── favicon.svg                  # Vector brand favicon
├── favicon.ico                  # Multi-size ICO brand favicon
├── robots.txt                   # Production crawler directives
├── sitemap.xml                  # Canonical XML sitemap (public pages only)
├── css/                         # Design system tokens, variables, & layouts
├── js/
│   ├── config/
│   │   └── social-links.js      # Centralized social profiles & Web Share API
│   ├── demo-mode.js             # Client-side isolated Judge Demo Sandbox engine
│   ├── auth-guard.js            # Authentication gatekeeper with demo bypass
│   ├── app-shell.js             # Sidebar, topbar, and Demo Mode badges
│   └── api.js                   # API client with transparent demo data interception
├── assets/
│   ├── images/
│   │   ├── planora-ai-social-preview.png  # 1200x630 OG social preview card
│   │   ├── apple-touch-icon.png           # 180x180 iOS home screen icon
│   │   ├── favicon-32x32.png              # Standard desktop PNG favicon
│   │   └── favicon-16x16.png              # Compact browser tab favicon
│   └── logo/
│       └── planora-logo.png               # Official Planora AI brand logo
├── backend/
│   ├── app/                     # FastAPI backend application
│   └── tests/
│       └── test_api.py          # 15 backend integration tests
├── tests/
│   ├── test_seo_and_demo.py     # 14 automated SEO, Social, & Demo tests
│   └── playwright/              # Playwright browser automation specs
└── docs/                        # Complete technical documentation library
```

---

## 🚀 Quick-Start Guide (Running Locally)

### Prerequisites
- Python 3.10 or higher.
- A modern web browser.

### 1. Clone & Configure Environment
```bash
git clone https://github.com/somansinghal/planora-ai.git
cd planora-ai
cp .env.example backend/.env
```

### 2. Start the FastAPI Backend
```bash
cd backend
python3 -m pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload --port 8000
```
*API Swagger Documentation: [http://localhost:8000/api/docs](http://localhost:8000/api/docs).*

### 3. Start the Frontend
In a new terminal window, serve the root directory:
```bash
python3 -m http.server 3000
```
Open **[http://localhost:3000](http://localhost:3000)** or test the demo directly at **[http://localhost:3000/dashboard.html?demo=true](http://localhost:3000/dashboard.html?demo=true)**!

---

## 🧪 Automated Testing & Verification

Planora AI includes 2 comprehensive automated test suites covering 29 integration points:

### 1. Backend Security & API Test Suite (15 Tests)
Validates health endpoints, unauthenticated rejection (401), token validation, user profile retrieval, event creation validation, cross-user authorization barriers (403), budget math, task workflows, RSVP summaries, AI plan generation, contextual copilot, master reports, and cascading deletions:
```bash
cd backend
python3 -m unittest discover -s tests -p "test_*.py" -v
```
*Result: 15/15 tests passing in 0.08 seconds.*

### 2. SEO, Social Profiles & Judge Demo Sandbox Suite (14 Tests)
Validates brand assets, 1200×630 social preview dimensions, canonical URLs, meta descriptions, robots.txt directives, sitemap XML integrity, private route `noindex` enforcement, verified creator social links, accessible link labels, and Judge Demo storage isolation:
```bash
python3 tests/test_seo_and_demo.py
```
*Result: 14/14 tests passing in 0.07 seconds.*

---

## 📖 Complete Documentation Library

Detailed engineering guides are located in the `docs/` directory:
- [Full Site Audit & Remediation Report](docs/FULL_SITE_AUDIT.md) *(Comprehensive Quality & Security Audit)*
- [Judge Demo Mode Specification](docs/JUDGE_DEMO.md) *(Mandatory for Evaluators)*
- [Demo Security & Isolation Audit](docs/DEMO_SECURITY_AUDIT.md)
- [Technical SEO Audit](docs/SEO_AUDIT.md)
- [Technical SEO Implementation Guide](docs/SEO_IMPLEMENTATION.md)
- [Social Links & Creator Attribution](docs/SOCIAL_LINKS.md)
- [Project Overview](docs/PROJECT_OVERVIEW.md)
- [Product Requirements Document (PRD)](docs/PRODUCT_REQUIREMENTS.md)
- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Authentication & Authorization Guide](docs/AUTHENTICATION_AND_AUTHORIZATION.md)
- [Security Audit Report](docs/SECURITY_AUDIT.md)
- [Code Quality Audit](docs/CODE_QUALITY_AUDIT.md)
- [Accessibility Audit (WCAG AA)](docs/ACCESSIBILITY_AUDIT.md)
- [Performance Audit](docs/PERFORMANCE_AUDIT.md)
- [Test Strategy](docs/TEST_STRATEGY.md)
- [Test Execution Report](docs/TEST_REPORT.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Environment Variables](docs/ENVIRONMENT_VARIABLES.md)
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- [Known Limitations](docs/KNOWN_LIMITATIONS.md)

---

## 🔒 Security & Privacy Guarantees

- **Zero Client Secrets**: Service account JSON keys and `GROQ_API_KEY` reside strictly in server environment variables.
- **Zero Cross-Tenant Leaks**: All backend endpoints verify `resource.user_id == current_user.uid`.
- **Demo Mode Isolation**: The Judge Demo operates strictly inside the evaluator's browser `localStorage` and never issues unauthenticated mutations to production Firestore databases.
- **Private Route Protection**: All 11 authenticated workspaces declare `<meta name="robots" content="noindex, nofollow">` and are disallowed in `robots.txt`.

---

## 📄 License

Planora AI is released under the [MIT License](LICENSE).  
Copyright (c) 2026 Planora AI · Founded by [Soman Singhal](https://somansinghal.vercel.app/).
