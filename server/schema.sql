-- Properties
CREATE TABLE IF NOT EXISTS properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  address TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Tenants (linked to a property)
CREATE TABLE IF NOT EXISTS tenants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  rent_amount REAL NOT NULL,
  deadline_day INTEGER NOT NULL CHECK (deadline_day BETWEEN 1 AND 31),
  grace_period_days INTEGER NOT NULL DEFAULT 0,
  lease_start TEXT,
  lease_end TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- Mortgages (linked to a property)
CREATE TABLE IF NOT EXISTS mortgages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER NOT NULL,
  lender TEXT NOT NULL,
  due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  amount REAL NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- Rent payments (linked to a tenant, one per tenant+month)
CREATE TABLE IF NOT EXISTS rent_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  month TEXT NOT NULL,
  paid_date TEXT,
  amount_paid REAL,
  is_on_time INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  UNIQUE(tenant_id, month)
);

-- Mortgage payments (linked to a mortgage, one per mortgage+month)
CREATE TABLE IF NOT EXISTS mortgage_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mortgage_id INTEGER NOT NULL,
  month TEXT NOT NULL,
  paid_date TEXT,
  amount_paid REAL,
  is_on_time INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (mortgage_id) REFERENCES mortgages(id),
  UNIQUE(mortgage_id, month)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tenants_property ON tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_mortgages_property ON mortgages(property_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_tenant ON rent_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_month ON rent_payments(month);
CREATE INDEX IF NOT EXISTS idx_mortgage_payments_mortgage ON mortgage_payments(mortgage_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_payments_month ON mortgage_payments(month);
