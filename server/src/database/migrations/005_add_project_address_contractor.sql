-- Add Project Address and Contractor Name to Projects Table
-- Adds physical address and contractor reference to projects

-- Add new columns to projects table
ALTER TABLE projects ADD COLUMN project_address TEXT;

-- Create index on project_address for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_project_address ON projects(project_address);
