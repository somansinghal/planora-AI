/**
 * Planora AI – Judge Demo Mode Architecture
 * 
 * Provides a dedicated, fully isolated client-side sandbox environment
 * seeded with rich sample data for hackathon judges and evaluators.
 * 
 * Key Guarantees:
 * 1. Zero friction: No account creation, login, or credentials needed.
 * 2. Absolute Isolation: Does not read, query, or write to live Firestore or real user records.
 * 3. Interactive Sandbox: Judges can add expenses, toggle tasks, check RSVPs, and view analytics.
 * 4. Safe Reset: One-click "Reset Demo Data" restores pristine sample data.
 * 5. Clear Indicators: Visible "Demo Mode" badge and persistent explanatory top banner.
 */

const DEMO_STORAGE_KEY = 'planora_judge_demo_data_v2';
const DEMO_ACTIVE_FLAG = 'planora_judge_demo_active';

export const DEMO_USER = {
  uid: 'judge-demo-evaluator',
  displayName: 'Judge Evaluator',
  email: 'judge@planora.ai',
  isDemo: true,
  role: 'hackathon_judge'
};

const INITIAL_DEMO_DATA = {
  event: {
    id: 'demo-showcase-wedding',
    name: 'Planora Showcase Wedding',
    event_type: 'wedding',
    event_date: '2026-11-20',
    location: 'The Oberoi Udaivilas, Udaipur, Rajasthan',
    guest_count: 200,
    budget: 1200000,
    spent: 785000,
    currency: 'INR',
    description: 'Grand royal palace celebration featuring traditional Rajasthani sangeet, lakeside mandap ceremony, and banquet reception.',
    theme: 'Royal Rajputana Heritage & Contemporary Luxury',
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-25T08:00:00Z'
  },
  expenses: [
    {
      id: 'demo-exp-1',
      title: 'Palace Venue & Royal Feast (200 Guests)',
      category: 'Venue & Catering',
      amount: 650000,
      paid_amount: 650000,
      payment_status: 'paid',
      vendor_name: 'The Oberoi Udaivilas',
      due_date: '2026-11-01',
      notes: 'Includes lakeside courtyard, banquet hall, and high-tea counters'
    },
    {
      id: 'demo-exp-2',
      title: 'Cinematography & Candid Drone Photography',
      category: 'Photography',
      amount: 120000,
      paid_amount: 120000,
      payment_status: 'paid',
      vendor_name: 'Luminance Wedding Cinema',
      due_date: '2026-10-15',
      notes: '3-camera team, drone cinematography, edited teaser & 4K album'
    },
    {
      id: 'demo-exp-3',
      title: 'Lakeside Mandap Floral Decor & Lighting',
      category: 'Floral & Decor',
      amount: 95000,
      paid_amount: 45000,
      payment_status: 'partial',
      vendor_name: 'Bloom & Petals Decorators',
      due_date: '2026-11-10',
      notes: 'Marigold cascades, tuberose drapery, and warm fairy canopy'
    },
    {
      id: 'demo-exp-4',
      title: 'Sangeet DJ, Line-Array Sound & Stage Lights',
      category: 'Entertainment',
      amount: 45000,
      paid_amount: 0,
      payment_status: 'pending',
      vendor_name: 'SoundWave Pro Productions',
      due_date: '2026-11-15',
      notes: 'Live acoustic setup, wireless mics, moving head lights'
    },
    {
      id: 'demo-exp-5',
      title: 'Royal Letterpress Gold Foil Invitations',
      category: 'Stationery',
      amount: 25000,
      paid_amount: 25000,
      payment_status: 'paid',
      vendor_name: 'Royal Heritage Prints',
      due_date: '2026-09-30',
      notes: 'Custom boxed wedding invites with wax seals sent to 120 addresses'
    },
    {
      id: 'demo-exp-6',
      title: 'Handcrafted Blue Pottery Welcome Favors',
      category: 'Favors & Gifts',
      amount: 30000,
      paid_amount: 15000,
      payment_status: 'partial',
      vendor_name: 'Jaipur Blue Craft Co.',
      due_date: '2026-11-05',
      notes: 'Artisanal spice and miniature sweet jars for all attending guests'
    }
  ],
  tasks: [
    {
      id: 'demo-task-1',
      title: 'Confirm royal feast menu tasting & special dietary items',
      category: 'Catering',
      priority: 'high',
      status: 'completed',
      due_date: '2026-10-10',
      assignee: 'Soman Singhal'
    },
    {
      id: 'demo-task-2',
      title: 'Approve lakeside mandap floral 3D visualization render',
      category: 'Decor',
      priority: 'medium',
      status: 'completed',
      due_date: '2026-10-15',
      assignee: 'Priya (Event Lead)'
    },
    {
      id: 'demo-task-3',
      title: 'Curate Sangeet family dance sequence & track mix with DJ',
      category: 'Music',
      priority: 'high',
      status: 'in_progress',
      due_date: '2026-11-02',
      assignee: 'Soman Singhal'
    },
    {
      id: 'demo-task-4',
      title: 'Send digital WhatsApp RSVP reminders to remaining 35 guests',
      category: 'RSVP',
      priority: 'high',
      status: 'in_progress',
      due_date: '2026-11-05',
      assignee: 'Guest Concierge'
    },
    {
      id: 'demo-task-5',
      title: 'Conduct audio soundcheck and generator redundancy inspection',
      category: 'Production',
      priority: 'critical',
      status: 'todo',
      due_date: '2026-11-18',
      assignee: 'Sound Lead'
    },
    {
      id: 'demo-task-6',
      title: 'Assemble welcome hampers for outstation hotel check-in',
      category: 'Hospitality',
      priority: 'normal',
      status: 'todo',
      due_date: '2026-11-19',
      assignee: 'Hospitality Desk'
    }
  ],
  vendors: [
    {
      id: 'demo-vendor-1',
      name: 'The Oberoi Udaivilas',
      category: 'Venue & Hospitality',
      contact_person: 'Rajesh Verma',
      phone: '+91 98290 12345',
      email: 'events.udaivilas@demo-oberoi.com',
      contract_status: 'confirmed',
      total_quoted: 650000,
      notes: 'Palace gardens, lake-view suites, full banquet staff'
    },
    {
      id: 'demo-vendor-2',
      name: 'Luminance Wedding Cinema',
      category: 'Photo & Cinema',
      contact_person: 'Neha Kapoor',
      phone: '+91 98111 23456',
      email: 'neha@luminancecinema.demo',
      contract_status: 'confirmed',
      total_quoted: 120000,
      notes: 'Lead director + 2 cinematographers + drone pilot'
    },
    {
      id: 'demo-vendor-3',
      name: 'Bloom & Petals Floral Atelier',
      category: 'Floral & Decor',
      contact_person: 'Amit Joshi',
      phone: '+91 99280 34567',
      email: 'amit@bloomandpetals.demo',
      contract_status: 'confirmed',
      total_quoted: 95000,
      notes: 'Eco-friendly flowers, brass oil lamps, jasmine garlands'
    },
    {
      id: 'demo-vendor-4',
      name: 'SoundWave Pro Productions',
      category: 'Sound & Entertainment',
      contact_person: 'DJ Rohan',
      phone: '+91 98200 45678',
      email: 'djrohan@soundwavepro.demo',
      contract_status: 'confirmed',
      total_quoted: 45000,
      notes: 'Line array audio, smoke machines, intelligent moving lights'
    }
  ],
  guests: [
    {
      id: 'demo-guest-1',
      name: 'Alex Johnson (Sample Demo Guest)',
      email: 'alex.demo@example.com',
      phone: '+91 98000 11111',
      rsvp_status: 'confirmed',
      party_size: 2,
      dietary_preference: 'Vegetarian',
      table_assignment: 'Table 1 – Lakefront',
      notes: 'Arriving morning flight'
    },
    {
      id: 'demo-guest-2',
      name: 'Priya Sharma (Sample Demo Guest)',
      email: 'priya.demo@example.com',
      phone: '+91 98000 22222',
      rsvp_status: 'confirmed',
      party_size: 2,
      dietary_preference: 'Jain Vegetarian',
      table_assignment: 'Table 1 – Lakefront',
      notes: 'Close family'
    },
    {
      id: 'demo-guest-3',
      name: 'David Miller (Sample Demo Guest)',
      email: 'david.demo@example.com',
      phone: '+91 98000 33333',
      rsvp_status: 'pending',
      party_size: 1,
      dietary_preference: 'Standard',
      table_assignment: 'Table 3 – Courtyard',
      notes: 'Awaiting flight confirmation'
    },
    {
      id: 'demo-guest-4',
      name: 'Ananya Patel (Sample Demo Guest)',
      email: 'ananya.demo@example.com',
      phone: '+91 98000 44444',
      rsvp_status: 'confirmed',
      party_size: 2,
      dietary_preference: 'Vegan',
      table_assignment: 'Table 2 – Royal Terrace',
      notes: 'Requested quiet seating'
    },
    {
      id: 'demo-guest-5',
      name: 'Marcus Chen (Sample Demo Guest)',
      email: 'marcus.demo@example.com',
      phone: '+91 98000 55555',
      rsvp_status: 'declined',
      party_size: 1,
      dietary_preference: 'None',
      table_assignment: '',
      notes: 'Sending congratulations card'
    },
    {
      id: 'demo-guest-6',
      name: 'Sarah Williams (Sample Demo Guest)',
      email: 'sarah.demo@example.com',
      phone: '+91 98000 66666',
      rsvp_status: 'confirmed',
      party_size: 1,
      dietary_preference: 'Gluten-Free',
      table_assignment: 'Table 2 – Royal Terrace',
      notes: 'Speaker during wedding toast'
    }
  ],
  timeline: [
    {
      id: 'demo-time-1',
      time: '10:00 AM',
      title: 'Vendor Arrivals, Acoustic Setup & Stage Soundcheck',
      location: 'Main Ballroom & Courtyard',
      responsible: 'SoundWave Pro & Bloom Atelier'
    },
    {
      id: 'demo-time-2',
      time: '04:00 PM',
      title: 'Guest Check-in & High-Tea Lakefront Welcome',
      location: 'Lakefront Promenade',
      responsible: 'Hospitality Concierge'
    },
    {
      id: 'demo-time-3',
      time: '05:30 PM',
      title: 'Sunset Mandap Ceremony (Varmala & Pheras)',
      location: 'Lakeside Mandap',
      responsible: 'Officiant & Wedding Leads'
    },
    {
      id: 'demo-time-4',
      time: '07:30 PM',
      title: 'Royal Dinner Feast & Live Musical Performance',
      location: 'Mughal Gardens Pavilion',
      responsible: 'The Oberoi Udaivilas Team'
    },
    {
      id: 'demo-time-5',
      time: '09:30 PM',
      title: 'Cake Cutting, Champagne Toast & Sangeet Dance Floor',
      location: 'Grand Ballroom',
      responsible: 'DJ Rohan & Cinematography Crew'
    }
  ],
  ai_plan: {
    title: 'Sample AI Plan: 200-Guest Royal Udaipur Wedding',
    summary: 'Comprehensive luxury wedding plan optimized for ₹1,200,000 budget, highlighting cultural traditions, lakeside aesthetics, and seamless flow.',
    budget_breakdown: {
      venue_and_catering: '54.2% (₹650,000)',
      photography_and_cinema: '10.0% (₹120,000)',
      floral_and_decor: '7.9% (₹95,000)',
      entertainment_and_sound: '3.8% (₹45,000)',
      stationery_and_favors: '4.6% (₹55,000)',
      contingency_and_buffer: '19.5% (₹235,000)'
    },
    key_recommendations: [
      'Lakeside lighting should activate at 05:15 PM before twilight for optimal golden-hour photography.',
      'Provide dedicated Jain and vegan buffet counters to cater to the 2 confirmed dietary preferences.',
      'Maintain generator backup with automated failover switch in the sound booth.',
      'Send digital reminder SMS to the 35 pending guests 14 days prior to head-count freeze.'
    ]
  }
};

/**
 * Check if the current session is running in Judge Demo Mode
 */
export function isJudgeDemoMode() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('demo') === 'true' || urlParams.get('judge') === 'true') {
    enableJudgeDemoMode();
    return true;
  }
  return localStorage.getItem(DEMO_ACTIVE_FLAG) === 'true';
}

/**
 * Enable Judge Demo Mode and seed sample data if not already present
 */
export function enableJudgeDemoMode() {
  localStorage.setItem(DEMO_ACTIVE_FLAG, 'true');
  if (!localStorage.getItem(DEMO_STORAGE_KEY)) {
    resetDemoData();
  }
}

/**
 * Exit Judge Demo Mode and clear demo flags
 */
export function exitJudgeDemoMode() {
  localStorage.removeItem(DEMO_ACTIVE_FLAG);
  // Clear intended redirect
  sessionStorage.removeItem('planora_redirect_after_login');
  window.location.href = 'index.html';
}

/**
 * Reset Demo Data back to initial pristine showcase state
 */
export function resetDemoData() {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_DATA));
  localStorage.setItem(DEMO_ACTIVE_FLAG, 'true');
  return INITIAL_DEMO_DATA;
}

/**
 * Get the current demo database state from localStorage
 */
export function getDemoData() {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return resetDemoData();
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[Planora Demo] Corrupted storage, re-seeding demo data', err);
    return resetDemoData();
  }
}

/**
 * Save demo state to localStorage
 */
function saveDemoData(data) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
}

// ─────────────────────────────────────────────────────────────
// Demo Data Access & Mutator Methods
// ─────────────────────────────────────────────────────────────

export function getDemoEvent() {
  const data = getDemoData();
  // Recalculate spent
  const totalSpent = data.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  data.event.spent = totalSpent;
  return data.event;
}

export function getDemoExpenses() {
  return getDemoData().expenses || [];
}

export function addDemoExpense(expense) {
  const data = getDemoData();
  const newExp = {
    id: `demo-exp-${Date.now()}`,
    title: expense.title || 'Sample Expense',
    category: expense.category || 'General',
    amount: Number(expense.amount) || 0,
    paid_amount: Number(expense.paid_amount || expense.amount) || 0,
    payment_status: expense.payment_status || 'paid',
    vendor_name: expense.vendor_name || 'Direct Vendor',
    due_date: expense.due_date || new Date().toISOString().split('T')[0],
    notes: expense.notes || ''
  };
  data.expenses.unshift(newExp);
  saveDemoData(data);
  return newExp;
}

export function deleteDemoExpense(expenseId) {
  const data = getDemoData();
  data.expenses = data.expenses.filter(e => e.id !== expenseId);
  saveDemoData(data);
  return true;
}

export function getDemoTasks() {
  return getDemoData().tasks || [];
}

export function addDemoTask(task) {
  const data = getDemoData();
  const newTask = {
    id: `demo-task-${Date.now()}`,
    title: task.title || 'New Task',
    category: task.category || 'Planning',
    priority: task.priority || 'medium',
    status: task.status || 'todo',
    due_date: task.due_date || '',
    assignee: task.assignee || 'Judge Evaluator'
  };
  data.tasks.unshift(newTask);
  saveDemoData(data);
  return newTask;
}

export function updateDemoTask(taskId, updates) {
  const data = getDemoData();
  const idx = data.tasks.findIndex(t => t.id === taskId);
  if (idx !== -1) {
    data.tasks[idx] = { ...data.tasks[idx], ...updates };
    saveDemoData(data);
    return data.tasks[idx];
  }
  return null;
}

export function deleteDemoTask(taskId) {
  const data = getDemoData();
  data.tasks = data.tasks.filter(t => t.id !== taskId);
  saveDemoData(data);
  return true;
}

export function getDemoVendors() {
  return getDemoData().vendors || [];
}

export function addDemoVendor(vendor) {
  const data = getDemoData();
  const newVendor = {
    id: `demo-vendor-${Date.now()}`,
    name: vendor.name || 'New Vendor Partner',
    category: vendor.category || 'Service',
    contact_person: vendor.contact_person || '',
    phone: vendor.phone || '',
    email: vendor.email || '',
    contract_status: vendor.contract_status || 'pending',
    total_quoted: Number(vendor.total_quoted) || 0,
    notes: vendor.notes || ''
  };
  data.vendors.push(newVendor);
  saveDemoData(data);
  return newVendor;
}

export function getDemoGuests() {
  return getDemoData().guests || [];
}

export function addDemoGuest(guest) {
  const data = getDemoData();
  const newGuest = {
    id: `demo-guest-${Date.now()}`,
    name: `${guest.name || 'Demo Guest'} (Sample Demo Guest)`,
    email: guest.email || '',
    phone: guest.phone || '',
    rsvp_status: guest.rsvp_status || 'pending',
    party_size: Number(guest.party_size) || 1,
    dietary_preference: guest.dietary_preference || 'Standard',
    table_assignment: guest.table_assignment || '',
    notes: guest.notes || ''
  };
  data.guests.unshift(newGuest);
  saveDemoData(data);
  return newGuest;
}

export function updateDemoGuest(guestId, updates) {
  const data = getDemoData();
  const idx = data.guests.findIndex(g => g.id === guestId);
  if (idx !== -1) {
    data.guests[idx] = { ...data.guests[idx], ...updates };
    saveDemoData(data);
    return data.guests[idx];
  }
  return null;
}

export function getDemoTimeline() {
  return getDemoData().timeline || [];
}

export function getDemoPlans() {
  const data = getDemoData();
  return [{
    id: 'demo-plan-01',
    event_id: 'demo-showcase-wedding',
    title: data.ai_plan.title || 'Planora Showcase Wedding AI Master Plan',
    summary: data.ai_plan.summary || 'Comprehensive 200-guest luxury royal Udaipur wedding plan optimized for ₹12,00,000.',
    raw_content: JSON.stringify(data.ai_plan),
    budget_breakdown: [
      { category: 'Venue & Catering', percentage: 54, estimated_cost: 650000, description: 'Lakeside courtyard, royal feast, hospitality staff' },
      { category: 'Photography & Cinema', percentage: 10, estimated_cost: 120000, description: '3-camera team, drone cinematography, edited 4K film' },
      { category: 'Floral & Decor', percentage: 8, estimated_cost: 95000, description: 'Marigold and tuberose mandap, ambient fairy canopy' },
      { category: 'Entertainment & DJ', percentage: 4, estimated_cost: 45000, description: 'Line-array sound, live sangeet audio, moving lights' },
      { category: 'Stationery & Favors', percentage: 4, estimated_cost: 55000, description: 'Foil invitations and handcrafted blue pottery gifts' },
      { category: 'Buffer & Contingency', percentage: 20, estimated_cost: 235000, description: 'Emergency buffer and miscellaneous vendor needs' }
    ],
    timeline_milestones: [
      { days_before: 60, title: 'Venue Booking & Deposit Settle', description: 'Confirm The Oberoi Udaivilas courtyard and banquet hall', priority: 'high' },
      { days_before: 30, title: 'Menu Tasting & Floral Decor Finalize', description: 'Sample royal feast dishes and approve lakeside mandap floral design', priority: 'high' },
      { days_before: 14, title: 'Guest RSVP Cutoff & Seating Plan', description: 'Finalize headcount for wedding banquet and dietary preferences', priority: 'high' },
      { days_before: 2, title: 'Audio & Generator Redundancy Soundcheck', description: 'Conduct acoustic soundcheck with DJ Rohan and test backup power', priority: 'critical' }
    ],
    event_day_schedule: [
      { time: '10:00 AM', title: 'Vendor Setup & Soundcheck', location: 'Grand Ballroom', notes: 'SoundWave Pro & Bloom Atelier' },
      { time: '04:00 PM', title: 'Guest Welcome & High-Tea Refreshments', location: 'Lakefront Promenade', notes: 'Traditional welcome drinks' },
      { time: '05:30 PM', title: 'Sunset Mandap Ceremony (Varmala & Pheras)', location: 'Lakeside Mandap', notes: 'Twilight photography' },
      { time: '07:30 PM', title: 'Royal Dinner Feast & Live Music', location: 'Mughal Gardens', notes: 'Buffet & live counters' },
      { time: '09:30 PM', title: 'Cake Cutting & Sangeet Celebrations', location: 'Grand Ballroom', notes: 'DJ dance floor' }
    ],
    recommendations: [
      'Schedule the lakefront sunset ceremony for 05:30 PM to optimize twilight golden-hour photography.',
      'Confirm dedicated Jain and Vegan buffet counters to accommodate the 2 confirmed dietary preferences.',
      'Test generator automated failover switch in the audio booth during the 10:00 AM soundcheck.'
    ],
    created_at: '2026-10-25T08:00:00Z',
    is_sample_output: true,
    disclaimer: 'Clearly labeled sample AI plan for hackathon judge evaluation.'
  }];
}

export function getDemoBudgetSummary() {
  const event = getDemoEvent();
  const expenses = getDemoExpenses();
  const totalBudget = event.budget;
  const totalSpent = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const remaining = totalBudget - totalSpent;
  
  const categories = {};
  expenses.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + (Number(e.amount) || 0);
  });

  return {
    total_budget: totalBudget,
    total_spent: totalSpent,
    remaining,
    utilization_percentage: Math.round((totalSpent / totalBudget) * 100),
    is_over_budget: totalSpent > totalBudget,
    category_breakdown: categories
  };
}

export function getDemoGuestSummary() {
  const guests = getDemoGuests();
  const confirmed = guests.filter(g => g.rsvp_status === 'confirmed').length;
  const pending = guests.filter(g => g.rsvp_status === 'pending').length;
  const declined = guests.filter(g => g.rsvp_status === 'declined').length;
  const totalParty = guests.reduce((sum, g) => sum + (Number(g.party_size) || 1), 0);

  return {
    total_invitations: guests.length,
    total_attending_guests: totalParty,
    confirmed,
    pending,
    declined
  };
}

/**
 * Handle simulated AI Copilot chat query grounded on the demo showcase event
 */
export function queryDemoCopilot(message) {
  const lower = (message || '').toLowerCase();
  
  if (lower.includes('budget') || lower.includes('cost') || lower.includes('spend')) {
    return {
      reply: `[Sample AI Output for Evaluation]\nBased on your Planora Showcase Wedding budget of ₹12,00,000, you have currently committed ₹7,85,000 (65.4% utilization) across 6 vendors.\n\n• Venue & Catering accounts for the majority at ₹6,50,000.\n• You retain a healthy safety reserve of ₹4,15,000 (34.6%) for decor additions and contingency.`
    };
  }

  if (lower.includes('guest') || lower.includes('rsvp') || lower.includes('diet')) {
    return {
      reply: `[Sample AI Output for Evaluation]\nGuest RSVP Status for the Showcase Wedding:\n• Total Invited: 200 guests\n• Confirmed Attendees: 142 confirmed (including Alex Johnson & Priya Sharma)\n• Special Dietary Notes: 2 Jain vegetarian meals requested, 1 vegan plate for Table 2.\n• Recommendation: Issue a polite SMS/WhatsApp reminder to the 35 pending outstation guests 10 days before catering headcount freeze.`
    };
  }

  if (lower.includes('timeline') || lower.includes('schedule') || lower.includes('ceremony')) {
    return {
      reply: `[Sample AI Output for Evaluation]\nEvent Day Timeline Summary:\n• 10:00 AM – Vendor Setup & Audio Soundcheck\n• 04:00 PM – Lakefront Guest Arrival & Welcome Refreshments\n• 05:30 PM – Sunset Varmala & Mandap Ceremony (ideal twilight lighting)\n• 07:30 PM – Royal Dinner Feast\n• 09:30 PM – Cake Cutting & Sangeet Dance Floor\n\nAll 5 milestones are sequenced to maximize lakefront golden-hour photography.`
    };
  }

  return {
    reply: `[Sample AI Output for Evaluation]\nI am your Planora AI Event Copilot grounded in the "Planora Showcase Wedding" workspace. I can assist you with budget rebalancing, milestone scheduling, vendor contract checklists, and guest seating logistics.\n\nTry asking: "What is my current budget status?", "Which guests have special dietary preferences?", or "Summarize the wedding day timeline."`
  };
}

/**
 * Injects the Demo Mode top banner and UI indicators into the active DOM
 */
export function renderDemoBanner() {
  if (!isJudgeDemoMode()) return;

  const existingBanner = document.getElementById('planora-judge-demo-banner');
  if (existingBanner) return;

  const banner = document.createElement('aside');
  banner.id = 'planora-judge-demo-banner';
  banner.className = 'judge-demo-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Hackathon Judge Demo Notice');
  banner.innerHTML = `
    <div class="judge-demo-container">
      <div class="judge-demo-left">
        <span class="judge-demo-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          JUDGE DEMO MODE
        </span>
        <span class="judge-demo-text">
          Interactive Isolated Sandbox &bull; Pre-seeded with <strong>Planora Showcase Wedding</strong>. All edits stay local to your browser session without touching production databases.
        </span>
      </div>
      <div class="judge-demo-actions">
        <button id="btn-reset-demo" class="judge-demo-btn judge-demo-btn-secondary" title="Restore original showcase sample data">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          Reset Demo Data
        </button>
        <button id="btn-exit-demo" class="judge-demo-btn judge-demo-btn-exit" title="Exit demo and return to public website">
          Exit Demo
        </button>
      </div>
    </div>
  `;

  document.body.prepend(banner);

  // Wire buttons
  document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
    resetDemoData();
    window.location.reload();
  });

  document.getElementById('btn-exit-demo')?.addEventListener('click', () => {
    exitJudgeDemoMode();
  });
}
