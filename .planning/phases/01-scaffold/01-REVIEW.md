---
phase: 01-scaffold
reviewed: 2026-04-07T00:00:00Z
depth: standard
files_reviewed: 13
files_reviewed_list:
  - package.json
  - vite.config.js
  - .gitignore
  - server/schema.sql
  - server/db.js
  - server/seed.js
  - server/index.js
  - server/routes.js
  - index.html
  - src/main.jsx
  - src/App.jsx
  - src/components/Layout.jsx
  - src/pages/Home.jsx
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-07
**Depth:** standard
**Files Reviewed:** 13
**Status:** issues_found

## Summary

Scaffold is clean and well-structured for a local-only hobby app. The Express + better-sqlite3 + Vite + React wiring is correct, foreign keys are enabled, WAL mode is set, and the schema uses appropriate constraints. No security vulnerabilities are present given the local-only context.

Three warnings stand out: the seed script runs destructive DELETEs outside a transaction (partial data wipe if a statement fails), the `tenants`/`mortgages` tables lack cascade or restrict rules on their foreign keys (future DELETE routes will hit confusing FK constraint errors), and `server/index.js` imports `db` as a named binding when only the side-effect is needed. Four info items cover minor dead code and style issues.

---

## Warnings

### WR-01: Seed script DELETEs and INSERTs run outside a transaction

**File:** `server/seed.js:4-39`
**Issue:** Each `db.exec('DELETE FROM ...')` and each `insertX.run(...)` is auto-committed individually. If any statement throws mid-way (e.g., a FK violation on DELETE ordering), the database is left in a partially cleared or partially seeded state. The DELETE order (mortgage_payments → rent_payments → mortgages → tenants → properties) is currently correct for the FK graph, but this is fragile and there is no rollback safety net.
**Fix:** Wrap the entire seed operation in a single transaction:
```js
const runSeed = db.transaction(() => {
  db.exec('DELETE FROM mortgage_payments');
  db.exec('DELETE FROM rent_payments');
  db.exec('DELETE FROM mortgages');
  db.exec('DELETE FROM tenants');
  db.exec('DELETE FROM properties');

  // ... all inserts ...
});

runSeed();
```

---

### WR-02: Foreign keys on `tenants` and `mortgages` have no cascade/restrict action defined

**File:** `server/schema.sql:14` and `server/schema.sql:24`
**Issue:** `FOREIGN KEY (property_id) REFERENCES properties(id)` has no `ON DELETE` clause. SQLite defaults to `NO ACTION`, which with `foreign_keys = ON` means attempting to delete a property that still has tenants or mortgages will raise a constraint error at runtime. This is not wrong today (no DELETE routes exist yet), but when property deletion is implemented in Phase 2, the API will return an opaque 500 unless the routes explicitly handle child records first. The same applies to `rent_payments` referencing `tenants` and `mortgage_payments` referencing `mortgages`.
**Fix:** Choose a deletion strategy now so future routes are built consistently. The safest choice for this app is `ON DELETE CASCADE` — deleting a property removes its tenants, mortgages, and all associated payments automatically:
```sql
-- In tenants
FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE

-- In mortgages
FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE

-- In rent_payments
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE

-- In mortgage_payments
FOREIGN KEY (mortgage_id) REFERENCES mortgages(id) ON DELETE CASCADE
```
If you prefer to require explicit cleanup instead, use `ON DELETE RESTRICT` and handle child deletion in route logic before deleting the parent.

---

### WR-03: `db` is imported as a named binding in `server/index.js` but never used

**File:** `server/index.js:3`
**Issue:** `import db from './db.js'` loads the database module for its side-effect (schema initialization) but the `db` binding itself is never referenced in this file. This is misleading — it looks like `db` will be used for queries in `index.js`, and a linter or future reader may delete the import thinking it is dead code, which would break schema initialization.
**Fix:** Either use a side-effect-only import to make the intent explicit, or add a brief comment:
```js
// Side-effect import: initializes schema and exports db singleton
import './db.js';
```
Or keep the named import but add a comment:
```js
import db from './db.js'; // imported for schema init side-effect; db instance used in routes via routes.js
```

---

## Info

### IN-01: `App.jsx` is a pure pass-through wrapper with no added value

**File:** `src/App.jsx:1-5`
**Issue:** `App` imports `Layout` and returns it unchanged. `main.jsx` could import `Layout` directly. The extra indirection adds a file without benefit at this stage.
**Fix:** Either delete `App.jsx` and update `main.jsx` to import `Layout` directly, or reserve `App.jsx` for future global context providers (e.g., a data-fetching context), which would justify its existence.

---

### IN-02: Redundant `*.db` rule in `.gitignore`

**File:** `.gitignore:4`
**Issue:** `data/` on line 3 already excludes the entire data directory (including `rental.db`). The `*.db` wildcard on line 4 is redundant. Not harmful, but creates the false impression that `.db` files could appear outside `data/`.
**Fix:** Remove the `*.db` line, or keep it intentionally if you ever plan to use SQLite files outside the `data/` directory.

---

### IN-03: `deadline_day` / `due_day` CHECK constraint allows day 31 for all months

**File:** `server/schema.sql:15` and `server/schema.sql:28`
**Issue:** `CHECK (deadline_day BETWEEN 1 AND 31)` allows values like 29, 30, or 31 regardless of the actual month. For February or 30-day months this produces incorrect "overdue" calculations if deadline logic is later computed by comparing the day number directly against the calendar. This is a data quality issue, not a DB crash.
**Fix:** The constraint itself is acceptable as a basic guard. Document the known limitation in a code comment so future payment-status logic accounts for it (e.g., clamp the deadline to the last day of the month before comparing):
```sql
-- deadline_day: 1–31; payment logic must clamp to last day of month for short months
deadline_day INTEGER NOT NULL CHECK (deadline_day BETWEEN 1 AND 31),
```

---

### IN-04: No error handling if `schema.sql` is missing or malformed

**File:** `server/db.js:24-25`
**Issue:** `readFileSync` and `db.exec(schema)` will throw an unhandled exception with a Node.js stack trace if `schema.sql` is missing or contains a syntax error. For a local dev tool this is acceptable, but the error message is opaque.
**Fix:** Optionally wrap with a try/catch to emit a clearer message:
```js
try {
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);
} catch (err) {
  console.error('Failed to initialize database schema:', err.message);
  process.exit(1);
}
```

---

_Reviewed: 2026-04-07_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
