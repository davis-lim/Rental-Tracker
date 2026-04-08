import db from '../db.js';

const GET_ALL_SQL = `
  SELECT m.id, m.property_id, m.lender, m.due_day, m.amount, m.created_at,
         p.address AS property_address
  FROM mortgages m
  JOIN properties p ON p.id = m.property_id
  ORDER BY m.id DESC
`;

const GET_BY_ID_SQL = `
  SELECT m.id, m.property_id, m.lender, m.due_day, m.amount, m.created_at,
         p.address AS property_address
  FROM mortgages m
  JOIN properties p ON p.id = m.property_id
  WHERE m.id = ?
`;

export function getAll() {
  return db.prepare(GET_ALL_SQL).all();
}

export function getById(id) {
  return db.prepare(GET_BY_ID_SQL).get(id);
}

export function create({ property_id, lender, due_day, amount }) {
  const stmt = db.prepare(
    'INSERT INTO mortgages (property_id, lender, due_day, amount) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(property_id, lender, due_day, amount);
  return getById(result.lastInsertRowid);
}

export function update(id, { property_id, lender, due_day, amount }) {
  const stmt = db.prepare(
    'UPDATE mortgages SET property_id = ?, lender = ?, due_day = ?, amount = ? WHERE id = ?'
  );
  const result = stmt.run(property_id, lender, due_day, amount, id);
  if (result.changes === 0) {
    return undefined;
  }
  return getById(id);
}

export function remove(id, cascade = false) {
  if (cascade) {
    const deleteAll = db.transaction(() => {
      db.prepare('DELETE FROM mortgage_payments WHERE mortgage_id = ?').run(id);
      return db.prepare('DELETE FROM mortgages WHERE id = ?').run(id);
    });
    const result = deleteAll();
    return result.changes > 0 ? { deleted: true } : { deleted: false };
  } else {
    const result = db.prepare('DELETE FROM mortgages WHERE id = ?').run(id);
    return result.changes > 0 ? { deleted: true } : { deleted: false };
  }
}

export function getDependentCounts(id) {
  const payments = db.prepare(
    'SELECT COUNT(*) as count FROM mortgage_payments WHERE mortgage_id = ?'
  ).get(id);
  return {
    mortgage_payments: payments.count,
  };
}

export default { getAll, getById, create, update, remove, getDependentCounts };
