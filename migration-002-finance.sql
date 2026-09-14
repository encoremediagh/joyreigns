ALTER TABLE properties ADD COLUMN bedrooms INTEGER NOT NULL DEFAULT 0;
ALTER TABLE properties ADD COLUMN bathrooms INTEGER NOT NULL DEFAULT 0;
ALTER TABLE properties ADD COLUMN toilets INTEGER NOT NULL DEFAULT 0;
ALTER TABLE properties ADD COLUMN land_area TEXT;
ALTER TABLE properties ADD COLUMN dimensions TEXT;
ALTER TABLE properties ADD COLUMN parking INTEGER NOT NULL DEFAULT 0;
ALTER TABLE properties ADD COLUMN parking_spaces INTEGER NOT NULL DEFAULT 0;
ALTER TABLE properties ADD COLUMN furnishing TEXT NOT NULL DEFAULT 'Unfurnished';
ALTER TABLE properties ADD COLUMN amenities TEXT;

CREATE TABLE IF NOT EXISTS finance_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_type TEXT NOT NULL CHECK(document_type IN ('quotation','invoice')),
  document_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,
  issue_date TEXT NOT NULL,
  due_date TEXT,
  currency TEXT NOT NULL DEFAULT 'GHS',
  line_items TEXT NOT NULL DEFAULT '[]',
  subtotal REAL NOT NULL DEFAULT 0,
  tax_rate REAL NOT NULL DEFAULT 0,
  tax_amount REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_finance_type ON finance_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_finance_status ON finance_documents(status);
