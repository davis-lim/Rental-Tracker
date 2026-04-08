# Requirements: Dad's Rental Tracker

**Defined:** 2026-04-07
**Core Value:** Know instantly whether each tenant's rent and each mortgage payment was on time or late for any given month.

## v1 Requirements

### Properties

- [ ] **PROP-01**: User can create a property with address and optional notes
- [ ] **PROP-02**: User can edit a property's address and notes
- [ ] **PROP-03**: User can delete a property (with cascade warning if tenants/mortgages exist)
- [ ] **PROP-04**: User can view a list of all properties

### Tenants

- [ ] **TENT-01**: User can add a tenant to a property with name, rent amount, deadline day-of-month, and optional grace period (days)
- [ ] **TENT-02**: User can optionally set lease start and end dates on a tenant
- [ ] **TENT-03**: User can edit tenant details (name, rent amount, deadline day, grace period, lease dates)
- [ ] **TENT-04**: User can delete a tenant (with cascade warning if payment records exist)
- [ ] **TENT-05**: User can view all tenants for a property

### Rent Payments

- [ ] **RENT-01**: User can record a rent payment for a tenant+month (payment date, amount paid)
- [ ] **RENT-02**: System computes due date for a given tenant+month as deadline_day of that month
- [ ] **RENT-03**: System sets on-time flag: paid if paid_date ≤ due_date + grace_period_days; late otherwise
- [ ] **RENT-04**: User can edit an existing rent payment record for a tenant+month
- [ ] **RENT-05**: Duplicate guard: if a record already exists for tenant+month, user must confirm before overwriting
- [ ] **RENT-06**: User can mark a rent payment as unpaid/clear a record for a tenant+month

### Mortgages

- [x] **MORT-01**: User can create a mortgage with lender name, associated property, monthly due date (day-of-month), and due amount
- [x] **MORT-02**: User can edit mortgage details
- [x] **MORT-03**: User can delete a mortgage (with cascade warning)
- [ ] **MORT-04**: User can record a mortgage payment for a given month (payment date, amount paid)
- [ ] **MORT-05**: System computes mortgage on-time: paid_date ≤ due_date of that month
- [ ] **MORT-06**: User can edit/clear a mortgage payment record

### Dashboard

- [ ] **DASH-01**: Dashboard shows current month summary: all tenants with paid/unpaid/late status
- [ ] **DASH-02**: Dashboard shows current month mortgage status (paid/unpaid/late)
- [ ] **DASH-03**: Upcoming list: payments due within the next 7 days (rent + mortgage)
- [ ] **DASH-04**: Overdue list: past due and not paid (rent + mortgage)

### History & Stats

- [ ] **HIST-01**: Per-tenant history view: all months with payment date, amount, on-time status
- [ ] **HIST-02**: Per-tenant stats: monthly on-time rate (% on-time over all recorded months)
- [ ] **HIST-03**: Per-property history: rent on-time rate across all tenants
- [ ] **HIST-04**: Mortgage history view: all months with payment date, amount, on-time status

### Export

- [ ] **EXPO-01**: User can export rent payment history to CSV (all properties, or filtered to one property)
- [ ] **EXPO-02**: User can export mortgage payment history to CSV

### Data & Validation

- [ ] **DATA-01**: Months stored as YYYY-MM strings throughout
- [ ] **DATA-02**: Due dates computed from tenant/mortgage settings + month (not stored statically)
- [ ] **DATA-03**: SQLite database stored at `./data/rental.db` (relative to app root)
- [ ] **DATA-04**: README with run instructions, DB location, and example data format assumptions

## v2 Requirements

### Enhancements

- **ENH-01**: Configurable upcoming-dues window (default 7 days, user can change)
- **ENH-02**: Late fee tracking per tenant
- **ENH-03**: Notes per payment record
- **ENH-04**: Email/print-friendly payment receipts
- **ENH-05**: Multi-month bulk payment entry

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / login | Local-only hobby app — single user |
| Cloud sync | Intentionally local; no network dependency |
| Mobile app | Web UI in browser is sufficient |
| Automated rent collection | Tracking only, not payment processing |
| Multi-currency | Single-owner app, one currency assumed |
| Real-time notifications | Dashboard polling is sufficient |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PROP-01..04 | Phase 2 | Pending |
| TENT-01..05 | Phase 2 | Pending |
| DATA-01..03 | Phase 1 | Pending |
| MORT-01..03 | Phase 3 | Pending |
| RENT-01..06 | Phase 3 | Pending |
| MORT-04..06 | Phase 3 | Pending |
| DASH-01..04 | Phase 4 | Pending |
| HIST-01..04 | Phase 5 | Pending |
| EXPO-01..02 | Phase 5 | Pending |
| DATA-04 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-07*
*Last updated: 2026-04-07 after initial definition*
