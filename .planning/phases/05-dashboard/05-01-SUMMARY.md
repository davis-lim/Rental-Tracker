---
phase: 05-dashboard
plan: "01"
subsystem: backend/api
tags: [dashboard, api, sqlite, express]
dependency_graph:
  requires: [rentPayments service, mortgagePayments service, tenants schema, mortgages schema]
  provides: [GET /api/dashboard/summary, GET /api/dashboard/upcoming, GET /api/dashboard/overdue]
  affects: [05-02-PLAN (UI consumes these endpoints)]
tech_stack:
  added: []
  patterns: [sync better-sqlite3 queries, end-of-month date clamping, local date arithmetic for day offsets]
key_files:
  created:
    - server/services/dashboard.js
    - server/routes/dashboard.js
  modified:
    - server/routes.js
decisions:
  - "computeDueDate copied verbatim from rentPayments.js (not imported cross-service) to keep service layer isolated"
  - "addDays() helper uses local Date constructor (not toISOString) to avoid UTC timezone offset drift"
  - "Input validation (regex) on month/today query params per T-05-01 threat mitigation; invalid values fall back to server-computed defaults"
metrics:
  duration_seconds: 137
  completed_date: "2026-04-09"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 1
---

# Phase 05 Plan 01: Dashboard API Endpoints Summary

**One-liner:** Three dashboard GET endpoints backed by pure sync better-sqlite3 queries returning tenant/mortgage status, upcoming dues (7-day window with month-boundary crossing), and overdue items with grace-period-aware deadlines.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Dashboard service (getSummary, getUpcoming, getOverdue) | d92ffee | server/services/dashboard.js |
| 2 | Dashboard routes + mount | f2bc3a6 | server/routes/dashboard.js, server/routes.js, server/services/dashboard.js (bug fix) |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed UTC timezone drift in date arithmetic**
- **Found during:** Task 2 verification
- **Issue:** Using `new Date(dateStr + 'T00:00:00').toISOString().slice(0, 10)` to add days produces the wrong date in non-UTC timezones (e.g., UTC+10 shifts midnight to previous UTC day). Affected `grace_deadline` in `getOverdue` and `windowEnd` in `getUpcoming`.
- **Fix:** Introduced `addDays(dateStr, days)` helper that constructs dates via `new Date(y, m-1, d + days)` (local calendar) and formats with string padding — no `toISOString()` involved.
- **Files modified:** server/services/dashboard.js
- **Commit:** f2bc3a6

### Security Additions (Rule 2 — T-05-01 mitigation)

Input validation added to all three route handlers: `month` must match `/^\d{4}-\d{2}$/` and `today` must match `/^\d{4}-\d{2}-\d{2}$/`. Invalid values silently fall back to server-computed current month/date, preventing SQL injection via date string parameters.

## Verification Results

All three endpoints confirmed working with live server:

- `GET /api/dashboard/summary?month=2026-04` — returns `{ tenants: [...], mortgages: [...] }` with `status` field on each item
- `GET /api/dashboard/upcoming?month=2026-04&today=2026-04-08` — returns array (empty when no items in 7-day window)
- `GET /api/dashboard/overdue?month=2026-04&today=2026-04-08` — returns array with grace-period-aware deadlines

## Known Stubs

None. All three functions query live SQLite data.

## Threat Flags

None. No new network endpoints beyond what was planned. All planned threat mitigations (T-05-01) applied.

## Self-Check: PASSED

- server/services/dashboard.js: FOUND
- server/routes/dashboard.js: FOUND
- server/routes.js (modified): FOUND
- Commit d92ffee: FOUND
- Commit f2bc3a6: FOUND
