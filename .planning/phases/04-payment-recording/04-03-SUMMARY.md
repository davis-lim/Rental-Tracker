---
phase: 04-payment-recording
plan: "03"
subsystem: backend
tags: [api, mortgage-payments, sqlite, express]
dependency_graph:
  requires: [04-01]
  provides: [mortgage-payments-api]
  affects: [04-04]
tech_stack:
  added: []
  patterns: [INSERT OR REPLACE upsert, lexicographic ISO date comparison, end-of-month clamping]
key_files:
  created:
    - server/services/mortgagePayments.js
    - server/routes/mortgagePayments.js
  modified:
    - server/routes.js
decisions:
  - "No grace period for mortgages (MORT-05): is_on_time = paid_date <= due_date, pure lexicographic ISO string comparison"
  - "due_day clamped to end-of-month using new Date(y, m, 0).getDate() to handle months shorter than due_day"
metrics:
  duration: "~10 minutes"
  completed: "2026-04-08"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 1
---

# Phase 04 Plan 03: Mortgage Payments API Summary

**One-liner:** Mortgage payments REST API with INSERT OR REPLACE upsert and no-grace-period on-time logic using lexicographic ISO date comparison.

## What Was Built

- `server/services/mortgagePayments.js` — service layer with four exports: `getByMortgage`, `getByMonth`, `upsert`, `remove`
- `server/routes/mortgagePayments.js` — Express router for `GET /`, `POST /`, `DELETE /:id`
- `server/routes.js` updated — mounts `mortgagePaymentsRouter` at `/mortgage-payments`, placeholder comment removed

## On-Time Logic (MORT-05)

No grace period for mortgages. The `computeIsOnTime` helper performs a pure lexicographic ISO 8601 string comparison:

```js
return paidDate <= dueDate ? 1 : 0;
```

Due date is computed from `due_day` + `month` with end-of-month clamping (handles February, 30-day months when `due_day` is 29–31).

## API Surface

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/mortgage-payments?mortgage_id=N | All payments for a mortgage, newest first |
| GET | /api/mortgage-payments?month=YYYY-MM | All payments for a month with lender and address JOINed |
| POST | /api/mortgage-payments | Upsert payment; validates all 4 fields; returns 201 with saved row |
| DELETE | /api/mortgage-payments/:id | Remove record; 404 if not found |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — all T-04-11 through T-04-16 mitigations applied as specified:
- All inputs validated with parseInt/regex/Number before any DB call
- All SQL uses `db.prepare` with `?` placeholders
- Catch blocks return only `{ error: 'Internal server error' }`
- paid_date validated with `/^\d{4}-\d{2}-\d{2}$/` before lexicographic comparison

## Self-Check

- [x] `server/services/mortgagePayments.js` exists with 4 named exports — verified via node `--input-type=module` test (PASS)
- [x] `server/routes/mortgagePayments.js` exists and loads without error — verified via dynamic import test (PASS)
- [x] `server/routes.js` contains `mortgagePaymentsRouter` mount — verified via file content check (PASS)
- [x] Task 1 commit: `02879fd`
- [x] Task 2 commit: `7179089`

## Self-Check: PASSED
