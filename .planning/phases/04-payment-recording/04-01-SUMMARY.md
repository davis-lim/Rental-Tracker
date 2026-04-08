---
phase: "04-payment-recording"
plan: "01"
subsystem: "rent-payments-api"
tags: [backend, api, sqlite, better-sqlite3, express]
dependency_graph:
  requires: [tenants-api, properties-api]
  provides: [rent-payments-rest-api]
  affects: [04-02-rent-payment-ui]
tech_stack:
  added: []
  patterns: [named-exports-default-object, insert-or-replace-upsert, query-param-dispatch]
key_files:
  created:
    - server/services/rentPayments.js
    - server/routes/rentPayments.js
  modified:
    - server/routes.js
decisions:
  - "getOne added to service (not just in route) so route can stay thin and service owns all DB access"
  - "GET /exists route placed before /:id wildcard to avoid Express route shadowing"
  - "toISOString().slice(0,10) for grace deadline uses UTC; paired with T00:00:00 local construction to keep arithmetic consistent"
metrics:
  duration: "~10 minutes"
  completed_date: "2026-04-08"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 3
---

# Phase 04 Plan 01: Rent Payments REST API Summary

## One-liner

Rent payments REST API with INSERT OR REPLACE upsert and is_on_time computed from tenant deadline_day + grace_period_days at write time.

## What Was Built

A complete backend service and Express router for rent payment recording:

- `server/services/rentPayments.js`: Service layer with four named exports (`getByTenant`, `getByMonth`, `upsert`, `remove`) plus `getOne` helper for duplicate checks. Two internal pure helpers: `computeDueDate` (clamps deadline_day to end-of-month for Feb/short months) and `computeIsOnTime` (lexicographic YYYY-MM-DD comparison after adding grace days).
- `server/routes/rentPayments.js`: Express router with `GET /` (dispatches on `?tenant_id` or `?month`), `GET /exists` (duplicate guard), `POST /` (upsert with full validation), `DELETE /:id`. All catch blocks return only `{ error: 'Internal server error' }` — no stack traces or DB details leaked.
- `server/routes.js`: Added import and mount at `/rent-payments`; removed the placeholder comment.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Rent payments service layer with on-time logic | c90b03d | server/services/rentPayments.js |
| 2 | Rent payments route handlers and mount | b837dc4 | server/routes/rentPayments.js, server/routes.js |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Added `getOne` as a named service export**
- **Found during:** Task 2
- **Issue:** Plan suggested either importing db directly in the route or adding `getOne` to the service. Importing db directly in a route would violate the thin-route pattern used throughout this project.
- **Fix:** Added `getOne(tenantId, month)` as a named export on the service module and included it in the default export object.
- **Files modified:** server/services/rentPayments.js
- **Commit:** c90b03d

**2. [Rule 2 - Missing critical functionality] GET /exists mounted before wildcard /:id**
- **Found during:** Task 2
- **Issue:** Express route matching is order-dependent; if `/:id` had been registered first, `GET /exists` would match it with `req.params.id = 'exists'` instead of the exists handler.
- **Fix:** Registered `GET /exists` before `DELETE /:id` in the router file.
- **Files modified:** server/routes/rentPayments.js
- **Commit:** b837dc4

## Known Stubs

None — all functions are fully wired to the SQLite database via better-sqlite3 prepared statements.

## Threat Surface Scan

No new threat surface beyond what the plan's threat model covers. All mitigations applied:
- T-04-01: All four fields validated in POST handler before any DB call.
- T-04-02: Zero string interpolation in SQL; all values use `?` placeholders.
- T-04-04: All catch blocks return `{ error: 'Internal server error' }` only.
- T-04-06: Regex validation on month and paid_date before any Date construction.

## Self-Check: PASSED

- [x] server/services/rentPayments.js exists: FOUND
- [x] server/routes/rentPayments.js exists: FOUND
- [x] server/routes.js contains rentPaymentsRouter: FOUND
- [x] Commit c90b03d exists: FOUND
- [x] Commit b837dc4 exists: FOUND
