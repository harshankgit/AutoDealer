-- Update the rooms policy to allow public read access
-- This fixes the issue where unauthenticated users couldn't access the rooms list

DROP POLICY IF EXISTS "Rooms are viewable by authenticated users" ON rooms;

-- Allow anyone to view active rooms (public access)
CREATE POLICY "Rooms are viewable by anyone" 
ON rooms 
FOR SELECT 
USING (is_active = true);

-- Keep existing policies for authenticated users
-- Users can create rooms
CREATE POLICY "Users can create rooms" ON rooms FOR INSERT TO authenticated WITH CHECK (
    adminid = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);

-- Admin can manage own rooms
CREATE POLICY "Admin can manage own rooms" ON rooms FOR ALL TO authenticated USING (
    adminid = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);

-- Superadmin can manage all rooms
CREATE POLICY "Superadmin can manage all rooms" ON rooms FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);