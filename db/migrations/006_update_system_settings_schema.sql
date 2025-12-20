-- Update system_settings table to use key/value columns as specified in requirements
-- First, add the new columns if they don't exist
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS key TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS value BOOLEAN;

-- Update the new columns based on existing data
UPDATE system_settings 
SET 
  key = setting_key,
  value = CASE 
    WHEN setting_value = 'true' THEN true
    WHEN setting_value = 'false' THEN false
    ELSE true 
  END
WHERE key IS NULL;

-- Make the new columns NOT NULL
ALTER TABLE system_settings ALTER COLUMN key SET NOT NULL;
ALTER TABLE system_settings ALTER COLUMN value SET NOT NULL;

-- Create unique index on the new key column
CREATE UNIQUE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- For backward compatibility, keep the old columns but we'll primarily use the new ones
-- The application code will be updated to use key/value columns