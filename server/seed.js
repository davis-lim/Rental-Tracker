import db from './db.js';

// Clear existing data
db.exec('DELETE FROM mortgage_payments');
db.exec('DELETE FROM rent_payments');
db.exec('DELETE FROM mortgages');
db.exec('DELETE FROM tenants');
db.exec('DELETE FROM properties');

// Sample properties
const insertProperty = db.prepare('INSERT INTO properties (address, notes) VALUES (?, ?)');
const p1 = insertProperty.run('123 Main St, Springfield', 'Single family home');
const p2 = insertProperty.run('456 Oak Ave, Shelbyville', 'Duplex');

// Sample tenants (DATA-01: months as YYYY-MM)
const insertTenant = db.prepare(
  'INSERT INTO tenants (property_id, name, rent_amount, deadline_day, grace_period_days, lease_start, lease_end) VALUES (?, ?, ?, ?, ?, ?, ?)'
);
const t1 = insertTenant.run(p1.lastInsertRowid, 'Alice Johnson', 1500.00, 1, 5, '2025-01', '2026-12');
const t2 = insertTenant.run(p2.lastInsertRowid, 'Bob Smith', 1200.00, 15, 3, '2025-06', null);

// Sample mortgage
const insertMortgage = db.prepare(
  'INSERT INTO mortgages (property_id, lender, due_day, amount) VALUES (?, ?, ?, ?)'
);
const m1 = insertMortgage.run(p1.lastInsertRowid, 'First National Bank', 1, 950.00);

// Sample rent payment (DATA-01: month as YYYY-MM string)
const insertRentPayment = db.prepare(
  'INSERT INTO rent_payments (tenant_id, month, paid_date, amount_paid, is_on_time) VALUES (?, ?, ?, ?, ?)'
);
insertRentPayment.run(t1.lastInsertRowid, '2026-03', '2026-03-03', 1500.00, 1);
insertRentPayment.run(t1.lastInsertRowid, '2026-02', '2026-02-08', 1500.00, 0);

// Sample mortgage payment
const insertMortgagePayment = db.prepare(
  'INSERT INTO mortgage_payments (mortgage_id, month, paid_date, amount_paid, is_on_time) VALUES (?, ?, ?, ?, ?)'
);
insertMortgagePayment.run(m1.lastInsertRowid, '2026-03', '2026-03-01', 950.00, 1);

console.log('Seed data inserted successfully.');
console.log('Properties:', db.prepare('SELECT COUNT(*) as count FROM properties').get().count);
console.log('Tenants:', db.prepare('SELECT COUNT(*) as count FROM tenants').get().count);
console.log('Mortgages:', db.prepare('SELECT COUNT(*) as count FROM mortgages').get().count);
console.log('Rent payments:', db.prepare('SELECT COUNT(*) as count FROM rent_payments').get().count);
console.log('Mortgage payments:', db.prepare('SELECT COUNT(*) as count FROM mortgage_payments').get().count);
