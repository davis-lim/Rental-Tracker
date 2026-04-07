# Dad's Rental Tracker

## What This Is

A local-only hobby application for tracking rental properties, tenants, and payment timeliness. Helps a landlord record monthly rent and mortgage payments, see who paid on time vs. late, and review payment history — all stored in a local SQLite database with no cloud or accounts required.

## Core Value

Know instantly whether each tenant's rent and each mortgage payment was on time or late for any given month.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Manage multiple rental properties with address and notes
- [ ] Manage tenants per property with rent amount, deadline day-of-month, and optional grace period
- [ ] Record monthly rent payments per tenant (payment date, amount) with on-time/late flag derived from due date + grace period
- [ ] Manage mortgages (lender, property, monthly due date, amount) with payment recording and on-time/late flag
- [ ] Dashboard showing current month overview: tenants on-time vs late, mortgages on-time vs late
- [ ] Upcoming dues list (next 7 days) and overdue list on dashboard
- [ ] Full CRUD for properties and tenants
- [ ] Rent payment entry screen (select property → tenant → month → enter payment date + amount)
- [ ] Mortgage payment entry screen
- [ ] Payment history per tenant with monthly on-time rate
- [ ] Payment history per property with on-time rate across tenants
- [ ] CSV export for rent and mortgage history (per property or global)
- [ ] Duplicate payment guard: warn/confirm before overwriting same tenant+month record
- [ ] README with run instructions, DB file location, and example data format

### Out of Scope

- User accounts / authentication — local-only, single user
- Cloud sync or remote access — intentionally local
- Mobile app — desktop/web UI only
- Multi-user concurrency — single user hobby app
- Real-time notifications — simple dashboard is sufficient
- Automated rent collection or payment processing — tracking only

## Context

- Personal hobby project for tracking a small number of rental properties
- Owner manages properties themselves; no team collaboration needed
- SQLite is the right fit: zero-config, file-based, no server process
- Tech stack decision: **Electron + React + better-sqlite3** for a native desktop feel with local DB, OR **Node.js/Express + React + SQLite** as a local web app. Given "simplest approach that works well for local CRUD apps," a **local web app (Vite + React frontend, Express + better-sqlite3 backend)** launched via a single `npm start` is the recommended choice — simpler than Electron, no packaging needed, works in any browser.

## Constraints

- **Architecture**: Local-only — no external services, no network calls
- **Database**: SQLite file stored locally (configurable path, defaults to `./data/rental.db`)
- **Complexity**: Keep it simple — tables, forms, dashboards; no over-engineering
- **Dependencies**: Minimize; standard well-maintained packages only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Tech stack: Vite + React (frontend) + Express + better-sqlite3 (backend) | Simplest local CRUD stack — no Electron packaging complexity, runs in browser, single `npm start` | — Pending |
| Month format: YYYY-MM string | Simple, sortable, human-readable, no timezone ambiguity | — Pending |
| Due date logic: computed from deadline_day + month, with grace_period_days offset | User-configurable per tenant; on-time if paid_date ≤ due_date + grace_period_days | — Pending |
| Grace period default: 0 days | Strictest default; user can configure per tenant | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-07 after initialization*
