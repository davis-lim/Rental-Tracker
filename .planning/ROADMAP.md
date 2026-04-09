# Roadmap: Dad's Rental Tracker

## Overview

Six phases take this from an empty directory to a fully working local rental tracker. Phase 1 lays the technical foundation and scaffold. Phases 2–3 build the core data layer (properties, tenants, mortgages) with full CRUD. Phase 4 implements payment recording with the on-time/late deadline logic. Phase 5 delivers the dashboard and payment entry screens. Phase 6 adds history views, stats, CSV export, and the README.

## Phases

- [x] **Phase 1: Scaffold** — Project structure, dev environment, DB init, and app shell (completed 2026-04-07)
- [ ] **Phase 2: Properties & Tenants** — Full CRUD for properties and tenants with API + UI
- [x] **Phase 3: Mortgages** — Full CRUD for mortgages (lender, property, due date, amount) (completed 2026-04-08)
- [ ] **Phase 4: Payment Recording** — Rent and mortgage payment entry with on-time/late logic
- [ ] **Phase 5: Dashboard** — Current month overview, upcoming dues, overdue list
- [ ] **Phase 6: History, Stats & Export** — Per-tenant/per-property history, stats, CSV export, README

## Phase Details

### Phase 1: Scaffold
**Goal**: Working dev environment with project structure, Express + Vite + React wired together, SQLite DB initialized with full schema (all tables), and a blank shell app that starts with `npm start`.
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03
**Success Criteria** (what must be TRUE):
  1. `npm start` starts both the API server and the Vite dev server without errors
  2. SQLite DB file is created at `./data/rental.db` on first run
  3. All DB tables exist in the schema (properties, tenants, mortgages, rent_payments, mortgage_payments)
  4. A placeholder home page renders in the browser with navigation shell

Plans:
- [x] 01-01: Initialize Node.js project, install dependencies (Express, better-sqlite3, Vite, React, React Router, concurrently), configure scripts
- [x] 01-02: Define and create SQLite schema (all tables + indexes), DB init module, seed utility
- [x] 01-03: Wire Express API skeleton (routes file, CORS, JSON middleware) + React app shell with layout/nav

### Phase 2: Properties & Tenants
**Goal**: User can fully manage properties and tenants — create, view, edit, delete — via the UI. Data persists in SQLite.
**Depends on**: Phase 1
**Requirements**: PROP-01, PROP-02, PROP-03, PROP-04, TENT-01, TENT-02, TENT-03, TENT-04, TENT-05
**Plans:** 4 plans
**Success Criteria** (what must be TRUE):
  1. User can create a property with address and notes; it appears in the properties list
  2. User can edit and delete a property
  3. User can add a tenant to a property with name, rent amount, deadline day, grace period, and optional lease dates
  4. User can edit and delete a tenant
  5. Deleting a property or tenant with dependents shows a warning before proceeding

Plans:
- [ ] 02-01-PLAN.md — Properties REST API: service layer + Express routes for full CRUD with cascade delete
- [ ] 02-02-PLAN.md — Properties UI: shadcn init, 2-column card grid, add/edit modal dialog, delete confirmation
- [ ] 02-03-PLAN.md — Tenants REST API: service layer + Express routes for full CRUD with validation
- [ ] 02-04-PLAN.md — Tenants UI: property detail page with tenant table, add/edit modal, global /tenants page

### Phase 3: Mortgages
**Goal**: User can fully manage mortgages — create, view, edit, delete — linking each to a property.
**Depends on**: Phase 2
**Requirements**: MORT-01, MORT-02, MORT-03
**Success Criteria** (what must be TRUE):
  1. User can create a mortgage with lender, property, due day-of-month, and amount; it appears in the mortgages list
  2. User can edit and delete a mortgage
  3. Mortgage list shows linked property name

Plans:
- [x] 03-01: Mortgages REST API (GET all, GET one, POST, PUT, DELETE) + service layer
- [x] 03-02: Mortgages UI (list page, add/edit form, delete confirmation)

### Phase 4: Payment Recording
**Goal**: User can record rent and mortgage payments for any month. The app correctly computes whether each payment is on time or late based on the deadline + grace period. Duplicate-entry guard works.
**Depends on**: Phase 3
**Requirements**: RENT-01, RENT-02, RENT-03, RENT-04, RENT-05, RENT-06, MORT-04, MORT-05, MORT-06
**Plans:** 4 plans
**Success Criteria** (what must be TRUE):
  1. User can open the rent payment entry screen, select property → tenant → month, enter payment date and amount, and save
  2. Saved rent record shows correct on-time/late status (paid_date ≤ due_date + grace_period is on-time)
  3. Attempting to save a duplicate tenant+month record prompts for confirmation before overwriting
  4. User can record a mortgage payment for a given month with the same on-time logic
  5. User can clear/unmark a payment record

Plans:
- [ ] 04-01-PLAN.md — Rent payment API: service layer (computeDueDate, computeIsOnTime, upsert) + Express routes (GET by tenant/month, POST upsert, DELETE)
- [ ] 04-02-PLAN.md — Rent payment entry UI: property/tenant/month selectors, RentPaymentFormDialog with inline duplicate guard and clear button
- [ ] 04-03-PLAN.md — Mortgage payment API: service layer (on-time with no grace period) + Express routes (GET by mortgage/month, POST upsert, DELETE)
- [ ] 04-04-PLAN.md — Mortgage payment entry UI: mortgage/month selectors, MortgagePaymentFormDialog with inline duplicate guard and clear button

### Phase 5: Dashboard
**Goal**: Home dashboard shows the full current-month picture: all tenants with paid/unpaid/late status, all mortgages with paid/unpaid/late status, an upcoming-dues list (next 7 days), and an overdue list.
**Depends on**: Phase 4
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04
**Plans:** 1/2 plans executed
**Success Criteria** (what must be TRUE):
  1. Dashboard shows all tenants for the current month with their rent status (paid on-time / paid late / unpaid)
  2. Dashboard shows all mortgages for the current month with their payment status
  3. Upcoming list shows rent and mortgage due within the next 7 days (unpaid only)
  4. Overdue list shows rent and mortgage past due and unpaid

Plans:
- [x] 05-01-PLAN.md — Dashboard API endpoints (getSummary, getUpcoming, getOverdue service + three GET routes)
- [ ] 05-02-PLAN.md — Dashboard UI (tenant/mortgage status tables, upcoming dues, overdue sections in Home.jsx)

### Phase 6: History, Stats & Export
**Goal**: Users can review full payment history per tenant and per property, see on-time rates, export to CSV, and the README explains how to run and configure the app.
**Depends on**: Phase 5
**Requirements**: HIST-01, HIST-02, HIST-03, HIST-04, EXPO-01, EXPO-02, DATA-04
**Success Criteria** (what must be TRUE):
  1. Tenant history page shows all recorded months with date, amount, and on-time status, plus overall on-time rate %
  2. Property history page shows on-time rate across all tenants
  3. Mortgage history page shows all months with payment date, amount, and on-time status
  4. Export buttons download valid CSV files for rent history (global or per-property) and mortgage history
  5. README exists at project root with run instructions, DB file location, and example data format

Plans:
- [ ] 06-01: History API endpoints (per-tenant, per-property, per-mortgage) + stats computation
- [ ] 06-02: History UI pages (tenant history, property history, mortgage history)
- [ ] 06-03: CSV export API endpoints + export buttons in UI
- [ ] 06-04: Write README.md with run instructions, DB path, example data, and configuration notes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Scaffold | 3/3 | Complete   | 2026-04-07 |
| 2. Properties & Tenants | 0/4 | Not started | - |
| 3. Mortgages | 2/2 | Complete   | 2026-04-08 |
| 4. Payment Recording | 0/4 | Not started | - |
| 5. Dashboard | 1/2 | In Progress|  |
| 6. History, Stats & Export | 0/4 | Not started | - |
