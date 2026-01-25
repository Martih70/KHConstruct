-- KHConstruct Initial Database Schema
-- Creates all core tables for the application

-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK(role IN ('admin', 'estimator', 'viewer')),
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User refresh tokens
CREATE TABLE user_refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, token_hash)
);

-- Cost categories
CREATE TABLE cost_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cost sub-elements
CREATE TABLE cost_sub_elements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES cost_categories(id) ON DELETE CASCADE
);

-- Units lookup table
CREATE TABLE units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  unit_type TEXT NOT NULL CHECK(unit_type IN ('area', 'length', 'count', 'time')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cost items
CREATE TABLE cost_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sub_element_id INTEGER NOT NULL,
  code TEXT UNIQUE NOT NULL,
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sub_element_id) REFERENCES cost_sub_elements(id) ON DELETE CASCADE,
  FOREIGN KEY (unit_id) REFERENCES units(id),
  FOREIGN KEY (project_source_id) REFERENCES projects(id) ON DELETE SET NULL
);

-- Projects
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
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
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Project estimates (line items)
CREATE TABLE project_estimates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  cost_item_id INTEGER NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_cost_override DECIMAL(10, 2),
  notes TEXT,
  line_total DECIMAL(12, 2),
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  version_number INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (cost_item_id) REFERENCES cost_items(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Project actuals (for feedback loop)
CREATE TABLE project_actuals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  cost_item_id INTEGER NOT NULL,
  actual_quantity DECIMAL(10, 2) NOT NULL,
  actual_cost DECIMAL(12, 2) NOT NULL,
  variance_reason TEXT,
  completed_date DATE,
  recorded_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (cost_item_id) REFERENCES cost_items(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- Project attachments
CREATE TABLE project_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK(file_type IN ('image', 'pdf', 'document')),
  description TEXT,
  uploaded_by INTEGER NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Historic cost analysis
CREATE TABLE historic_cost_analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  sub_element_id INTEGER NOT NULL,
  cost_per_m2 DECIMAL(10, 2) NOT NULL,
  region TEXT,
  building_age_range TEXT CHECK(building_age_range IN ('0-10', '10-20', '20-30', '30+')),
  condition_rating_range TEXT CHECK(condition_rating_range IN ('1-2', '3', '4-5')),
  sample_size INTEGER NOT NULL DEFAULT 0,
  std_deviation DECIMAL(10, 2),
  based_on_projects INTEGER NOT NULL DEFAULT 0,
  calculation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (category_id) REFERENCES cost_categories(id),
  FOREIGN KEY (sub_element_id) REFERENCES cost_sub_elements(id)
);

-- Suppliers
CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  region TEXT,
  specialties TEXT, -- JSON array stored as text
  rating INTEGER CHECK(rating BETWEEN 1 AND 5),
  is_approved BOOLEAN NOT NULL DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cost item suppliers
CREATE TABLE cost_item_suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cost_item_id INTEGER NOT NULL,
  supplier_id INTEGER NOT NULL,
  quoted_price DECIMAL(10, 2),
  quote_date DATE,
  is_preferred BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cost_item_id) REFERENCES cost_items(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  UNIQUE(cost_item_id, supplier_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_cost_items_category ON cost_items(sub_element_id);
CREATE INDEX idx_cost_items_code ON cost_items(code);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_estimate_status ON projects(estimate_status);
CREATE INDEX idx_project_estimates_project ON project_estimates(project_id);
CREATE INDEX idx_project_estimates_cost_item ON project_estimates(cost_item_id);
CREATE INDEX idx_project_actuals_project ON project_actuals(project_id);
CREATE INDEX idx_project_attachments_project ON project_attachments(project_id);
CREATE INDEX idx_historic_analysis_category ON historic_cost_analysis(category_id);
CREATE INDEX idx_historic_analysis_sub_element ON historic_cost_analysis(sub_element_id);
CREATE INDEX idx_suppliers_region ON suppliers(region);
CREATE INDEX idx_refresh_tokens_user ON user_refresh_tokens(user_id);
