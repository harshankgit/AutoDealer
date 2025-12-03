-- Add the missing columns to your monthly_visits table
ALTER TABLE monthly_visits ADD COLUMN IF NOT EXISTS unique_users INTEGER DEFAULT 0;
ALTER TABLE monthly_visits ADD COLUMN IF NOT EXISTS last_updated_devices TEXT DEFAULT '[]';