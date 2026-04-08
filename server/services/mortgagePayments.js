import db from '../db.js';

// Internal helper: compute the due date for a given month, clamping to end-of-month
function computeDueDate(dueDay, month) {
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const clampedDay = Math.min(dueDay, daysInMonth);
  return `${month}-${String(clampedDay).padStart(2, '0')}`;
}

// Internal helper: determine if paid on time (no grace period for mortgages — MORT-05)
function computeIsOnTime(paidDate, dueDate) {
  return paidDate <= dueDate ? 1 : 0;
}

export function getByMortgage(mortgageId) {
  return db.prepare(
    'SELECT * FROM mortgage_payments WHERE mortgage_id = ? ORDER BY month DESC'
  ).all(mortgageId);
}

export function getByMonth(month) {
  return db.prepare(`
    SELECT mp.*, m.lender AS mortgage_lender, p.address AS property_address
    FROM mortgage_payments mp
    JOIN mortgages m ON m.id = mp.mortgage_id
    JOIN properties p ON p.id = m.property_id
    WHERE mp.month = ?
    ORDER BY p.address ASC, m.lender ASC
  `).all(month);
}

export function upsert({ mortgage_id, month, paid_date, amount_paid }) {
  const mortgage = db.prepare(
    'SELECT due_day FROM mortgages WHERE id = ?'
  ).get(mortgage_id);

  if (!mortgage) {
    throw new Error('Mortgage not found');
  }

  const dueDate = computeDueDate(mortgage.due_day, month);
  const isOnTime = computeIsOnTime(paid_date, dueDate);

  db.prepare(
    'INSERT OR REPLACE INTO mortgage_payments (mortgage_id, month, paid_date, amount_paid, is_on_time) VALUES (?, ?, ?, ?, ?)'
  ).run(mortgage_id, month, paid_date, amount_paid, isOnTime);

  return db.prepare(
    'SELECT * FROM mortgage_payments WHERE mortgage_id = ? AND month = ?'
  ).get(mortgage_id, month);
}

export function remove(id) {
  const result = db.prepare('DELETE FROM mortgage_payments WHERE id = ?').run(id);
  return { deleted: result.changes > 0 };
}

export default { getByMortgage, getByMonth, upsert, remove };
