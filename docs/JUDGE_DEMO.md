# Judge Demo Mode Documentation – Planora AI

**Feature**: Zero-Friction Hackathon Judge Demo Sandbox  
**Production Demo URL**: `https://planora-ai-india.vercel.app/dashboard.html?demo=true`  
**Alternative Entry**: Click "Try Live Demo" or "Explore Judge Demo" on any marketing page  
**Authentication Requirement**: **NONE (Zero email, password, or sign-up needed)**  

---

## 1. Architectural Overview

The Judge Demo Mode was engineered to solve a common hackathon evaluation friction point: forcing judges to sign up, verify emails, or enter sensitive information merely to explore core SaaS features.

At the same time, Section 15 and 16 of the master specification dictate that a demo mode must **never**:
1. Bypass login to grant unrestricted access to real user accounts.
2. Disable authentication globally.
3. Expose Firebase Admin service credentials.
4. Allow anonymous visitors to read or overwrite arbitrary production Firestore records.

### The Isolated Sandbox Pattern:
Planora AI implements a **Client-Side Isolated Sandbox Architecture**:
- When activated (`?demo=true` or via localStorage flag `planora_judge_demo_active`), the frontend switches into Demo Sandbox Mode.
- All database and API operations in `js/api.js` are intercepted client-side and served from an isolated `localStorage` repository (`planora_judge_demo_data_v2`).
- Real Firebase Auth and production Firestore are completely bypassed.
- Judges can interactively add expenses, toggle task completion, update guests, test the offline AI Copilot, and inspect master exports with complete realism.
- All modifications are strictly scoped to the evaluator's local browser storage. No other judges or real users are affected.

---

## 2. Pre-Seeded Showcase Event: "Planora Showcase Wedding"

The demo environment is pre-seeded with a comprehensive, realistic luxury wedding celebration:

- **Event Name**: Planora Showcase Wedding
- **Type**: Wedding
- **Location**: The Oberoi Udaivilas, Udaipur, Rajasthan
- **Total Budget**: ₹1,200,000 (12 Lakhs INR)
- **Current Spend**: ₹785,000 across 6 categorized vendor payments
- **Guest Count**: 200 invited (142 confirmed attendees)
- **Status**: Active in Planning

### Seeded Workspace Components:
1. **Expenses (6 items)**:
   - *Palace Venue & Royal Feast (200 Guests)*: ₹650,000 (The Oberoi Udaivilas) [Paid]
   - *Cinematography & Candid Drone Photography*: ₹120,000 (Luminance Wedding Cinema) [Paid]
   - *Lakeside Mandap Floral Decor & Lighting*: ₹95,000 (Bloom & Petals Decorators) [Partial - ₹45,000 paid]
   - *Sangeet DJ, Line-Array Sound & Stage Lights*: ₹45,000 (SoundWave Pro Productions) [Pending]
   - *Royal Letterpress Gold Foil Invitations*: ₹25,000 (Royal Heritage Prints) [Paid]
   - *Handcrafted Blue Pottery Welcome Favors*: ₹30,000 (Jaipur Blue Craft Co.) [Partial - ₹15,000 paid]
2. **Tasks (6 prioritized items)**:
   - High, Critical, and Medium priority milestones spanning Catering menu tasting, Mandap 3D render approvals, Sangeet DJ track curation, WhatsApp RSVPs, Soundcheck generator redundancy, and Welcome hampers.
3. **Vendors (4 confirmed contracts)**:
   - Full vendor directory with contact persons, phone numbers, quotes, and contract status.
4. **Guests (6 sample attendees)**:
   - Clearly labeled fictional attendees (`Sample Demo Guest`) with RSVP statuses, party sizes, dietary tags (Vegetarian, Jain Vegetarian, Vegan, Gluten-Free), and table seating assignments.
5. **Timeline Run-Sheet (5 milestones)**:
   - 10:00 AM Vendor Setup & Soundcheck
   - 04:00 PM Lakefront Guest Arrival & High-Tea
   - 05:30 PM Sunset Mandap Ceremony (Varmala & Pheras)
   - 07:30 PM Royal Dinner Feast & Live Music
   - 09:30 PM Cake Cutting & Sangeet Dance Floor
6. **Sample AI Master Plan**:
   - Complete structured AI blueprint with percentage budget distribution, milestone roadmap, hourly run-sheet, and 4 actionable recommendations.
7. **Offline Demo AI Copilot**:
   - Responsive contextual chat engine grounded in the Showcase Wedding event that answers queries regarding budget health, dietary requirements, and timeline sequencing with zero API quota dependencies.

---

## 3. Judge Evaluation Walkthrough

Follow these simple steps to evaluate Planora AI in under 3 minutes:

1. **Enter Demo**:
   Visit [https://planora-ai-india.vercel.app/](https://planora-ai-india.vercel.app/) and click **"Try Live Demo"** in the top navigation or hero section.
2. **Inspect Banner & Badges**:
   Note the persistent purple **JUDGE DEMO MODE** banner and the **DEMO SANDBOX** badge in the top navigation bar.
3. **Explore the Dashboard (`dashboard.html`)**:
   Review the KPI summary cards: Budget Spent (₹785,000 / ₹1,200,000), Task Progress, Confirmed Guests (142), and Upcoming Milestones.
4. **Test the Budget Studio (`budget.html`)**:
   Inspect the Chart.js spending breakdown donut chart. Try adding a new sample expense (e.g., "Fireworks Display - ₹20,000"). Observe real-time budget re-calculation!
5. **Test Task Management (`tasks.html`)**:
   Filter tasks by High priority or toggle a task to "Completed".
6. **Test Guest Management (`guests.html`)**:
   Review dietary needs (Jain Vegetarian, Vegan) and table assignments.
7. **Test AI Copilot (`copilot.html`)**:
   Ask: *"What is my current budget status?"* or *"Which guests have dietary preferences?"* and observe grounded responses.
8. **Test Reset & Exit**:
   Click **"Reset Demo Data"** to instantly revert all changes to the original showcase wedding, or click **"Exit Demo"** to return to the public marketing site.
