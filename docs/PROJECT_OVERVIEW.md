# Project Overview – Planora AI

## 1. Executive Summary

**Product Name:** Planora AI  
**Brand Tagline:** “From idea to flawlessly planned.”  
**Product Category:** AI-Powered Event-Planning & Event-Management SaaS  
**Target Market:** Individuals organizing personal milestone celebrations (weddings, birthdays, anniversaries) and event managers orchestrating multi-vendor corporate gatherings, conferences, and community festivals.

Planora AI transforms event planning by replacing fragmented spreadsheets, confusing text threads, and guesswork with an intelligent SaaS workspace. By uniting real AI generation (Groq LLaMA 3.1) with persistent, structured event workspaces, Planora AI delivers mathematical budget discipline, milestone countdowns, vendor contract tracking, guest RSVP management, and contextual AI co-planning.

## 2. Problems Solved

1. **Budget Runaways & Hidden Costs**: Most event organizers overspend by 20–40% due to unallocated contingency and lack of real-time category tracking. Planora AI enforces mathematical allocations, flags variances, and visualizes utilization in real time.
2. **Timing Confusion & Last-Minute Panic**: Organizers struggle to translate an event date into a structured roadmap. Planora AI generates T-minus milestone schedules and hour-by-hour event-day run sheets.
3. **Vendor Chaos**: Juggling disconnected vendor quotes and booking statuses leads to missed contracts. Planora AI provides an itemized vendor roster with contract tracking and quote comparisons.
4. **Attendance Unpredictability**: Headcount mistakes inflate catering costs. Planora AI tracks confirmed RSVPs, dietary requirements, and +1 attendees.

## 3. Core User Personas

| Persona | Primary Goal | Key Planora AI Features Used |
|---|---|---|
| **Individual Celebration Host** (e.g. Wedding Couple) | Plan a high-stakes personal milestone without stress or overspending. | Create Event Wizard, AI Event Studio, Budget Tracker, Guest RSVP list. |
| **Freelance Event Planner** | Juggle multiple concurrent client events with consistent execution. | Multi-event switching, Vendor Roster, Master Reports, PDF run-sheets. |
| **Corporate Event Lead** | Organize company summits, galas, and conferences with strict budget audits. | Expense approvals, CSV financial export, Timeline milestones. |

## 4. Scope & Non-Goals

### In Scope
- Full-stack SaaS application with Firebase Authentication.
- Asynchronous FastAPI Python backend with Pydantic validation.
- Responsive HTML5 / CSS3 / Vanilla JavaScript frontend with rich dark-mode aesthetics.
- Structured AI Event Plan generation via Groq with clear demonstration mode fallback.
- In-memory repository fallback for zero-configuration local development.
- Master report generation with CSV and print-ready PDF styling.

### Non-Goals for Initial Version
- Unverified mock vendor booking or online payment gateway checkout (preventing misleading commitments).
- Native automated SMS or WhatsApp dispatch without user-configured twilio/meta credentials.
- Multi-tenant enterprise organization role hierarchies (kept focused on individual accounts managing multiple events).

## 5. Major Architectural Decisions

- **Framework-Free Vanilla Frontend**: Eliminates complex client-side build tools, reducing bundle size to near zero and boosting load performance.
- **Asynchronous FastAPI Backend**: Provides type safety, automatic OpenAPI documentation, high concurrency, and clean separation of concerns.
- **Server-Side Security Enforcement**: Firebase ID tokens are verified server-side; client-provided user IDs in bodies are never trusted as proof of ownership.
- **Safe AI Grounding**: User inputs to the AI service are strictly sanitized, character-bounded, and validated against structured Pydantic models.
