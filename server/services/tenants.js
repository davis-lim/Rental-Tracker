import db from '../db.js';

const GET_BY_PROPERTY_SQL = `
  SELECT
    id,
    property_id,
    name,
    rent_amount,
    deadline_day,
    grace_period_days,
    lease_start,
    lease_end,
    created_at
  FROM tenants
  WHERE property_id = ?
  ORDER BY name ASC
`;

const GET_ALL_SQL = `
  SELECT
    t.id,
    t.property_id,
    t.name,
    t.rent_amount,
    t.deadline_day,
    t.grace_period_days,
    t.lease_start,
    t.lease_end,
    t.created_at,
    p.address AS property_address
  FROM tenants t
  JOIN properties p ON t.property_id = p.id
  ORDER BY p.address ASC, t.name ASC
`;

const GET_BY_ID_SQL = `
  SELECT
    t.id,
    t.property_id,
    t.name,
    t.rent_amount,
    t.deadline_day,
    t.grace_period_days,
    t.lease_start,
    t.lease_end,
    t.created_at,
    p.address AS property_address
  FROM tenants t
  JOIN properties p ON t.property_id = p.id
  WHERE t.id = ?
`;

export function getByProperty(propertyId) {
  return db.prepare(GET_BY_PROPERTY_SQL).all(propertyId);
}

export function getAll() {
  return db.prepare(GET_ALL_SQL).all();
}

export function getById(id) {
  return db.prepare(GET_BY_ID_SQL).get(id);
}

export function create({ property_id, name, rent_amount, deadline_day, grace_period_days = 0, lease_start = null, lease_end = null }) {
  const stmt = db.prepare(
    'INSERT INTO tenants (property_id, name, rent_amount, deadline_day, grace_period_days, lease_start, lease_end) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(property_id, name, rent_amount, deadline_day, grace_period_days, lease_start, lease_end);
  return getById(result.lastInsertRowid);
}

export function update(id, { name, rent_amount, deadline_day, grace_period_days, lease_start = null, lease_end = null }) {
  const stmt = db.prepare(
    'UPDATE tenants SET name = ?, rent_amount = ?, deadline_day = ?, grace_period_days = ?, lease_start = ?, lease_end = ? WHERE id = ?'
  );
  const result = stmt.run(name, rent_amount, deadline_day, grace_period_days, lease_start, lease_end, id);
  if (result.changes === 0) {
    return undefined;
  }
  return getById(id);
}

export function remove(id, cascade = false) {
  if (cascade) {
    const deleteAll = db.transaction(() => {
      db.prepare('DELETE FROM rent_payments WHERE tenant_id = ?').run(id);
      return db.prepare('DELETE FROM tenants WHERE id = ?').run(id);
    });
    const result = deleteAll();
    return result.changes > 0 ? { deleted: true } : { deleted: false };
  } else {
    const result = db.prepare('DELETE FROM tenants WHERE id = ?').run(id);
    return result.changes > 0 ? { deleted: true } : { deleted: false };
  }
}

export function getDependentCounts(id) {
  const rentPayments = db.prepare('SELECT COUNT(*) as count FROM rent_payments WHERE tenant_id = ?').get(id);
  return {
    rent_payments: rentPayments.count,
  };
}

export default { getByProperty, getAll, getById, create, update, remove, getDependentCounts };
