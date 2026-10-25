# Changelog

All notable changes to Planora AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-25

### Added
- **Core SaaS Architecture**:
  - FastAPI asynchronous backend with modular route, service, and repository design.
  - Responsive Vanilla JavaScript & CSS frontend with rich glassmorphism dark aesthetic.
  - Comprehensive Firebase ID token server-side verification middleware.
  - In-memory fallback repository for zero-config local development and testing.
  - Cloud Firestore security rules with strict user-data isolation.
- **Event Planning Engine**:
  - Create Event Wizard with Indian market currency defaults (INR) and date validation.
  - AI Event Studio powered by Groq LLaMA 3.1 with structured Pydantic schema validation.
  - Transparent demonstration mode fallback for offline demonstrations.
  - Budget & Expense Management with real-time utilization and Chart.js category visualizations.
  - Timeline & Milestone preparation roadmap with day-of hourly run-sheet.
  - Task Manager with status transitions, priorities, search, and progress metrics.
  - Vendor Management Roster with quote tracking and booking status badges.
  - Guest Management with RSVP summary metrics, dietary notes, and +1 attendance counts.
  - Contextual AI Event Copilot grounded in real-time event budget, tasks, and attendance.
  - Executive Master Reports with CSV exports and print-ready PDF styling.
- **Testing & Quality Assurance**:
  - Automated backend API test suite with 15 passing tests.
  - Security audit, accessibility audit, SEO audit, and code quality audit documents.
  - Playwright browser automation test scripts with screenshot and video generation.
