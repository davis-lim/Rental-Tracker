---
phase: 02-properties-tenants
plan: "03"
subsystem: backend-api
tags: [tenants, crud, rest-api, sqlite, express]
dependency_graph:
  requires: [server/db.js, server/schema.sql, server/services/properties.js, server/routes/properties.js]
  provides: [server/services/tenants.js, server/routes/tenants.js]
  affects: [server/routes.js]
tech_stack:
  added: []
  patterns: [service-layer, express-router, parameterized-sql, db-transaction, fk-validation]
key_files:
  created:
    - server/services/tenants.js
    - server/routes/tenants.js
  modified:
    - server/routes.js
decisions:
  - "deadline_day validated as 1-28 in route handler (not 1-31 per schema) to match UI-SPEC Select options"
  - "Non-cascade DELETE pre-checks getDependentCounts before attempting delete, returning 409 proactively rather than catching FK errors"
  - "Default export added to service module alongside named exports for compatibility with both import styles"
metrics:
  duration_minutes: 2
  completed_date: "2026-04-08T05:20:16Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 1
---

# Phase 02 Plan 03: Tenants REST API Summary

**One-liner:** Tenants CRUD REST API with property-scoped and global views, parameterized SQLite queries, cascade delete via db.transaction, and property FK validation on create — mounted at /api/tenants.

## What Was Built

### server/services/tenants.js

Service layer with seven exported functions:

- `getByProperty(propertyId)` — SELECT tenants for a single property ordered by name ASC
- `getAll()` — SELECT all tenants with JOIN to properties for property_address, ordered by address then name
- `getById(id)` — SELECT single tenant with JOIN to properties for property_address
- `create({ property_id, name, rent_amount, deadline_day, grace_period_days, lease_start, lease_end })` — INSERT then getById(lastInsertRowid) to return full object with property_address
- `update(id, { name, rent_amount, deadline_day, grace_period_days, lease_start, lease_end })` — UPDATE (property_id not updatable), returns undefined if id not found (changes === 0)
- `remove(id, cascade = false)` — Plain DELETE when cascade=false; wraps rent_payments + tenants deletion in db.transaction when cascade=true
- `getDependentCounts(id)` — Returns `{ rent_payments: N }` for pre-delete warning UI

All SQL uses `db.prepare()` with `?` placeholders — no string interpolation anywhere (T-02-09 mitigated).

### server/routes/tenants.js

Express Router with seven endpoints:

| Method | Path | Behavior |
|--------|------|----------|
| GET | / | 200 JSON array with property_address in each row |
| GET | /by-property/:propertyId | 200 array for that property / 400 invalid id |
| GET | /:id | 200 object / 400 invalid id / 404 not found |
| GET | /:id/dependents | 200 { rent_payments: N } counts |
| POST | / | 201 created / 400 validation failure / 400 property not found |
| PUT | /:id | 200 updated / 400 bad input / 404 not found |
| DELETE | /:id | 200 deleted / 404 not found / 409 if dependents (no confirm) |

POST validation rules (all mitigating T-02-10):
- `property_id`: required, positive integer
- `name`: required, non-empty string after trim
- `rent_amount`: required, number > 0
- `deadline_day`: required, integer 1-28 (UI-SPEC constraint, stricter than schema's 1-31)
- `grace_period_days`: optional, defaults to 0, must be >= 0

POST also verifies property_id references an existing property via `propertiesService.getById` before INSERT (T-02-11 mitigated). DELETE pre-checks getDependentCounts and returns 409 proactively; cascade requires explicit `?confirm=true` (T-02-12 mitigated). All handlers return generic "Internal server error" on unexpected errors — no SQL or stack traces (T-02-13 mitigated).

### server/routes.js (modified)

Added `import tenantsRouter from './routes/tenants.js'` and `router.use('/tenants', tenantsRouter)` after the properties mount. Remaining placeholder comments updated for phases 3-4.

## Deviations from Plan

None — plan executed exactly as written. The pre-flight dependent check pattern (proactively calling getDependentCounts before non-cascade DELETE rather than catching FK error codes) was already established in plan 02-01 and reused here consistently.

## Threat Surface Scan

All threats from the plan's threat model are mitigated:

| Threat | Mitigation Status |
|--------|-------------------|
| T-02-09 SQL Injection | All SQL parameterized with db.prepare() + ? placeholders |
| T-02-10 Type Coercion | parseInt/Number with NaN/range checks; all URL params validated before DB calls |
| T-02-11 Invalid FK | property_id existence verified via propertiesService.getById before INSERT |
| T-02-12 Cascade Elevation | Cascade requires explicit ?confirm=true; atomic via db.transaction |
| T-02-13 Info Disclosure | catch blocks return generic "Internal server error" only |

No new threat surface introduced beyond what the plan modeled.

## Self-Check: PASSED

| Item | Status |
|------|--------|
| server/services/tenants.js | FOUND |
| server/routes/tenants.js | FOUND |
| server/routes.js | FOUND |
| commit 1c81b3a (Task 1) | FOUND |
| commit aa326a0 (Task 2) | FOUND |
