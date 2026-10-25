# Planora AI — Automated Testing & Verification Guide

This document describes the automated testing framework, test execution instructions, and verified test results for Planora AI.

---

## 1. Test Architecture Overview

Planora AI implements a multi-tier test strategy:

```
┌────────────────────────────────────────────────────────────────┐
│  Tier 1: Client Sandbox & Synchronization Tests                │
│  - tests/test_demo_sync.js (37 automated Node.js tests)        │
│  - Validates expense addition, recalculation, editing,         │
│    deletion, budget metrics, and reactive event dispatch.      │
├────────────────────────────────────────────────────────────────┤
│  Tier 2: Technical SEO, Metadata, and Demo Isolation Tests     │
│  - tests/test_seo_and_demo.py (16 Python unittest assertions)  │
│  - Validates meta tags, Open Graph, sitemap, robots, social    │
│    profiles, demo banners, and secret exclusion.               │
├────────────────────────────────────────────────────────────────┤
│  Tier 3: Backend REST API Integration Tests                    │
│  - backend/tests/test_api.py (15 Python unittest tests)        │
│  - Validates auth guards, cross-user 403 authorization,        │
│    event CRUD, budget endpoints, and AI fallback.              │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Running Automated Tests

### Run Full Test Suite (Frontend + SEO)
```bash
npm test
```

### Run Demo Synchronization Tests
```bash
npm run test:demo
# Or directly:
node tests/test_demo_sync.js
```

### Run SEO, Metadata & Security Verification
```bash
npm run test:seo
# Or directly:
python3 tests/test_seo_and_demo.py
```

### Run Backend API Integration Tests
```bash
npm run test:api
# Or directly:
PYTHONPATH=backend python3 -m unittest discover -s backend/tests -p "test_*.py" -v
```

---

## 3. Verified Test Results

### 3.1 Demo Synchronization Suite (`tests/test_demo_sync.js`)
| # | Test Scenario | Expected Outcome | Actual Result |
| :--- | :--- | :--- | :--- |
| 1 | Initial Showcase Seeding | Event ID `demo-showcase-wedding`, Budget ₹12,00,000 | ✅ PASS |
| 2 | Initial Calculated Spent | `event.spent` equals sum of paid expenses (₹855,000) | ✅ PASS |
| 3 | Add Valid Expense | Name preserved, actual amount set, ID generated | ✅ PASS |
| 4 | Synchronous Spent Recalculation | `event.spent` increases by ₹50,000 to ₹905,000 | ✅ PASS |
| 5 | Remaining Budget Math | Remaining equals `1,200,000 - 905,000 = 295,000` | ✅ PASS |
| 6 | Category Breakdown Array | Summary returns CategorySummary array with item counts | ✅ PASS |
| 7 | Reactive Event Dispatch | `planora:data-updated` dispatched to window | ✅ PASS |
| 8 | Edit Expense Amount | Spent recalculates to ₹930,000, remaining updates | ✅ PASS |
| 9 | Delete Expense Reversion | Spent reverts to baseline ₹855,000, remaining to ₹345,000 | ✅ PASS |
| 10 | Over-Budget Detection | `over_budget = true` and remaining is negative | ✅ PASS |
| 11 | Task Normalization & Status | Task added, status updated to `done`, `assigned_to` preserved | ✅ PASS |
| 12 | Vendor Registration | Vendor added with `booking_status: 'booked'`, removed cleanly | ✅ PASS |
| 13 | Guest Headcount & Summary | Guest added, total headcount and RSVP breakdown updated | ✅ PASS |

**Total**: 37 / 37 passed (0 failures).

---

### 3.2 SEO & Demo Isolation Suite (`tests/test_seo_and_demo.py`)
| # | Test Module | Expected Outcome | Actual Result |
| :--- | :--- | :--- | :--- |
| 1 | Asset Existence | Favicons (SVG, ICO, PNGs), robots.txt, sitemap.xml | ✅ PASS |
| 2 | Social Preview Dimensions | `planora-ai-social-preview.png` is valid 1200x630 PNG | ✅ PASS |
| 3 | Public Page SEO Metadata | Title, description (>30 chars), canonical URLs | ✅ PASS |
| 4 | Open Graph Tags | `og:title`, `og:description`, `og:image`, `og:url` | ✅ PASS |
| 5 | Twitter Card Tags | `summary_large_image`, `twitter:site` | ✅ PASS |
| 6 | Schema.org Structured Data | Valid JSON-LD `SoftwareApplication` on index/about | ✅ PASS |
| 7 | Robots.txt Accessibility | Public routes allowed, internal API routes disallow | ✅ PASS |
| 8 | Sitemap.xml Validation | Valid XML structure containing all 5 public URLs | ✅ PASS |
| 9 | Social Profiles Verification | Verified links for Soman Singhal (GitHub, Portfolio, etc.) | ✅ PASS |
| 10 | Demo Mode Isolation | Pre-seeded with showcase event, zero live DB mutations | ✅ PASS |
| 11 | Demo Entry Points | Verified "Explore Judge Demo" buttons across 7 pages | ✅ PASS |
| 12 | Auth Guard Demo Support | Non-authenticated judge evaluator granted workspace entry | ✅ PASS |
| 13 | App Shell Demo Badges | Visible "DEMO SANDBOX" badge, topbar Reset/Exit buttons | ✅ PASS |
| 14 | API Client Interception | Intercepts demo calls without firing live HTTP requests | ✅ PASS |
| 15 | Expense Synchronization | Validates mutators and reactive listener registration | ✅ PASS |
| 16 | Secret Protection & Exclusions | `.gitignore` excludes `.env`, `serviceAccountKey.json` | ✅ PASS |

**Total**: 16 / 16 passed (0 failures).

---

### 3.3 Backend REST API Suite (`backend/tests/test_api.py`)
| # | Test Module | Expected Outcome | Actual Result |
| :--- | :--- | :--- | :--- |
| 1 | Health Check | `GET /health` returns HTTP 200 OK | ✅ PASS |
| 2 | Auth Enforcement | Unauthenticated request rejected with HTTP 401 | ✅ PASS |
| 3 | Malformed Token Rejection | Invalid JWT structure rejected with HTTP 401 | ✅ PASS |
| 4 | User Profile Retrieval | Authenticated user profile returned | ✅ PASS |
| 5 | Event Validation | Invalid budget/date rejected with HTTP 422 | ✅ PASS |
| 6 | Event Ownership Isolation | User A sees User A's events; User B sees empty list | ✅ PASS |
| 7 | Cross-User Access Blocked | User B attempting to access User A's event returns 403 | ✅ PASS |
| 8 | Event Update | User A updates event details successfully | ✅ PASS |
| 9 | Budget & Expenses | Add expense, calculate category breakdown and totals | ✅ PASS |
| 10 | Task Workflow | Create tasks, filter by priority, toggle status | ✅ PASS |
| 11 | Vendor & Guest Management | Create vendor, record RSVPs, verify counts | ✅ PASS |
| 12 | AI Plan Generation | Generates structured plan with fallback support | ✅ PASS |
| 13 | AI Copilot Query | Contextual query returns grounded recommendations | ✅ PASS |
| 14 | Report & CSV Export | Master report generated, CSV export functional | ✅ PASS |
| 15 | Cascading Deletion | Deleting event cascades cleanly | ✅ PASS |

**Total**: 15 / 15 passed (0 failures).

---

## 4. Overall Test Summary

- **Total Automated Assertions**: 68 tests
- **Passing**: 68 (100%)
- **Failing**: 0 (0%)
- **Flaky Tests**: 0
