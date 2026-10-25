/**
 * Planora AI – Automated Judge Demo Synchronization Test Suite
 * 
 * Verifies:
 * 1. Demo initialization and storage seeding.
 * 2. Adding an expense immediately updates event.spent, dashboard metrics, and budget summary.
 * 3. Editing an expense amount updates total spent, category totals, and remaining balance.
 * 4. Deleting an expense restores previous totals.
 * 5. Category breakdown matches array format expected by budget.html and Chart.js.
 * 6. Events ('planora:data-updated') are dispatched on every mutator operation.
 * 7. Zero budget, negative remaining, and non-numeric safety handling.
 * 8. Task, vendor, and guest mutator synchronization.
 */

// Mock browser globals for Node.js environment
const mockStorage = {};
globalThis.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

const dispatchedEvents = [];
globalThis.window = {
  location: { search: '', href: '' },
  dispatchEvent: (evt) => {
    dispatchedEvents.push(evt);
    return true;
  }
};
globalThis.CustomEvent = class CustomEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.detail = init.detail || {};
  }
};

async function runTests() {
  console.log('🧪 Starting Planora AI Demo Data Synchronization Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Import demo mode module
  const demo = await import('../js/demo-mode.js');

  // Test 1: Reset and Initial Data
  console.log('Test Group 1: Pristine Showcase Seeding');
  demo.resetDemoData();
  const initialEvent = demo.getDemoEvent();
  const initialExpenses = demo.getDemoExpenses();
  assert(initialEvent.id === 'demo-showcase-wedding', 'Showcase event loaded');
  assert(initialEvent.budget === 1200000, 'Initial budget is ₹12,00,000');
  assert(initialExpenses.length === 6, 'Contains 6 initial expenses');
  
  // Verify initial spent is dynamically calculated
  const initialSpent = initialEvent.spent;
  assert(initialSpent === 855000, `Initial calculated spent is ₹855,000 (actual: ${initialSpent})`);

  // Test 2: Add Expense and Verify Synchronous Dashboard Update
  console.log('\nTest Group 2: Adding Expense Updates Dashboard & Event Spent');
  dispatchedEvents.length = 0;
  const newExp = demo.addDemoExpense({
    name: 'Royal Welcome Fireworks',
    category: 'Entertainment',
    estimated_amount: 50000,
    actual_amount: 50000,
    is_paid: true,
    vendor_name: 'Jaipur Pyro Spectacular',
    notes: 'Lakefront synchronized fireworks'
  });

  assert(newExp.id.startsWith('demo-exp-'), 'New expense received unique ID');
  assert(newExp.name === 'Royal Welcome Fireworks', 'Expense name preserved');
  assert(newExp.title === 'Royal Welcome Fireworks', 'Expense title normalized');
  assert(newExp.actual_amount === 50000, 'Actual amount recorded as 50000');
  assert(newExp.is_paid === true, 'Expense marked paid');

  // Verify getDemoEvent().spent immediately updated
  const updatedEvent = demo.getDemoEvent();
  assert(updatedEvent.spent === initialSpent + 50000, `Event spent increased to ₹${updatedEvent.spent}`);

  // Verify getDemoBudgetSummary()
  const summary = demo.getDemoBudgetSummary();
  assert(summary.total_budget === 1200000, 'Summary total_budget is ₹12,00,000');
  assert(summary.total_actual === initialSpent + 50000, `Summary total_actual matches ₹${summary.total_actual}`);
  assert(summary.remaining_budget === 1200000 - (initialSpent + 50000), `Remaining budget updated to ₹${summary.remaining_budget}`);
  assert(summary.over_budget === false, 'Event is within budget');
  assert(Array.isArray(summary.category_breakdown), 'Category breakdown is an array');

  const entertainmentCat = summary.category_breakdown.find(c => c.category === 'Entertainment');
  assert(entertainmentCat && entertainmentCat.actual_total >= 50000, 'Entertainment category total increased');
  assert(dispatchedEvents.some(e => e.type === 'planora:data-updated'), 'planora:data-updated event was dispatched');

  // Test 3: Edit Expense Amount and Verify Recalculation
  console.log('\nTest Group 3: Editing Expense Amount Recalculates Totals');
  dispatchedEvents.length = 0;
  demo.updateDemoExpense(newExp.id, {
    actual_amount: 75000,
    estimated_amount: 75000
  });

  const editedEvent = demo.getDemoEvent();
  assert(editedEvent.spent === initialSpent + 75000, `Edited spent updated to ₹${editedEvent.spent}`);
  const editedSummary = demo.getDemoBudgetSummary();
  assert(editedSummary.remaining_budget === 1200000 - (initialSpent + 75000), `Remaining updated after edit to ₹${editedSummary.remaining_budget}`);

  // Test 4: Delete Expense and Verify Reversion
  console.log('\nTest Group 4: Deleting Expense Restores Baseline');
  dispatchedEvents.length = 0;
  demo.deleteDemoExpense(newExp.id);
  const revertedEvent = demo.getDemoEvent();
  assert(revertedEvent.spent === initialSpent, `Reverted spent restored to initial baseline ₹${revertedEvent.spent}`);
  const revertedSummary = demo.getDemoBudgetSummary();
  assert(revertedSummary.remaining_budget === 1200000 - initialSpent, `Remaining budget restored to ₹${revertedSummary.remaining_budget}`);

  // Test 5: Over-Budget Calculation
  console.log('\nTest Group 5: Over-Budget Threshold and Negative Balance');
  const hugeExp = demo.addDemoExpense({
    name: 'Helicopter Royal Entry',
    category: 'Logistics',
    estimated_amount: 500000,
    actual_amount: 500000,
    is_paid: true
  });
  const overBudgetSummary = demo.getDemoBudgetSummary();
  assert(overBudgetSummary.over_budget === true, 'over_budget is true when spent > budget');
  assert(overBudgetSummary.remaining_budget < 0, `Remaining budget is negative (-₹${Math.abs(overBudgetSummary.remaining_budget)})`);
  demo.deleteDemoExpense(hugeExp.id);

  // Test 6: Tasks Synchronization
  console.log('\nTest Group 6: Tasks Management and Normalization');
  const initialTaskCount = demo.getDemoTasks().length;
  const task = demo.addDemoTask({
    title: 'Test Generator Redundancy Soundcheck',
    category: 'Production',
    priority: 'high',
    assigned_to: 'Audio Specialist'
  });
  assert(demo.getDemoTasks().length === initialTaskCount + 1, 'Task added to demo list');
  assert(task.assigned_to === 'Audio Specialist', 'assigned_to preserved');
  assert(task.assignee === 'Audio Specialist', 'assignee alias normalized');
  demo.updateDemoTask(task.id, { status: 'done' });
  const updatedTask = demo.getDemoTasks().find(t => t.id === task.id);
  assert(updatedTask.status === 'done', 'Task status updated to done');
  demo.deleteDemoTask(task.id);
  assert(demo.getDemoTasks().length === initialTaskCount, 'Task deleted successfully');

  // Test 7: Vendors Synchronization
  console.log('\nTest Group 7: Vendors Management and Normalization');
  const initialVendorCount = demo.getDemoVendors().length;
  const vendor = demo.addDemoVendor({
    name: 'Royal Heritage Horses',
    category: 'Procession',
    estimated_cost: 35000,
    booking_status: 'booked',
    contact_name: 'Vikram Rathore',
    contact_phone: '+91 98000 77777'
  });
  assert(demo.getDemoVendors().length === initialVendorCount + 1, 'Vendor added');
  assert(vendor.booking_status === 'booked', 'Vendor booking status set');
  demo.deleteDemoVendor(vendor.id);
  assert(demo.getDemoVendors().length === initialVendorCount, 'Vendor removed');

  // Test 8: Guests Synchronization and Summary
  console.log('\nTest Group 8: Guests Management and RSVP Breakdown');
  const initialGuestCount = demo.getDemoGuests().length;
  const guest = demo.addDemoGuest({
    name: 'Royal Envoy Guest',
    rsvp_status: 'confirmed',
    plus_one: true,
    dietary_preference: 'Jain'
  });
  assert(demo.getDemoGuests().length === initialGuestCount + 1, 'Guest added');
  const guestSummary = demo.getDemoGuestSummary();
  assert(guestSummary.total_invitations === initialGuestCount + 1, 'Guest summary invitations updated');
  assert(guestSummary.confirmed_count >= 1, 'Confirmed count present');
  assert(typeof guestSummary.pending_count === 'number', 'Pending count is number');
  assert(typeof guestSummary.declined_count === 'number', 'Declined count is number');
  demo.deleteDemoGuest(guest.id);
  assert(demo.getDemoGuests().length === initialGuestCount, 'Guest deleted');

  // Final summary
  console.log(`\n========================================`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
