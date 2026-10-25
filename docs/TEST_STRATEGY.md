# Test Strategy – Planora AI

## 1. Overview & Objectives

The Planora AI test strategy provides end-to-end quality verification covering unit, integration, browser automation, and security regression testing without fabricating results.

### Core Testing Pillars:
1. **Backend Integration & Unit Tests**: PyTest / standard unittest execution covering API schemas, security token verification, cross-user isolation, mathematical budget accuracy, and cascading deletion.
2. **Browser Automation**: Playwright automated browser test scripts exercising landing page navigation, login forms, event creation, AI plan generation, budget management, task toggles, and report exports.
3. **Security Penetration Tests**: Verifying rejection of unauthenticated requests (`401`), malformed tokens, and unauthorized cross-account access (`403`).
4. **Deterministic Mocks vs Live AI**: Regular automated tests use deterministic mock/demo responses to guarantee sub-second, flake-free CI runs, while live Groq API connectivity is tested separately when credentials are provided.

---

## 2. Test Execution Commands

### 2.1 Backend Unit & Integration Tests
Run from the `backend/` directory:
```bash
python3 -m unittest discover -s tests -p "test_*.py" -v
```

### 2.2 Playwright Browser Tests
Install Playwright test dependencies (Node.js runtime):
```bash
npm install
npx playwright test
```

Run in headed mode for visual debugging:
```bash
npx playwright test --headed
```

Generate browser execution screenshots:
```bash
node tests/playwright/capture-screenshots.js
```

Record end-to-end browser walkthrough video:
```bash
node tests/playwright/record-demo-video.js
```

---

## 3. Test Coverage Matrix

| Area | Workflow Tested | Tool / Runner | Success Criteria |
|---|---|---|---|
| **Health** | `/api/health` availability | Pytest / Unittest | 200 OK, JSON status "ok" |
| **Auth** | Bearer token validation, 401 on missing token | Pytest / Unittest | HTTP 401 when unauthenticated |
| **Auth** | Profile retrieval (`/api/me`) | Pytest / Unittest | Correct user UID and email |
| **Security** | Cross-user data isolation | Pytest / Unittest | HTTP 403 Forbidden |
| **Events** | Validation of budget and future dates | Pytest / Unittest | HTTP 422 on invalid/negative inputs |
| **Events** | Event CRUD operations | Pytest / Unittest | Correct persistence and updates |
| **Budget** | Expense creation and utilization math | Pytest / Unittest | Accurate remaining balance |
| **Tasks** | Status transitions & priority filters | Pytest / Unittest | Correct task states (`todo` to `done`) |
| **Vendors** | Vendor quotes and booking statuses | Pytest / Unittest | Status badges and quote storage |
| **Guests** | RSVP counts and +1 headcount calculations | Pytest / Unittest | Confirmed headcount math matches |
| **AI Studio** | Plan generation and schema validation | Pytest / Unittest | Validated `EventPlanResponse` JSON |
| **Copilot** | Contextual event queries | Pytest / Unittest | Context-grounded recommendations |
| **Reports** | Master dossier and CSV exports | Pytest / Unittest | Valid CSV content-type and headers |
| **Deletion** | Cascading deletion of related entities | Pytest / Unittest | All sub-records purged |
