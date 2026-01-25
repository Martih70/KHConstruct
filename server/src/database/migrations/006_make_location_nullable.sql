-- Make location field nullable in projects table
-- This migration allows creating projects without a location since we now use client_address and project_address

-- Create a new projects table with location as nullable
CREATE TABLE projects_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT,
  region TEXT,
  congregation_name TEXT,
  floor_area_m2 DECIMAL(10, 2),
  building_age INTEGER,
  condition_rating INTEGER CHECK(condition_rating BETWEEN 1 AND 5),
  description TEXT,
  created_by INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'in_progress', 'completed')),
  estimate_status TEXT NOT NULL DEFAULT 'draft' CHECK(estimate_status IN ('draft', 'submitted', 'approved', 'rejected')),
  approved_by INTEGER,
  approved_at DATETIME,
  approval_notes TEXT,
  contingency_percentage DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  client_id INTEGER,
  contractor_id INTEGER,
  building_type TEXT,
  location_city TEXT,
  location_postcode TEXT,
  client_reference TEXT,
  budget_cost DECIMAL(12, 2),
  start_date DATE,
  notes TEXT,
  project_address TEXT,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Copy data from old table to new table
INSERT INTO projects_new SELECT * FROM projects;

-- Drop old table
DROP TABLE projects;

-- Rename new table
ALTER TABLE projects_new RENAME TO projects;

-- Recreate indexes
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_estimate_status ON projects(estimate_status);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_contractor_id ON projects(contractor_id);
CREATE INDEX idx_projects_start_date ON projects(start_date);
CREATE INDEX idx_projects_project_address ON projects(project_address);
