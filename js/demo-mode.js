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

const DEMO_STORAGE_KEY = 'planora_judge_demo_data_v3';
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
    spent: 855000,
    currency: 'INR',
    description: 'Grand royal palace celebration featuring traditional Rajasthani sangeet, lakeside mandap ceremony, and banquet reception.',
    theme: 'Royal Rajputana Heritage & Contemporary Luxury',
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-25T08:00:00Z'
  },
  expenses: [
    {
      id: 'demo-exp-1',
      name: 'Palace Venue & Royal Feast (200 Guests)',
      title: 'Palace Venue & Royal Feast (200 Guests)',
      category: 'Venue & Catering',
      estimated_amount: 650000,
      actual_amount: 650000,
      amount: 650000,
      paid_amount: 650000,
      is_paid: true,
      payment_status: 'paid',
      vendor_name: 'The Oberoi Udaivilas',
      due_date: '2026-11-01',
      notes: 'Includes lakeside courtyard, banquet hall, and high-tea counters'
    },
    {
      id: 'demo-exp-2',
      name: 'Cinematography & Candid Drone Photography',
      title: 'Cinematography & Candid Drone Photography',
      category: 'Photography',
      estimated_amount: 120000,
      actual_amount: 120000,
      amount: 120000,
      paid_amount: 120000,
      is_paid: true,
      payment_status: 'paid',
      vendor_name: 'Luminance Wedding Cinema',
      due_date: '2026-10-15',
      notes: '3-camera team, drone cinematography, edited teaser & 4K album'
    },
    {
      id: 'demo-exp-3',
      name: 'Lakeside Mandap Floral Decor & Lighting',
      title: 'Lakeside Mandap Floral Decor & Lighting',
      category: 'Floral & Decor',
      estimated_amount: 95000,
      actual_amount: 45000,
      amount: 95000,
      paid_amount: 45000,
      is_paid: false,
      payment_status: 'partial',
      vendor_name: 'Bloom & Petals Decorators',
      due_date: '2026-11-10',
      notes: 'Marigold cascades, tuberose drapery, and warm fairy canopy'
    },
    {
      id: 'demo-exp-4',
      name: 'Sangeet DJ, Line-Array Sound & Stage Lights',
      title: 'Sangeet DJ, Line-Array Sound & Stage Lights',
      category: 'Entertainment',
      estimated_amount: 45000,
      actual_amount: 0,
      amount: 45000,
      paid_amount: 0,
      is_paid: false,
      payment_status: 'pending',
      vendor_name: 'SoundWave Pro Productions',
      due_date: '2026-11-15',
      notes: 'Live acoustic setup, wireless mics, moving head lights'
    },
    {
      id: 'demo-exp-5',
      name: 'Royal Letterpress Gold Foil Invitations',
      title: 'Royal Letterpress Gold Foil Invitations',
      category: 'Stationery',
      estimated_amount: 25000,
      actual_amount: 25000,
      amount: 25000,
      paid_amount: 25000,
      is_paid: true,
      payment_status: 'paid',
      vendor_name: 'Royal Heritage Prints',
      due_date: '2026-09-30',
      notes: 'Custom boxed wedding invites with wax seals sent to 120 addresses'
    },
    {
      id: 'demo-exp-6',
      name: 'Handcrafted Blue Pottery Welcome Favors',
      title: 'Handcrafted Blue Pottery Welcome Favors',
      category: 'Favors & Gifts',
      estimated_amount: 30000,
      actual_amount: 15000,
      amount: 30000,
      paid_amount: 15000,
      is_paid: false,
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
      status: 'done',
      due_date: '2026-10-10',
      assignee: 'Soman Singhal',
      assigned_to: 'Soman Singhal',
      description: 'Review appetizer lineup and confirm special vegan/Jain stations.'
    },
    {
      id: 'demo-task-2',
      title: 'Approve lakeside mandap floral 3D visualization render',
      category: 'Decor',
      priority: 'medium',
      status: 'done',
      due_date: '2026-10-15',
      assignee: 'Priya (Event Lead)',
      assigned_to: 'Priya (Event Lead)',
      description: 'Sign off on marigold arch proportions and twilight ambient fairy canopy.'
    },
    {
      id: 'demo-task-3',
      title: 'Curate Sangeet family dance sequence & track mix with DJ',
      category: 'Music',
      priority: 'high',
      status: 'in_progress',
      due_date: '2026-11-02',
      assignee: 'Soman Singhal',
      assigned_to: 'Soman Singhal',
      description: 'Finalize 12-minute family medley sequence with DJ Rohan.'
    },
    {
      id: 'demo-task-4',
      title: 'Send digital WhatsApp RSVP reminders to remaining 35 guests',
      category: 'RSVP',
      priority: 'high',
      status: 'in_progress',
      due_date: '2026-11-05',
      assignee: 'Guest Concierge',
      assigned_to: 'Guest Concierge',
      description: 'Reach out to pending outstation guests before catering freeze deadline.'
    },
    {
      id: 'demo-task-5',
      title: 'Conduct audio soundcheck and generator redundancy inspection',
      category: 'Production',
      priority: 'critical',
      status: 'todo',
      due_date: '2026-11-18',
      assignee: 'Sound Lead',
      assigned_to: 'Sound Lead',
      description: 'Test acoustic dispersion across courtyard and verify auto-failover switch.'
    },
    {
      id: 'demo-task-6',
      title: 'Assemble welcome hampers for outstation hotel check-in',
      category: 'Hospitality',
      priority: 'medium',
      status: 'todo',
      due_date: '2026-11-19',
      assignee: 'Hospitality Desk',
      assigned_to: 'Hospitality Desk',
      description: 'Package artisanal blue pottery jars and custom Udaipur visitor itineraries.'
    }
  ],
  vendors: [
    {
      id: 'demo-vendor-1',
      name: 'The Oberoi Udaivilas',
      category: 'Venue & Hospitality',
      contact_person: 'Rajesh Verma',
      contact_name: 'Rajesh Verma',
      phone: '+91 98290 12345',
      contact_phone: '+91 98290 12345',
      email: 'events.udaivilas@demo-oberoi.com',
      contact_email: 'events.udaivilas@demo-oberoi.com',
      contract_status: 'confirmed',
      booking_status: 'booked',
      total_quoted: 650000,
      estimated_cost: 650000,
      notes: 'Palace gardens, lake-view suites, full banquet staff'
    },
    {
      id: 'demo-vendor-2',
      name: 'Luminance Wedding Cinema',
      category: 'Photo & Cinema',
      contact_person: 'Neha Kapoor',
      contact_name: 'Neha Kapoor',
      phone: '+91 98111 23456',
      contact_phone: '+91 98111 23456',
      email: 'neha@luminancecinema.demo',
      contact_email: 'neha@luminancecinema.demo',
      contract_status: 'confirmed',
      booking_status: 'booked',
      total_quoted: 120000,
      estimated_cost: 120000,
      notes: 'Lead director + 2 cinematographers + drone pilot'
    },
    {
      id: 'demo-vendor-3',
      name: 'Bloom & Petals Floral Atelier',
      category: 'Floral & Decor',
      contact_person: 'Amit Joshi',
      contact_name: 'Amit Joshi',
      phone: '+91 99280 34567',
      contact_phone: '+91 99280 34567',
      email: 'amit@bloomandpetals.demo',
      contact_email: 'amit@bloomandpetals.demo',
      contract_status: 'confirmed',
      booking_status: 'booked',
      total_quoted: 95000,
      estimated_cost: 95000,
      notes: 'Eco-friendly flowers, brass oil lamps, jasmine garlands'
    },
    {
      id: 'demo-vendor-4',
      name: 'SoundWave Pro Productions',
      category: 'Sound & Entertainment',
      contact_person: 'DJ Rohan',
      contact_name: 'DJ Rohan',
      phone: '+91 98200 45678',
      contact_phone: '+91 98200 45678',
      email: 'djrohan@soundwavepro.demo',
      contact_email: 'djrohan@soundwavepro.demo',
      contract_status: 'confirmed',
      booking_status: 'booked',
      total_quoted: 45000,
      estimated_cost: 45000,
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
      plus_one: true,
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
      plus_one: true,
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
      plus_one: false,
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
      plus_one: true,
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
      plus_one: false,
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
      plus_one: false,
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
/**
 * Save demo state to localStorage and notify all listeners
 */
function saveDemoData(data) {
  if (data.event && data.expenses) {
    // Dynamically recalculate spent from actual expenses or estimated if marked paid
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
  try {
    window.dispatchEvent(new CustomEvent('planora:data-updated', { detail: { data } }));
  } catch (err) {
    // Non-DOM contexts
  }
}

// ─────────────────────────────────────────────────────────────
// Demo Data Access & Mutator Methods
// ─────────────────────────────────────────────────────────────

export function getDemoEvent() {
  const data = getDemoData();
  const totalSpent = (data.expenses || []).reduce((sum, e) => {
    const act = (e.actual_amount !== null && e.actual_amount !== undefined && !isNaN(e.actual_amount))
      ? Number(e.actual_amount)
      : (e.is_paid ? Number(e.estimated_amount || e.amount || 0) : Number(e.paid_amount || 0));
    return sum + act;
  }, 0);
  data.event.spent = totalSpent;
  return data.event;
}

export function updateDemoEvent(updates) {
  const data = getDemoData();
  data.event = { ...data.event, ...updates, updated_at: new Date().toISOString() };
  saveDemoData(data);
  return data.event;
}

export function getDemoExpenses() {
  return getDemoData().expenses || [];
}

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

export function updateDemoExpense(expenseId, updates) {
  const data = getDemoData();
  const idx = data.expenses.findIndex(e => e.id === expenseId);
  if (idx !== -1) {
    const existing = data.expenses[idx];
    const name = updates.name || updates.title || existing.name;
    const category = updates.category || existing.category;
    const estimated = updates.estimated_amount !== undefined
      ? Number(updates.estimated_amount) || 0
      : (updates.amount !== undefined ? Number(updates.amount) || 0 : existing.estimated_amount);
    const actual = updates.actual_amount !== undefined
      ? (updates.actual_amount !== null && !isNaN(updates.actual_amount) ? Number(updates.actual_amount) : 0)
      : (updates.paid_amount !== undefined ? Number(updates.paid_amount) || 0 : existing.actual_amount);
    const isPaid = updates.is_paid !== undefined
      ? Boolean(updates.is_paid)
      : (updates.payment_status ? updates.payment_status === 'paid' : existing.is_paid);

    data.expenses[idx] = {
      ...existing,
      ...updates,
      name,
      title: name,
      category,
      estimated_amount: estimated,
      amount: estimated,
      actual_amount: actual,
      paid_amount: actual,
      is_paid: isPaid,
      payment_status: isPaid ? 'paid' : (actual > 0 ? 'partial' : 'pending'),
      vendor_name: updates.vendor_name !== undefined ? updates.vendor_name : existing.vendor_name,
      notes: updates.notes !== undefined ? updates.notes : existing.notes
    };
    saveDemoData(data);
    return data.expenses[idx];
  }
  return null;
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
  const title = task.title || 'New Task';
  const newTask = {
    id: task.id || `demo-task-${Date.now()}`,
    title,
    category: task.category || 'Planning',
    priority: task.priority || 'medium',
    status: (task.status === 'completed' || task.status === 'done') ? 'done' : (task.status || 'todo'),
    due_date: task.due_date || '',
    assignee: task.assigned_to || task.assignee || 'Judge Evaluator',
    assigned_to: task.assigned_to || task.assignee || 'Judge Evaluator',
    description: task.description || ''
  };
  data.tasks.unshift(newTask);
  saveDemoData(data);
  return newTask;
}

export function updateDemoTask(taskId, updates) {
  const data = getDemoData();
  const idx = data.tasks.findIndex(t => t.id === taskId);
  if (idx !== -1) {
    const existing = data.tasks[idx];
    const normalizedStatus = updates.status !== undefined
      ? ((updates.status === 'completed' || updates.status === 'done') ? 'done' : updates.status)
      : existing.status;
    const assignee = updates.assigned_to || updates.assignee || existing.assignee;
    data.tasks[idx] = {
      ...existing,
      ...updates,
      status: normalizedStatus,
      assignee,
      assigned_to: assignee,
    };
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
  const cost = Number(vendor.estimated_cost !== undefined ? vendor.estimated_cost : (vendor.total_quoted || 0)) || 0;
  const status = vendor.booking_status || (vendor.contract_status === 'confirmed' ? 'booked' : 'not_contacted');
  const contactName = vendor.contact_name || vendor.contact_person || '';
  const phone = vendor.contact_phone || vendor.phone || '';
  const email = vendor.contact_email || vendor.email || '';

  const newVendor = {
    id: vendor.id || `demo-vendor-${Date.now()}`,
    name: vendor.name || 'New Vendor Partner',
    category: vendor.category || 'Service',
    contact_person: contactName,
    contact_name: contactName,
    phone,
    contact_phone: phone,
    email,
    contact_email: email,
    contract_status: status === 'booked' ? 'confirmed' : 'pending',
    booking_status: status,
    total_quoted: cost,
    estimated_cost: cost,
    website: vendor.website || '',
    notes: vendor.notes || ''
  };
  data.vendors.push(newVendor);
  saveDemoData(data);
  return newVendor;
}

export function updateDemoVendor(vendorId, updates) {
  const data = getDemoData();
  const idx = data.vendors.findIndex(v => v.id === vendorId);
  if (idx !== -1) {
    const existing = data.vendors[idx];
    const cost = updates.estimated_cost !== undefined
      ? Number(updates.estimated_cost) || 0
      : (updates.total_quoted !== undefined ? Number(updates.total_quoted) || 0 : existing.estimated_cost);
    const status = updates.booking_status || (updates.contract_status === 'confirmed' ? 'booked' : existing.booking_status);
    const contactName = updates.contact_name || updates.contact_person || existing.contact_name;
    const phone = updates.contact_phone || updates.phone || existing.contact_phone;
    const email = updates.contact_email || updates.email || existing.contact_email;

    data.vendors[idx] = {
      ...existing,
      ...updates,
      booking_status: status,
      contract_status: status === 'booked' ? 'confirmed' : 'pending',
      contact_name: contactName,
      contact_person: contactName,
      contact_phone: phone,
      phone,
      contact_email: email,
      email,
      estimated_cost: cost,
      total_quoted: cost
    };
    saveDemoData(data);
    return data.vendors[idx];
  }
  return null;
}

export function deleteDemoVendor(vendorId) {
  const data = getDemoData();
  data.vendors = data.vendors.filter(v => v.id !== vendorId);
  saveDemoData(data);
  return true;
}

export function getDemoGuests() {
  return getDemoData().guests || [];
}

export function addDemoGuest(guest) {
  const data = getDemoData();
  const plusOne = Boolean(guest.plus_one !== undefined ? guest.plus_one : (Number(guest.party_size) > 1));
  const partySize = guest.party_size ? Number(guest.party_size) : (plusOne ? 2 : 1);

  const newGuest = {
    id: guest.id || `demo-guest-${Date.now()}`,
    name: guest.name || 'Demo Guest',
    email: guest.email || '',
    phone: guest.phone || '',
    rsvp_status: guest.rsvp_status || 'pending',
    plus_one: plusOne,
    party_size: partySize,
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
    const existing = data.guests[idx];
    const plusOne = updates.plus_one !== undefined
      ? Boolean(updates.plus_one)
      : (updates.party_size !== undefined ? Number(updates.party_size) > 1 : existing.plus_one);
    const partySize = updates.party_size !== undefined
      ? Number(updates.party_size)
      : (updates.plus_one !== undefined ? (updates.plus_one ? 2 : 1) : existing.party_size);

    data.guests[idx] = {
      ...existing,
      ...updates,
      plus_one: plusOne,
      party_size: partySize
    };
    saveDemoData(data);
    return data.guests[idx];
  }
  return null;
}

export function deleteDemoGuest(guestId) {
  const data = getDemoData();
  data.guests = data.guests.filter(g => g.id !== guestId);
  saveDemoData(data);
  return true;
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
  const totalBudget = Number(event.budget) || 0;

  let totalEstimated = 0;
  let totalActual = 0;
  const catMap = {};

  expenses.forEach(e => {
    const est = Number(e.estimated_amount !== undefined ? e.estimated_amount : (e.amount || 0)) || 0;
    const act = (e.actual_amount !== null && e.actual_amount !== undefined && !isNaN(e.actual_amount))
      ? Number(e.actual_amount)
      : (e.is_paid ? est : (Number(e.paid_amount) || 0));

    totalEstimated += est;
    totalActual += act;

    const cat = e.category || 'General';
    if (!catMap[cat]) {
      catMap[cat] = { category: cat, estimated_total: 0, actual_total: 0, item_count: 0 };
    }
    catMap[cat].estimated_total += est;
    catMap[cat].actual_total += act;
    catMap[cat].item_count += 1;
  });

  const remaining = totalBudget - totalActual;
  const utilization = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;
  const breakdownList = Object.values(catMap);

  // Category breakdown as both an array and map for maximum compatibility
  const breakdownWithMap = breakdownList.slice();
  Object.keys(catMap).forEach(cat => {
    breakdownWithMap[cat] = catMap[cat].actual_total || catMap[cat].estimated_total;
  });

  return {
    event_id: event.id,
    currency: event.currency || 'INR',
    total_budget: totalBudget,
    total_estimated: totalEstimated,
    total_actual: totalActual,
    total_spent: totalActual,
    remaining_budget: remaining,
    remaining: remaining,
    utilization_percentage: utilization,
    over_budget: remaining < 0,
    is_over_budget: remaining < 0,
    category_breakdown: breakdownWithMap
  };
}

export function getDemoGuestSummary() {
  const guests = getDemoGuests();
  const confirmed = guests.filter(g => g.rsvp_status === 'confirmed').length;
  const pending = guests.filter(g => g.rsvp_status === 'pending').length;
  const declined = guests.filter(g => g.rsvp_status === 'declined').length;
  const maybe = guests.filter(g => g.rsvp_status === 'maybe').length;
  const plusOneCount = guests.filter(g => g.plus_one || Number(g.party_size) > 1).length;
  const totalHeadcount = guests.reduce((sum, g) => {
    if (g.rsvp_status === 'declined') return sum;
    if (g.party_size) return sum + Number(g.party_size);
    return sum + (g.plus_one ? 2 : 1);
  }, 0);

  return {
    event_id: 'demo-showcase-wedding',
    total_invitations: guests.length,
    total_attending_headcount: totalHeadcount,
    total_attending_guests: totalHeadcount,
    confirmed_count: confirmed,
    confirmed: confirmed,
    pending_count: pending,
    pending: pending,
    declined_count: declined,
    declined: declined,
    maybe_count: maybe,
    plus_one_count: plusOneCount
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
