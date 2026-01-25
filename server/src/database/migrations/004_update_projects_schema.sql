-- Update Projects Table Schema
-- Adds budget cost, start date, and notes fields
-- Note: client_id was already added in migration 003

-- Add new columns to projects table (if they don't exist)
ALTER TABLE projects ADD COLUMN budget_cost DECIMAL(12, 2);
ALTER TABLE projects ADD COLUMN start_date DATE;
ALTER TABLE projects ADD COLUMN notes TEXT;

-- Create index on start_date for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date);
