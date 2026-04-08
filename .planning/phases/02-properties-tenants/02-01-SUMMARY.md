---
phase: 02-properties-tenants
plan: "01"
subsystem: backend-api
tags: [properties, crud, rest-api, sqlite, express]
dependency_graph:
  requires: [server/db.js, server/schema.sql]
  provides: [server/services/properties.js, server/routes/properties.js]
  affects: [server/routes.js]
tech_stack:
  added: []
  patterns: [service-layer, express-router, parameterized-sql, db-transaction]
key_files:
  created:
    - server/services/properties.js
    - server/routes/properties.js
  modified:
    - server/routes.js
decisions:
  - "Default export added to service module alongside named exports to satisfy both import styles"
  - "DELETE non-cascade path checks getDependentCounts before attempting delete (avoids FK error surfacing)"
metrics:
  duration_minutes: 3
  completed_date: "2026-04-08T05:11:50Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 1
---

# Phase 02 Plan 01: Properties REST API Summary

**One-liner:** Properties CRUD REST API with parameterized SQLite queries, cascade delete via db.transaction, and Express route handlers mounted at /api/properties.

## What Was Built

### server/services/properties.js

Service layer with six exported functions:

- `getAll()` — SELECT with correlated subquery returning tenant_count per property, ordered by id DESC
- `getById(id)` — SELECT single property with tenant_count subquery
- `create({ address, notes })` — INSERT then getById(lastInsertRowid) to return full object
- `update(id, { address, notes })` — UPDATE, returns undefined if no rows changed (id not found)
- `remove(id, cascade = false)` — Plain DELETE when cascade=false; wraps 5-step deletion in db.transaction when cascade=true (rent_payments → tenants → mortgage_payments → mortgages → properties)
- `getDependentCounts(id)` — Returns { tenants: N, mortgages: N } for pre-delete warning UI

All SQL uses `db.prepare()` with `?` placeholders — no string interpolation anywhere.

### server/routes/properties.js

Express Router with six endpoints:

| Method | Path | Behavior |
|--------|------|----------|
| GET | / | 200 JSON array |
| GET | /:id | 200 object / 400 invalid id / 404 not found |
| GET | /:id/dependents | 200 { tenants, mortgages } counts |
| POST | / | 201 created / 400 if address missing or empty |
| PUT | /:id | 200 updated / 400 bad input / 404 not found |
| DELETE | /:id | 200 deleted / 404 not found / 409 if dependents (no confirm) |

DELETE logic: checks getDependentCounts first; if dependents exist and `?confirm` is not `'true'`, returns 409 with counts. With `?confirm=true`, calls remove(id, true) for atomic cascade.

All handlers wrapped in try/catch with 500 fallback — no stack traces or SQL details in error responses (T-02-04 mitigated).

### server/routes.js (modified)

Added `import propertiesRouter` and `router.use('/properties', propertiesRouter)` after the health check route. Placeholder comments for future routes preserved.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added default export to service module**
- **Found during:** Task 1 verification
- **Issue:** Plan's verification script uses `import svc from './server/services/properties.js'` (default import), but service only had named exports. Node threw `SyntaxError: does not provide an export named 'default'`.
- **Fix:** Added `export default { getAll, getById, create, update, remove, getDependentCounts }` at end of file. Named exports retained for use by route handlers via `import * as propertiesService`.
- **Files modified:** server/services/properties.js
- **Commit:** cc42461

**2. [Rule 2 - Missing critical functionality] Pre-flight dependent check in DELETE handler**
- **Found during:** Task 2 implementation review
- **Issue:** Plan described catching `SQLITE_CONSTRAINT` error from non-cascade delete, but with foreign_keys=ON the error code is `SQLITE_CONSTRAINT_FOREIGNKEY`. Rather than relying on catching a specific error code, the handler now calls getDependentCounts first and returns 409 proactively — cleaner, no error-code dependency.
- **Fix:** Non-cascade DELETE path checks counts before attempting delete; FK error catch retained as safety net.
- **Files modified:** server/routes/properties.js
- **Commit:** 8c445ac

## Threat Surface Scan

All threats from the plan's threat model are mitigated:

| Threat | Mitigation Status |
|--------|-------------------|
| T-02-01 SQL Injection | All SQL parameterized with db.prepare() + ? placeholders |
| T-02-02 Type Coercion | parseInt(id, 10) + isNaN check returns 400 before any DB call |
| T-02-03 DoS | Accepted — local single-user app |
| T-02-04 Info Disclosure | catch blocks return generic "Internal server error" only |
| T-02-05 Cascade Elevation | Requires explicit ?confirm=true; cascade in db.transaction |

No new threat surface introduced beyond what the plan modeled.

## Self-Check: PASSED

| Item | Status |
|------|--------|
| server/services/properties.js | FOUND |
| server/routes/properties.js | FOUND |
| server/routes.js | FOUND |
| commit cc42461 | FOUND |
| commit 8c445ac | FOUND |
