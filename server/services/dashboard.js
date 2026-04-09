import db from '../db.js';

// Copied verbatim from rentPayments.js — do NOT import cross-service
function computeDueDate(deadlineDay, month) {
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const clampedDay = Math.min(deadlineDay, daysInMonth);
  return `${month}-${String(clampedDay).padStart(2, '0')}`;
}

/**
 * getSummary(month) — returns all tenants and mortgages with paid/unpaid/late status
 * for the given month (YYYY-MM).
 */
export function getSummary(month) {
  // Rent: all tenants with optional payment for the month
  const tenantRows = db.prepare(`
    SELECT
      t.id AS tenant_id,
      t.name,
      p.address AS property_address,
      t.rent_amount,
      t.deadline_day,
      t.grace_period_days,
      rp.paid_date,
      rp.amount_paid,
      rp.is_on_time
    FROM tenants t
    JOIN properties p ON p.id = t.property_id
    LEFT JOIN rent_payments rp ON rp.tenant_id = t.id AND rp.month = ?
    ORDER BY p.address ASC, t.name ASC
  `).all(month);

  const tenants = tenantRows.map(row => {
    const due_date = computeDueDate(row.deadline_day, month);
    let status;
    if (row.paid_date != null) {
      status = row.is_on_time === 1 ? 'paid_on_time' : 'paid_late';
    } else {
      status = 'unpaid';
    }
    return {
      type: 'rent',
      tenant_id: row.tenant_id,
      name: row.name,
      property_address: row.property_address,
      rent_amount: row.rent_amount,
      due_date,
      status,
      paid_date: row.paid_date ?? null,
      amount_paid: row.amount_paid ?? null,
    };
  });

  // Mortgages: all mortgages with optional payment for the month
  const mortgageRows = db.prepare(`
    SELECT
      m.id AS mortgage_id,
      m.lender,
      p.address AS property_address,
      m.amount,
      m.due_day,
      mp.paid_date,
      mp.amount_paid,
      mp.is_on_time
    FROM mortgages m
    JOIN properties p ON p.id = m.property_id
    LEFT JOIN mortgage_payments mp ON mp.mortgage_id = m.id AND mp.month = ?
    ORDER BY p.address ASC, m.lender ASC
  `).all(month);

  const mortgages = mortgageRows.map(row => {
    const due_date = computeDueDate(row.due_day, month);
    let status;
    if (row.paid_date != null) {
      status = row.is_on_time === 1 ? 'paid_on_time' : 'paid_late';
    } else {
      status = 'unpaid';
    }
    return {
      type: 'mortgage',
      mortgage_id: row.mortgage_id,
      lender: row.lender,
      property_address: row.property_address,
      amount: row.amount,
      due_date,
      status,
      paid_date: row.paid_date ?? null,
      amount_paid: row.amount_paid ?? null,
    };
  });

  return { tenants, mortgages };
}

/**
 * getUpcoming(month, today) — returns rent and mortgage items due within the next 7 days
 * that have no payment record.
 * month: YYYY-MM, today: YYYY-MM-DD
 */
export function getUpcoming(month, today) {
  // Compute window end (today + 7 days)
  const d = new Date(today + 'T00:00:00');
  d.setDate(d.getDate() + 7);
  const windowEnd = d.toISOString().slice(0, 10);

  // Determine if window crosses into next calendar month
  const nextMonth = windowEnd.slice(0, 7) !== month
    ? windowEnd.slice(0, 7)
    : null;

  const months = [month, nextMonth].filter(Boolean);

  const items = [];
  const seen = new Set();

  const allTenants = db.prepare(`
    SELECT t.id, t.name, p.address AS property_address, t.rent_amount, t.deadline_day
    FROM tenants t
    JOIN properties p ON p.id = t.property_id
  `).all();

  for (const loopMonth of months) {
    for (const t of allTenants) {
      const dueDate = computeDueDate(t.deadline_day, loopMonth);
      if (dueDate >= today && dueDate <= windowEnd) {
        // Check if unpaid
        const payment = db.prepare(
          'SELECT id FROM rent_payments WHERE tenant_id = ? AND month = ?'
        ).get(t.id, loopMonth);
        if (!payment) {
          const key = `rent-${t.id}-${loopMonth}`;
          if (!seen.has(key)) {
            seen.add(key);
            items.push({
              type: 'rent',
              name: t.name,
              property_address: t.property_address,
              due_date: dueDate,
              amount: t.rent_amount,
            });
          }
        }
      }
    }
  }

  const allMortgages = db.prepare(`
    SELECT m.id, m.lender, p.address AS property_address, m.amount, m.due_day
    FROM mortgages m
    JOIN properties p ON p.id = m.property_id
  `).all();

  for (const loopMonth of months) {
    for (const m of allMortgages) {
      const dueDate = computeDueDate(m.due_day, loopMonth);
      if (dueDate >= today && dueDate <= windowEnd) {
        const payment = db.prepare(
          'SELECT id FROM mortgage_payments WHERE mortgage_id = ? AND month = ?'
        ).get(m.id, loopMonth);
        if (!payment) {
          const key = `mortgage-${m.id}-${loopMonth}`;
          if (!seen.has(key)) {
            seen.add(key);
            items.push({
              type: 'mortgage',
              lender: m.lender,
              property_address: m.property_address,
              due_date: dueDate,
              amount: m.amount,
            });
          }
        }
      }
    }
  }

  items.sort((a, b) => a.due_date.localeCompare(b.due_date));
  return items;
}

/**
 * getOverdue(month, today) — returns rent and mortgage items past due (including grace period)
 * with no payment record.
 * month: YYYY-MM, today: YYYY-MM-DD
 */
export function getOverdue(month, today) {
  const items = [];

  const allTenants = db.prepare(`
    SELECT t.id, t.name, p.address AS property_address, t.rent_amount, t.deadline_day, t.grace_period_days
    FROM tenants t
    JOIN properties p ON p.id = t.property_id
  `).all();

  for (const t of allTenants) {
    const dueDate = computeDueDate(t.deadline_day, month);
    // Compute grace deadline
    const gd = new Date(dueDate + 'T00:00:00');
    gd.setDate(gd.getDate() + t.grace_period_days);
    const graceDeadline = gd.toISOString().slice(0, 10);

    if (graceDeadline < today) {
      const payment = db.prepare(
        'SELECT id FROM rent_payments WHERE tenant_id = ? AND month = ?'
      ).get(t.id, month);
      if (!payment) {
        items.push({
          type: 'rent',
          name: t.name,
          property_address: t.property_address,
          due_date: dueDate,
          grace_deadline: graceDeadline,
          amount: t.rent_amount,
        });
      }
    }
  }

  const allMortgages = db.prepare(`
    SELECT m.id, m.lender, p.address AS property_address, m.amount, m.due_day
    FROM mortgages m
    JOIN properties p ON p.id = m.property_id
  `).all();

  for (const m of allMortgages) {
    const dueDate = computeDueDate(m.due_day, month);
    if (dueDate < today) {
      const payment = db.prepare(
        'SELECT id FROM mortgage_payments WHERE mortgage_id = ? AND month = ?'
      ).get(m.id, month);
      if (!payment) {
        items.push({
          type: 'mortgage',
          lender: m.lender,
          property_address: m.property_address,
          due_date: dueDate,
          amount: m.amount,
        });
      }
    }
  }

  items.sort((a, b) => a.due_date.localeCompare(b.due_date));
  return items;
}

export default { getSummary, getUpcoming, getOverdue };
