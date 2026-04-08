# Phase 2: Properties & Tenants - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Full CRUD for properties and tenants: REST API routes + service layer on the backend, and a React UI on the frontend. User can create, view, edit, and delete both entity types. Data persists in SQLite (schema already in place from Phase 1).

This phase does NOT cover payment recording, mortgages, or the dashboard — those are Phases 3–5.

</domain>

<decisions>
## Implementation Decisions

### Properties List Layout
- **D-01:** Properties page displays a **2-column card grid** (not a table, not a list).
- **D-02:** Each property card shows: **address + tenant count + action buttons (Edit, Delete)**. Notes field is not shown on the card face.

### Add/Edit Interaction
- **D-03:** Adding and editing a property uses a **modal dialog** (shadcn Dialog component). User stays on the properties page — no navigation.
- **D-04:** Adding and editing a tenant also uses a **modal dialog** — same pattern as properties for consistent UX.

### Tenant Display Within Property
- **D-05:** Clicking a property card **navigates to a /properties/:id detail page** that shows property info + tenant list below. No accordion/expand inline on the properties page.
- **D-06:** Tenant list on the property detail page is a **table** with columns: Name, Rent, Deadline day, Grace period, Actions (Edit | Delete per row).
- **D-07:** The **/tenants nav link is kept** and routes to a global tenants page that shows all tenants across all properties, including a Property Name column. This is read-only overview (add/edit/delete still happens via the property detail page).

### Delete / Cascade Warning
- **Claude's Discretion:** Show a confirmation dialog before delete. If the property/tenant has dependents (tenants for a property, payment records for a tenant), display a count in the warning ("This property has 2 tenants. Deleting it will also remove them."). The user must confirm to proceed.

### API / Service Layer Structure
- **Claude's Discretion:** Separate service modules per entity (e.g., `server/services/properties.js`, `server/services/tenants.js`) to keep route handlers thin. Route files in `server/routes/` directory.

### shadcn/ui Initialization
- **Claude's Discretion:** Initialize shadcn at the start of Phase 2 execution via `npx shadcn@latest init` (zinc preset, as specified in UI-SPEC). Install components as needed (Card, Dialog, Button, Table, Badge).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema
- `server/schema.sql` — Full SQLite schema: properties and tenants table definitions, foreign keys, indexes

### UI Design Contract
- `.planning/phases/02-properties-tenants/02-UI-SPEC.md` — Spacing scale, typography, shadcn zinc color roles, component usage rules. All UI work in this phase must comply with this spec.

### Requirements
- `.planning/REQUIREMENTS.md` §Properties (PROP-01..04) and §Tenants (TENT-01..05) — acceptance criteria for all CRUD operations

### Project Constraints
- `.planning/PROJECT.md` — Local-only, single user, minimize dependencies, keep it simple

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/Layout.jsx`: Nav already has Properties, Tenants, Mortgages, Payments, Dashboard links. Phase 2 should wire `/properties` and `/tenants` routes in the React Router config.
- `server/schema.sql`: `properties` and `tenants` tables fully defined — Phase 2 reads/writes these directly, no schema changes needed.
- `server/routes.js`: Placeholder comments for `/properties` and `/tenants` routes already present. Replace inline comments with actual route imports.

### Established Patterns
- Inline styles on existing components (Layout.jsx uses inline style objects) — Phase 2 replaces this pattern with shadcn/ui components and Tailwind classes.
- Express + better-sqlite3: synchronous DB access (`db.prepare(...).get()`, `.all()`, `.run()`). New service functions should follow the same sync pattern.
- API prefix: all routes live under `/api` (e.g., `/api/properties`).

### Integration Points
- `server/index.js`: Import new route files and mount under `/api` (currently only `router` from routes.js is mounted).
- React Router config (in `src/main.jsx` or `App.jsx`): Add routes for `/properties`, `/properties/:id`, `/tenants`.

</code_context>

<specifics>
## Specific Ideas

- Properties page: 2-column card grid with shadcn Card component. Cards show address (heading), tenant count badge, Edit and Delete buttons.
- Property detail page (/properties/:id): property heading + notes (if any) at top, then "Tenants" section heading with "Add Tenant" button, then a shadcn Table of tenants.
- Global /tenants page: shadcn Table with columns — Tenant Name, Property, Rent Amount, Deadline Day, Grace Period, Actions.
- Delete confirmation: shadcn AlertDialog with specific dependent counts in the message body.
- Modal for add/edit: shadcn Dialog with a form inside. Form fields use shadcn Input, Label, and Select where appropriate.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-properties-tenants*
*Context gathered: 2026-04-08*
