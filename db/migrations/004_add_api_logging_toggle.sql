-- Add API logging enabled setting to system_settings table
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES 
  ('api_logging_enabled', 'true', 'Enable or disable API request logging'),
  ('api_log_retention_days', '30', 'Number of days to retain API logs before automatic deletion')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description;

-- Update the RLS policy for system_settings to be more specific about updates
DROP POLICY IF EXISTS "Allow superadmin access to system settings" ON system_settings;

CREATE POLICY "Allow superadmin read access to system settings" ON system_settings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'superadmin'
    )
  );

CREATE POLICY "Allow superadmin update access to system settings" ON system_settings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'superadmin'
    )
  );