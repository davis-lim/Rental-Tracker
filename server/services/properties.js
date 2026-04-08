import db from '../db.js';

const GET_ALL_SQL = `
  SELECT
    id,
    address,
    notes,
    created_at,
    (SELECT COUNT(*) FROM tenants WHERE property_id = properties.id) AS tenant_count
  FROM properties
  ORDER BY id DESC
`;

const GET_BY_ID_SQL = `
  SELECT
    id,
    address,
    notes,
    created_at,
    (SELECT COUNT(*) FROM tenants WHERE property_id = properties.id) AS tenant_count
  FROM properties
  WHERE id = ?
`;

export function getAll() {
  return db.prepare(GET_ALL_SQL).all();
}

export function getById(id) {
  return db.prepare(GET_BY_ID_SQL).get(id);
}

export function create({ address, notes = '' }) {
  const stmt = db.prepare('INSERT INTO properties (address, notes) VALUES (?, ?)');
  const result = stmt.run(address, notes);
  return getById(result.lastInsertRowid);
}

export function update(id, { address, notes = '' }) {
  const stmt = db.prepare('UPDATE properties SET address = ?, notes = ? WHERE id = ?');
  const result = stmt.run(address, notes, id);
  if (result.changes === 0) {
    return undefined;
  }
  return getById(id);
}

export function remove(id, cascade = false) {
  if (cascade) {
    const deleteAll = db.transaction(() => {
      db.prepare('DELETE FROM rent_payments WHERE tenant_id IN (SELECT id FROM tenants WHERE property_id = ?)').run(id);
      db.prepare('DELETE FROM tenants WHERE property_id = ?').run(id);
      db.prepare('DELETE FROM mortgage_payments WHERE mortgage_id IN (SELECT id FROM mortgages WHERE property_id = ?)').run(id);
      db.prepare('DELETE FROM mortgages WHERE property_id = ?').run(id);
      return db.prepare('DELETE FROM properties WHERE id = ?').run(id);
    });
    const result = deleteAll();
    return result.changes > 0 ? { deleted: true } : { deleted: false };
  } else {
    const result = db.prepare('DELETE FROM properties WHERE id = ?').run(id);
    return result.changes > 0 ? { deleted: true } : { deleted: false };
  }
}

export function getDependentCounts(id) {
  const tenants = db.prepare('SELECT COUNT(*) as count FROM tenants WHERE property_id = ?').get(id);
  const mortgages = db.prepare('SELECT COUNT(*) as count FROM mortgages WHERE property_id = ?').get(id);
  return {
    tenants: tenants.count,
    mortgages: mortgages.count,
  };
}

export default { getAll, getById, create, update, remove, getDependentCounts };
