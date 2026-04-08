import db from '../db.js';

// Internal helper: compute the due date for a given month, clamping to end-of-month
function computeDueDate(deadlineDay, month) {
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const clampedDay = Math.min(deadlineDay, daysInMonth);
  return `${month}-${String(clampedDay).padStart(2, '0')}`;
}

// Internal helper: determine if paid on time given due date and grace period
function computeIsOnTime(paidDate, dueDate, gracePeriodDays) {
  const due = new Date(dueDate + 'T00:00:00');
  due.setDate(due.getDate() + gracePeriodDays);
  const graceDeadline = due.toISOString().slice(0, 10);
  return paidDate <= graceDeadline ? 1 : 0;
}

export function getByTenant(tenantId) {
  return db.prepare(
    'SELECT * FROM rent_payments WHERE tenant_id = ? ORDER BY month DESC'
  ).all(tenantId);
}

export function getByMonth(month) {
  return db.prepare(`
    SELECT rp.*, t.name AS tenant_name, p.address AS property_address
    FROM rent_payments rp
    JOIN tenants t ON t.id = rp.tenant_id
    JOIN properties p ON p.id = t.property_id
    WHERE rp.month = ?
    ORDER BY p.address ASC, t.name ASC
  `).all(month);
}

export function getOne(tenantId, month) {
  return db.prepare(
    'SELECT * FROM rent_payments WHERE tenant_id = ? AND month = ?'
  ).get(tenantId, month);
}

export function upsert({ tenant_id, month, paid_date, amount_paid }) {
  const tenant = db.prepare(
    'SELECT deadline_day, grace_period_days FROM tenants WHERE id = ?'
  ).get(tenant_id);

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const dueDate = computeDueDate(tenant.deadline_day, month);
  const isOnTime = computeIsOnTime(paid_date, dueDate, tenant.grace_period_days);

  db.prepare(
    'INSERT OR REPLACE INTO rent_payments (tenant_id, month, paid_date, amount_paid, is_on_time) VALUES (?, ?, ?, ?, ?)'
  ).run(tenant_id, month, paid_date, amount_paid, isOnTime);

  return db.prepare(
    'SELECT * FROM rent_payments WHERE tenant_id = ? AND month = ?'
  ).get(tenant_id, month);
}

export function remove(id) {
  const result = db.prepare('DELETE FROM rent_payments WHERE id = ?').run(id);
  return { deleted: result.changes > 0 };
}

export default { getByTenant, getByMonth, getOne, upsert, remove };
