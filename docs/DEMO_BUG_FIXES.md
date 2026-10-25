# Planora AI — Judge Demo Synchronization Bug Audit & Remediation

This document details the root-cause analysis, reproduction, and verified fix for the **Judge Demo Expense Synchronization Defect**, along with the broader audit of entity synchronization across the Planora AI SaaS workspace.

---

## 1. Critical Defect Analysis: Expense Addition Did Not Update Dashboard

### 1.1 Observed Symptoms
When a hackathon judge or evaluator entered Judge Demo Mode, opened `budget.html`, and added an expense:
1. The expense item might appear in the budget list, but the dashboard's "Total Spent", "Remaining Budget", and budget donut chart remained frozen at initial values.
2. The category summary breakdown in `budget.html` failed to render or threw runtime exceptions because Chart.js expected an array.
3. If an expense was edited or deleted in demo mode, the database in `localStorage` was either not updated or `event.spent` was never recalculated.

---

### 1.2 Root Cause Investigation

Upon rigorous inspection of `budget.html`, `dashboard.html`, `js/api.js`, and `js/demo-mode.js`, **four underlying defects** were identified:

#### Root Cause 1: Schema Incompatibility between UI Form and Demo Mutator
- In `budget.html`, the form submission created a payload:
  ```javascript
  const payload = {
    name,
    category,
    estimated_amount: estimated,
    actual_amount: actual,
    vendor_name,
    is_paid,
    notes,
  };
  await createExpense(selectedEventId, payload);
  ```
- In `js/demo-mode.js`, `addDemoExpense` was coded with different property names:
  ```javascript
  const newExp = {
    title: expense.title || 'Sample Expense',
    amount: Number(expense.amount) || 0,
    paid_amount: Number(expense.paid_amount || expense.amount) || 0,
    payment_status: expense.payment_status || 'paid',
    ...
  };
  ```
- **The Consequence**: Because `expense.amount` and `expense.title` were undefined on the payload sent from `budget.html`, `amount` was computed as `Number(undefined) || 0 = 0`, and `name` was never set! As a result, the new expense was saved with an amount of `0`.

#### Root Cause 2: Stale `event.spent` Field
- In `INITIAL_DEMO_DATA`, `event.spent` was hardcoded to `785000`.
- When `addDemoExpense` or `deleteDemoExpense` was called, `saveDemoData(data)` serialized `data` without re-summing `data.expenses`.
- When `dashboard.html` loaded events via `getEvents()`, it read `event.spent`. Because `addDemoExpense` saved `amount: 0`, and `saveDemoData` never updated `data.event.spent`, the dashboard total spent remained frozen forever.

#### Root Cause 3: Category Breakdown Format Mismatch
- In `backend/app/routes/budgets.py` and `budget.html`, `category_breakdown` was defined as an **Array** of `{ category, item_count, actual_total, estimated_total }`.
- In `js/demo-mode.js`, `getDemoBudgetSummary()` returned `category_breakdown` as an **Object map** (`{ 'Venue & Catering': 650000 }`).
- In `budget.html`, `summary.category_breakdown.map(...)` and `renderChart(...)` failed or produced `undefined` values.

#### Root Cause 4: Missing Reactive Event Propagation
- `dashboard.html` only fetched data once upon initial script evaluation. If an expense was modified in `budget.html` or another tab, `dashboard.html` had no listener for cross-tab storage changes or workspace updates.

---

## 2. Implemented Architecture & Fix Details

### 2.1 Dual-Key Entity Normalization in `js/demo-mode.js`
All demo entity mutators now normalize both naming conventions simultaneously:
```javascript
export function addDemoExpense(expense) {
  const data = getDemoData();
  const name = expense.name || expense.title || 'Sample Expense';
  const category = expense.category || 'General';
  const estimated = Number(expense.estimated_amount !== undefined ? expense.estimated_amount : (expense.amount !== undefined ? expense.amount : 0)) || 0;
  const actual = (expense.actual_amount !== undefined && expense.actual_amount !== null && !isNaN(expense.actual_amount))
    ? Number(expense.actual_amount)
    : (expense.is_paid ? estimated : (Number(expense.paid_amount) || 0));
  const isPaid = Boolean(expense.is_paid !== undefined ? expense.is_paid : (expense.payment_status === 'paid'));

  const newExp = {
    id: expense.id || `demo-exp-${Date.now()}`,
    name,
    title: name,
    category,
    estimated_amount: estimated,
    amount: estimated,
    actual_amount: actual,
    paid_amount: actual,
    is_paid: isPaid,
    payment_status: isPaid ? 'paid' : (actual > 0 ? 'partial' : 'pending'),
    vendor_name: expense.vendor_name || 'Direct Vendor',
    due_date: expense.due_date || new Date().toISOString().split('T')[0],
    notes: expense.notes || ''
  };

  data.expenses.unshift(newExp);
  saveDemoData(data);
  return newExp;
}
```

### 2.2 Dynamic Recalculation on Every Write
In `saveDemoData(data)`, `data.event.spent` is dynamically computed and persisted every single time data is modified:
```javascript
function saveDemoData(data) {
  if (data.event && data.expenses) {
    const totalSpent = data.expenses.reduce((sum, e) => {
      const act = (e.actual_amount !== null && e.actual_amount !== undefined && !isNaN(e.actual_amount))
        ? Number(e.actual_amount)
        : (e.is_paid ? Number(e.estimated_amount || e.amount || 0) : Number(e.paid_amount || 0));
      return sum + act;
    }, 0);
    data.event.spent = totalSpent;
    data.event.updated_at = new Date().toISOString();
  }
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('planora:data-updated', { detail: { data } }));
}
```

### 2.3 Wiring Missing API Mutators in `js/api.js`
- `updateExpense(id, data)`: Connected to `updateDemoExpense(id, data)` (previously did not mutate storage).
- `deleteExpense(id)`: Connected to `deleteDemoExpense(id)` with recalculation.
- `updateVendor(id, data)`: Connected to `updateDemoVendor(id, data)`.
- `deleteVendor(id)`: Connected to `deleteDemoVendor(id)`.
- `deleteGuest(id)`: Connected to `deleteDemoGuest(id)`.
- `updateEvent(id, data)`: Connected to `updateDemoEvent(data)`.

### 2.4 Reactive Event Listeners
`dashboard.html`, `budget.html`, `tasks.html`, `vendors.html`, and `guests.html` now listen to:
1. `window.addEventListener('planora:data-updated', ...)`: Same-window immediate refresh.
2. `window.addEventListener('storage', ...)`: Cross-tab / cross-window synchronization.
3. `window.addEventListener('pageshow', ...)` / `visibilitychange`: Automatic refresh when navigating back or switching tabs.

---

## 3. Audit of Other Entity Synchronization Deficiencies

| Entity | Defect Discovered | Resolution |
| :--- | :--- | :--- |
| **Tasks** | `INITIAL_DEMO_DATA.tasks` used `status: 'completed'` instead of `'done'`, breaking `tasks.html` checkbox filters. `assigned_to` was missing. | Normalized `status` to `'done'`, mapped `assigned_to` and `assignee` bidirectionally. |
| **Vendors** | `INITIAL_DEMO_DATA.vendors` used `contract_status: 'confirmed'` instead of `booking_status: 'booked'`. Contact fields were named `contact_person` instead of `contact_name`. `deleteVendor` was a no-op. | Added `booking_status: 'booked'`, mapped contact fields, implemented `updateDemoVendor` and `deleteDemoVendor`. |
| **Guests** | `guests.html` expected `total_attending_headcount`, `pending_count`, and `declined_count`. Demo returned `total_attending_guests`, `pending`, `declined`. Plus-one flag was absent. | Returned both sets of property names in `getDemoGuestSummary()`, normalized `plus_one` boolean. |
| **Chart Leaks** | Re-rendering Chart.js doughnut in `dashboard.html` created canvas overlaps without destroying previous instance. | Maintained `window._planoraBudgetDonutChart` reference and cleanly destroyed previous instance. |

---

## 4. Verification & Automated Test Evidence

- **Automated Test Suite**: `tests/test_demo_sync.js` (37 assertions executed via Node.js).
- **Regression Suite**: `tests/test_seo_and_demo.py` (16 tests executed via Python unittest).
- **Backend Suite**: `backend/tests/test_api.py` (15 tests executed via Python unittest).
- **Results**: 100% PASS across all 68 assertions.
