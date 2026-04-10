---
phase: 03-mortgages
plan: "01"
subsystem: backend
tags: [api, rest, mortgages, sqlite, express]
dependency_graph:
  requires: [server/db.js, server/schema.sql, server/routes.js]
  provides: [GET /api/mortgages, POST /api/mortgages, PUT /api/mortgages/:id, DELETE /api/mortgages/:id, GET /api/mortgages/:id/dependents]
  affects: [server/routes.js]
tech_stack:
  added: []
  patterns: [better-sqlite3 prepared statements, Express Router, db.transaction for cascade delete, named+default exports]
key_files:
  created:
    - server/services/mortgages.js
    - server/routes/mortgages.js
  modified:
    - server/routes.js
decisions:
  - "Mirrored properties.js pattern exactly: named exports + default object export"
  - "getDependentCounts returns only mortgage_payments (mortgages have one dependent type)"
  - "Cascade delete uses db.transaction: DELETE mortgage_payments then DELETE mortgages"
metrics:
  duration_minutes: 15
  completed_date: "2026-04-08"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 1
requirements: [MORT-01, MORT-02, MORT-03]
---

# Phase 03 Plan 01: Mortgages REST API Summary

**One-liner:** Full mortgages CRUD REST API with JOIN to property_address, cascade-safe DELETE via db.transaction, and input validation for all four fields.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Mortgages service layer | fbc63ad | server/services/mortgages.js |
| 2 | Mortgages route handlers + mount | 1f77eb1 | server/routes/mortgages.js, server/routes.js |

## What Was Built

**server/services/mortgages.js** — Service layer with six exports:
- `getAll()` — SELECT with JOIN on properties to include `property_address`, ordered by id DESC
- `getById(id)` — Same JOIN, single row by id
- `create({ property_id, lender, due_day, amount })` — INSERT + returns getById(lastInsertRowid)
- `update(id, fields)` — UPDATE, returns undefined when changes === 0 (404 signal)
- `remove(id, cascade=false)` — Plain DELETE or db.transaction (payments then mortgage)
- `getDependentCounts(id)` — Returns `{ mortgage_payments: N }` via COUNT(*)

**server/routes/mortgages.js** — Express Router with six handlers:
- `GET /` — 200 array
- `GET /:id` — 200 object / 400 invalid id / 404 not found
- `GET /:id/dependents` — 200 `{ mortgage_payments: N }`
- `POST /` — 201 created / 400 validation failure
- `PUT /:id` — 200 updated / 400 bad input / 404 not found
- `DELETE /:id` — 200 deleted / 404 / 409 if dependents without `?confirm=true`

**server/routes.js** — Added `import mortgagesRouter` and `router.use('/mortgages', mortgagesRouter)`.

## Validation Applied (POST + PUT)

- `property_id`: parseInt, isNaN check, must be > 0
- `lender`: typeof string, trim(), non-empty
- `due_day`: parseInt, range 1–31 inclusive
- `amount`: Number(), must be > 0

## Deviations from Plan

None — plan executed exactly as written.

## Threat Model Coverage

All six STRIDE threats addressed as required:
- T-03-01 (Spoofing): All four fields validated in route handlers before any DB call
- T-03-02 (Tampering): All SQL uses `db.prepare()` with `?` placeholders — zero string interpolation
- T-03-03 (Repudiation): Cascade requires `?confirm=true`; wrapped in `db.transaction` for atomicity
- T-03-04 (Information Disclosure): All catch blocks return only `{ error: 'Internal server error' }`
- T-03-05 (DoS): Accepted — local single-user app, no pagination needed
- T-03-06 (EoP): `due_day` validated 1–31 in route handler AND schema CHECK enforces at DB level

## Known Stubs

None.

## Threat Flags

None — no new security surface beyond what the plan's threat model covers.

## Self-Check: PASSED

- server/services/mortgages.js: FOUND
- server/routes/mortgages.js: FOUND
- server/routes.js (updated): FOUND
- Commit fbc63ad: FOUND
- Commit 1f77eb1: FOUND
