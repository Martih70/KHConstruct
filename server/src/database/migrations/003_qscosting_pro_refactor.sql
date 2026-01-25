-- QSCostingPro Refactor Migration
-- Removes Kingdom Hall/Witness structure and adds Client/Contractor management

-- 1. Add Clients table
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postcode TEXT,
  country TEXT DEFAULT 'United Kingdom',
  website TEXT,
  is_active BOOLEAN DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, name)
);

CREATE INDEX idx_clients_user_id ON clients(user_id);

-- 2. Add Building Contractors table
CREATE TABLE IF NOT EXISTS building_contractors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postcode TEXT,
  country TEXT DEFAULT 'United Kingdom',
  website TEXT,
  specialization TEXT,
  is_active BOOLEAN DEFAULT 1,
  rating REAL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, name)
);

CREATE INDEX idx_contractors_user_id ON building_contractors(user_id);

-- 3. Update projects table to link to clients and contractors
ALTER TABLE projects ADD COLUMN client_id INTEGER;
ALTER TABLE projects ADD COLUMN contractor_id INTEGER;
ALTER TABLE projects ADD COLUMN building_type TEXT;
ALTER TABLE projects ADD COLUMN location_city TEXT;
ALTER TABLE projects ADD COLUMN location_postcode TEXT;
ALTER TABLE projects ADD COLUMN client_reference TEXT;

CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_contractor_id ON projects(contractor_id);

-- 4. Update cost_categories to support BCIS structure
ALTER TABLE cost_categories ADD COLUMN bcis_code TEXT;
ALTER TABLE cost_categories ADD COLUMN bcis_level TEXT;
ALTER TABLE cost_categories ADD COLUMN parent_id INTEGER;
ALTER TABLE cost_categories ADD COLUMN is_elemental BOOLEAN DEFAULT 0;

CREATE INDEX idx_cost_categories_bcis_code ON cost_categories(bcis_code);
CREATE INDEX idx_cost_categories_parent_id ON cost_categories(parent_id);

-- 5. Update cost items with additional support
ALTER TABLE cost_items ADD COLUMN bcis_reference TEXT;

CREATE INDEX idx_cost_items_bcis_reference ON cost_items(bcis_reference);

-- 6. Remove is_witness column from users (we'll keep the column but deprecate)
-- The migration runner will handle this gracefully
