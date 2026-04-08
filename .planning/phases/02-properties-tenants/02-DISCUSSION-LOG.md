# Phase 2: Properties & Tenants - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-08
**Phase:** 02-properties-tenants
**Areas discussed:** Properties list layout, Add/Edit interaction, Tenant display within property

---

## Properties List Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Table | Rows with columns: Address, Notes, # Tenants, actions | |
| Card grid | One card per property, visual layout | ✓ |
| Simple list | Plain rows, no columns | |

**User's choice:** Card grid

| Option | Description | Selected |
|--------|-------------|----------|
| Address + tenant count + action buttons | Compact and actionable | ✓ |
| Address + notes + tenant count + actions | Shows notes on card face | |
| Just address + actions | Minimal | |

**User's choice:** Address + tenant count + action buttons (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| 2-column grid | Good balance for a few properties | ✓ |
| 3-column grid | More compact for 6+ properties | |
| Single column | One card per row, list-like | |

**User's choice:** 2-column grid (Recommended)

---

## Add/Edit Interaction

| Option | Description | Selected |
|--------|-------------|----------|
| Modal dialog | Dialog opens with form, stays on properties page | ✓ |
| Inline form below the list | Form expands below cards | |
| Separate form page | Navigate to /properties/new or /properties/:id/edit | |

**User's choice:** Modal dialog (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — same modal pattern for tenants | Consistent UX | ✓ |
| No — tenant form is more complex, use a separate page | More room for fields | |

**User's choice:** Yes — same modal pattern for both (Recommended)

---

## Tenant Display Within Property

| Option | Description | Selected |
|--------|-------------|----------|
| Property detail page | Navigate to /properties/:id, shows tenants below | ✓ |
| Expand/accordion on properties page | Tenants expand inline, no navigation | |
| Separate /tenants page with property filter | Global tenant page filtered by property | |

**User's choice:** Property detail page (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Table: Name, Rent, Deadline day, Grace period, Actions | Compact rows with all key fields | ✓ |
| Cards: one card per tenant | Consistent with property card style | |
| Simple list: name + rent + actions only | Minimal | |

**User's choice:** Table (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Remove /tenants nav link | Tenants accessed only via property pages | |
| Keep /tenants — shows all tenants with property name | Global overview across all properties | ✓ |

**User's choice:** Keep /tenants nav link — global tenants table with property name column

---
