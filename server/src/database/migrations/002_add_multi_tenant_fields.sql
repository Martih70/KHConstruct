-- KHConstruct Multi-Tenant Database Schema Migration
-- Adds support for separating Witness and Non-Witness cost databases
-- and improving project/cost item isolation

-- Add is_witness field to users table
-- Identifies if user belongs to Kingdom Hall (Witness) community
ALTER TABLE users ADD COLUMN is_witness BOOLEAN NOT NULL DEFAULT 1;

-- Add database_type field to cost_items table
-- Determines which cost database a cost item belongs to ('witness', 'standard_uk', or 'bcis')
ALTER TABLE cost_items ADD COLUMN database_type TEXT NOT NULL DEFAULT 'witness'
  CHECK(database_type IN ('witness', 'standard_uk', 'bcis'));

-- Create index for efficient filtering of cost items by database type
CREATE INDEX idx_cost_items_database_type ON cost_items(database_type);

-- Update all existing cost items to be 'witness' type
-- This preserves the current data as the "Kingdom Hall" database
UPDATE cost_items SET database_type = 'witness';

-- Update all existing users to is_witness = 1 (Kingdom Hall users)
-- New registrations will allow users to specify their status
UPDATE users SET is_witness = 1;
