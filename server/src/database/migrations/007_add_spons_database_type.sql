-- Add Spons database type to CHECK constraint
-- This migration updates the CHECK constraint on cost_items.database_type to include 'spons'

-- Create a new cost_items table with updated constraint
CREATE TABLE cost_items_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sub_element_id INTEGER NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  unit_id INTEGER NOT NULL,
  material_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  management_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  contractor_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  is_contractor_required BOOLEAN NOT NULL DEFAULT 0,
  volunteer_hours_estimated DECIMAL(8, 2),
  waste_factor DECIMAL(4, 2) NOT NULL DEFAULT 1.05,
  currency TEXT NOT NULL DEFAULT 'GBP',
  price_date DATE,
  region TEXT,
  date_recorded DATETIME DEFAULT CURRENT_TIMESTAMP,
  project_source_id INTEGER,
  database_type TEXT NOT NULL DEFAULT 'witness'
    CHECK(database_type IN ('witness', 'standard_uk', 'bcis', 'spons')),
  bcis_reference TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sub_element_id) REFERENCES cost_sub_elements(id) ON DELETE CASCADE,
  FOREIGN KEY (unit_id) REFERENCES units(id),
  FOREIGN KEY (project_source_id) REFERENCES projects(id) ON DELETE SET NULL
);

-- Copy data from old table to new table
INSERT INTO cost_items_new SELECT * FROM cost_items;

-- Drop old table
DROP TABLE cost_items;

-- Rename new table to cost_items
ALTER TABLE cost_items_new RENAME TO cost_items;

-- Recreate indexes
CREATE INDEX idx_cost_items_sub_element_id ON cost_items(sub_element_id);
CREATE INDEX idx_cost_items_database_type ON cost_items(database_type);
CREATE INDEX idx_cost_items_code ON cost_items(code);
