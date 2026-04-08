---
phase: 04-payment-recording
plan: "04"
subsystem: frontend
tags: [ui, mortgage-payments, react, shadcn]
dependency_graph:
  requires: [04-02, 04-03]
  provides: [mortgage-payments-ui]
  affects: []
tech_stack:
  added: []
  patterns: [mirror RentPaymentsPage pattern, plain HTML select with Tailwind, inline duplicate confirm gate]
key_files:
  created:
    - src/components/MortgagePaymentFormDialog.jsx
    - src/pages/MortgagePaymentsPage.jsx
  modified:
    - src/main.jsx
decisions:
  - "No property pre-filter step: mortgage dropdown shows all mortgages directly (lender + property_address)"
  - "is_on_time display reads server-computed value directly — no client-side grace period logic"
  - "Two-submit overwrite gate via showDuplicateConfirm mirrors rent pattern exactly"
metrics:
  duration: "~10 minutes"
  completed: "2026-04-08"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 1
---

# Phase 04 Plan 04: Mortgage Payments UI Summary

**One-liner:** Mortgage payment entry page with mortgage/month selectors, payment history table with On Time/Late badges, inline duplicate overwrite guard, and clear-record button — mirroring the rent payment UI pattern.

## What Was Built

- `src/components/MortgagePaymentFormDialog.jsx` — Modal dialog for recording or editing a mortgage payment: paid_date text input (YYYY-MM-DD), amount_paid number input, inline amber duplicate warning on first overwrite attempt, Clear payment destructive button for DELETE, subtitle showing lender + property_address + month
- `src/pages/MortgagePaymentsPage.jsx` — Page at /payments/mortgage: fetches all mortgages on mount, single mortgage dropdown (lender — property_address), month input defaulting to current YYYY-MM, payment history table sorted newest-first with On Time (green) / Late (destructive) badges, wires MortgagePaymentFormDialog with all props
- `src/main.jsx` updated — added MortgagePaymentsPage import and `payments/mortgage` route alongside the existing `payments/rent` route

## API Connections

| Component | Endpoint | When |
|-----------|----------|------|
| MortgagePaymentsPage | GET /api/mortgages | On mount |
| MortgagePaymentsPage | GET /api/mortgage-payments?mortgage_id=N | On mortgage selection change |
| MortgagePaymentFormDialog | POST /api/mortgage-payments | On form submit (upsert) |
| MortgagePaymentFormDialog | DELETE /api/mortgage-payments/:id | On Clear payment click |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — all threat mitigations applied:
- T-04-17: Client-side `/^\d{4}-\d{2}-\d{2}$/` regex validates paidDate before POST
- T-04-18: Two-submit showDuplicateConfirm gate prevents accidental overwrite
- T-04-19: Only generic user-facing error strings rendered; no stack traces
- T-04-20: No debounce needed (local app, small dataset)

## Self-Check

- [x] `src/components/MortgagePaymentFormDialog.jsx` exists with showDuplicateConfirm, /api/mortgage-payments, onDeleted, mortgage_id — PASS
- [x] `src/pages/MortgagePaymentsPage.jsx` exists with selectedMortgageId, MortgagePaymentFormDialog, /api/mortgage-payments, existingRecord — PASS
- [x] `src/main.jsx` contains MortgagePaymentsPage import and payments/mortgage route — PASS
- [x] Task 1 commit: 16aedfb
- [x] Task 2 commit: 536d95e

## Self-Check: PASSED
