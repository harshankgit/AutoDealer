-- Update RLS policies to use JWT role directly instead of profiles table

-- Drop existing policies
DROP POLICY IF EXISTS "Allow superadmin read access to api logs" ON api_logs;
DROP POLICY IF EXISTS "Allow superadmin read access to system settings" ON system_settings;
DROP POLICY IF EXISTS "Allow superadmin update access to system settings" ON system_settings;

-- Create new policy for api_logs - SuperAdmin can READ logs
CREATE POLICY superadmin_read_logs
ON api_logs
FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'role' = 'superadmin');

-- Create new policy for api_logs - Backend inserts allowed
CREATE POLICY backend_insert_logs
ON api_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create new policy for system_settings - SuperAdmin can update logging toggle
CREATE POLICY superadmin_update_settings
ON system_settings
FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'superadmin');

-- Create new policy for system_settings - SuperAdmin can read settings
CREATE POLICY superadmin_read_settings
ON system_settings
FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'role' = 'superadmin');

-- Create new policy for system_settings - SuperAdmin can insert settings
CREATE POLICY superadmin_insert_settings
ON system_settings
FOR INSERT
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'superadmin');