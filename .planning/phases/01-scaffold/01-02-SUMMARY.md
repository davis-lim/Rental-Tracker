---
phase: 01-scaffold
plan: "02"
subsystem: database-layer
tags: [sqlite, schema, better-sqlite3, data-layer]
dependency_graph:
  requires: [01-01]
  provides: [server/db.js, server/schema.sql, server/seed.js]
  affects: [all subsequent plans that add API endpoints]
tech_stack:
  added: []
  patterns: [better-sqlite3, WAL-mode, prepared-statements, ES-modules]
key_files:
  created:
    - server/schema.sql
    - server/db.js
    - server/seed.js
  modified:
    - package.json
decisions:
  - "month columns stored as TEXT (YYYY-MM) — sortable, human-readable, no timezone ambiguity (DATA-01)"
  - "due_date NOT stored on payment tables — computed at query time from deadline_day/due_day + month (DATA-02)"
  - "grace_period_days on tenants only — mortgages have no grace period per MORT-05"
  - "WAL mode enabled for better concurrent read performance"
  - "foreign_keys=ON pragma set at DB initialization to enforce referential integrity"
  - "UNIQUE(tenant_id, month) and UNIQUE(mortgage_id, month) constraints enforce RENT-05 duplicate guard at DB level"
metrics:
  duration: "~5 minutes"
  completed: "2026-04-07"
  tasks_completed: 2
  tasks_total: 2
  files_created: 3
  files_modified: 1
---

# Phase 01 Plan 02: Database Schema and Initialization Summary

**One-liner:** SQLite database layer with 5-table schema (properties, tenants, mortgages, rent_payments, mortgage_payments), auto-init on import via better-sqlite3, and a seed utility with sample data using YYYY-MM month strings.

## What Was Built

- `server/schema.sql` — Full DDL for all 5 tables with foreign keys, CHECK constraints, UNIQUE constraints on (tenant_id, month) and (mortgage_id, month), and 6 indexes for common query patterns. month columns are TEXT for YYYY-MM storage. No due_date column on payment tables — due dates are computed at query time.
- `server/db.js` — Database initialization module. Importing it creates `./data/rental.db` (creating the data/ directory if needed), enables WAL mode and foreign key enforcement via pragmas, and runs schema.sql to create all tables idempotently.
- `server/seed.js` — Utility script to clear and repopulate all tables with sample data. All SQL uses prepared statements (no string interpolation). Month values use YYYY-MM format strings.
- `package.json` — Added `"seed": "node server/seed.js"` npm script.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create schema.sql with all 5 tables | 11711ea | server/schema.sql |
| 2 | Create db.js initialization module and seed.js utility | 6df4963 | server/db.js, server/seed.js, package.json |

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| month as TEXT (YYYY-MM) | DATA-01 requirement; sortable lexicographically, no timezone ambiguity |
| No due_date on payment tables | DATA-02 requirement; due dates computed from deadline_day/due_day + month string at query time |
| grace_period_days on tenants, not mortgages | MORT-05 says mortgage on-time = paid_date <= due_date (no grace period) |
| WAL mode | Better concurrent read performance for a local web app where reads dominate |
| foreign_keys=ON | Enforces referential integrity — orphaned payment records would break app invariants |
| UNIQUE constraints at DB level | Belt-and-suspenders for RENT-05 duplicate guard; API layer also validates but DB is final guard |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- schema.sql verified: 5 CREATE TABLE statements, correct TEXT month columns, UNIQUE constraints, no due_date column, 6 indexes
- db.js import verified: all 5 tables created in data/rental.db, no errors
- DB file at ./data/rental.db: confirmed created on first import
- Threat model T-01-03 mitigated: seed.js uses prepared statements for all inserts

## Known Stubs

None.

## Threat Flags

None — data/ directory is already excluded from git via .gitignore (established in Plan 01-01, T-01-01 mitigation). All SQL in seed.js uses prepared statements (T-01-03 mitigation satisfied).

## Self-Check: PASSED

- server/schema.sql: FOUND
- server/db.js: FOUND
- server/seed.js: FOUND
- data/rental.db: FOUND (created on db.js import)
- Commit 11711ea: FOUND
- Commit 6df4963: FOUND
