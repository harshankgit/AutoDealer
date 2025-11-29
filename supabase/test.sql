-- Complete Supabase Schema with RLS Policies for Custom Auth System
-- Supports custom user management with OTP/Password authentication

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS visits CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS cars CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS otps CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS counters CASCADE;

-- Create the users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    favorites TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the rooms table
CREATE TABLE rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    contact_info JSONB,
    image TEXT,
    adminid UUID REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the cars table
CREATE TABLE cars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    mileage INTEGER NOT NULL,
    fuel_type VARCHAR(20) NOT NULL,
    transmission VARCHAR(20) NOT NULL,
    ownership_history VARCHAR(20) NOT NULL,
    images TEXT[] DEFAULT '{}',
    description TEXT NOT NULL,
    specifications JSONB,
    condition VARCHAR(20) NOT NULL,
    availability VARCHAR(20) DEFAULT 'Available',
    roomid UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    adminid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the bookings table
CREATE TABLE bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    carid UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the visits table
CREATE TABLE visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    carid UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the chats table
CREATE TABLE chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    roomid UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    senderid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the files table
CREATE TABLE files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    path TEXT NOT NULL,
    size BIGINT NOT NULL,
    type VARCHAR(100) NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the payments table
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bookingid UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    transactionid VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the otps table for secure email verification
CREATE TABLE otps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the counters table
CREATE TABLE counters (
    id VARCHAR(50) PRIMARY KEY,
    count_value INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_cars_brand ON cars(brand);
CREATE INDEX idx_cars_price ON cars(price);
CREATE INDEX idx_cars_year ON cars(year);
CREATE INDEX idx_cars_availability ON cars(availability);
CREATE INDEX idx_cars_adminid ON cars(adminid);
CREATE INDEX idx_cars_roomid ON cars(roomid);
CREATE INDEX idx_bookings_userid ON bookings(userid);
CREATE INDEX idx_bookings_carid ON bookings(carid);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_visits_carid ON visits(carid);
CREATE INDEX idx_visits_userid ON visits(userid);
CREATE INDEX idx_rooms_adminid ON rooms(adminid);
CREATE INDEX idx_chats_roomid ON chats(roomid);
CREATE INDEX idx_chats_senderid ON chats(senderid);
CREATE INDEX idx_payments_bookingid ON payments(bookingid);
CREATE INDEX idx_payments_userid ON payments(userid);
CREATE INDEX idx_otps_email ON otps(email);
CREATE INDEX idx_otps_expires_at ON otps(expires_at);
CREATE INDEX idx_otps_used ON otps(used);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE otps ENABLE ROW LEVEL SECURITY;

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the function to tables that have updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_counters_updated_at BEFORE UPDATE ON counters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_otps_updated_at BEFORE UPDATE ON otps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Users table RLS Policies (CRITICAL for custom auth system)
-- Allow authentication queries to access user data (CRITICAL FOR LOGIN)
CREATE POLICY "Users can view for authentication" ON users FOR SELECT USING (true);
-- Allow authenticated users to access their own profile data
CREATE POLICY "Users can view own profile" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
-- Allow service role to manage users (for OTP verification, user creation)
CREATE POLICY "Service role can manage users" ON users FOR ALL TO service_role USING (true);
-- Allow admins to view all users
CREATE POLICY "Admin can view all users" ON users FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'superadmin')
    )
);

-- Rooms table RLS Policies
CREATE POLICY "Rooms are viewable by authenticated users" ON rooms FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Users can create rooms" ON rooms FOR INSERT TO authenticated WITH CHECK (
    adminid = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);
CREATE POLICY "Admin can manage own rooms" ON rooms FOR ALL TO authenticated USING (
    adminid = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);
CREATE POLICY "Superadmin can manage all rooms" ON rooms FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);

-- Cars table RLS Policies
CREATE POLICY "Cars are viewable by authenticated users" ON cars FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM rooms r WHERE r.id = roomid AND r.is_active = true
    )
);
CREATE POLICY "Admin can create cars in their rooms" ON cars FOR INSERT TO authenticated WITH CHECK (
    (
        EXISTS (
            SELECT 1 FROM rooms r WHERE r.id = roomid AND r.adminid = auth.uid()
        ) AND adminid = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);
CREATE POLICY "Admin can manage own cars" ON cars FOR ALL TO authenticated USING (
    adminid = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);
CREATE POLICY "Superadmin can manage all cars" ON cars FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);

-- Bookings table RLS Policies
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT TO authenticated USING (
    userid = auth.uid()
);
CREATE POLICY "Users can view bookings in their cars" ON bookings FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM cars c WHERE c.id = carid AND c.adminid = auth.uid()
    )
);
CREATE POLICY "Users can create own bookings" ON bookings FOR INSERT TO authenticated WITH CHECK (
    userid = auth.uid() AND
    EXISTS (
        SELECT 1 FROM cars c WHERE c.id = carid AND c.availability = 'Available'
    )
);
CREATE POLICY "Users can manage own bookings" ON bookings FOR ALL TO authenticated USING (
    userid = auth.uid()
);
CREATE POLICY "Admin can manage bookings for their cars" ON bookings FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM cars c WHERE c.id = carid AND c.adminid = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);
CREATE POLICY "Superadmin can manage all bookings" ON bookings FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);

-- Visits table RLS Policies
CREATE POLICY "Users can view own visits" ON visits FOR SELECT TO authenticated USING (
    userid = auth.uid()
);
CREATE POLICY "Users can view visits for cars they admin" ON visits FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM cars c WHERE c.id = carid AND c.adminid = auth.uid()
    )
);
CREATE POLICY "Users can create own visits" ON visits FOR INSERT TO authenticated WITH CHECK (
    userid = auth.uid() AND
    EXISTS (
        SELECT 1 FROM cars c WHERE c.id = carid AND 
        EXISTS (SELECT 1 FROM rooms r WHERE r.id = c.roomid AND r.is_active = true)
    )
);
CREATE POLICY "Service role can manage visits" ON visits FOR ALL TO service_role USING (true);

-- Chats table RLS Policies
CREATE POLICY "Users can view chats in active rooms" ON chats FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM rooms r WHERE r.id = roomid AND r.is_active = true
    )
);
CREATE POLICY "Users can send messages in active rooms" ON chats FOR INSERT TO authenticated WITH CHECK (
    senderid = auth.uid() AND 
    EXISTS (
        SELECT 1 FROM rooms r WHERE r.id = roomid AND r.is_active = true
    )
);
CREATE POLICY "Users can update own messages" ON chats FOR UPDATE TO authenticated USING (
    senderid = auth.uid()
);
CREATE POLICY "Users can delete own messages" ON chats FOR DELETE TO authenticated USING (
    senderid = auth.uid()
);
CREATE POLICY "Admin can manage messages in their rooms" ON chats FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM rooms r WHERE r.id = roomid AND r.adminid = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);
CREATE POLICY "Superadmin can manage all messages" ON chats FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);

-- Files table RLS Policies
CREATE POLICY "Users can view own files" ON files FOR SELECT TO authenticated USING (
    uploaded_by = auth.uid()
);
CREATE POLICY "Users can upload own files" ON files FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "Users can manage own files" ON files FOR ALL TO authenticated USING (uploaded_by = auth.uid());
CREATE POLICY "Service role can manage files" ON files FOR ALL TO service_role USING (true);

-- Payments table RLS Policies
CREATE POLICY "Users can view own payments" ON payments FOR SELECT TO authenticated USING (
    userid = auth.uid()
);
CREATE POLICY "Users can create own payments" ON payments FOR INSERT TO authenticated WITH CHECK (
    userid = auth.uid() AND
    bookingid IN (
        SELECT id FROM bookings WHERE userid = auth.uid()
    )
);
CREATE POLICY "Admin can manage payments for their cars" ON payments FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM bookings b JOIN cars c ON b.carid = c.id 
        WHERE b.id = bookingid AND c.adminid = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);
CREATE POLICY "Service role can manage payments" ON payments FOR ALL TO service_role USING (true);

-- Counters table RLS Policies
CREATE POLICY "Counters accessible by service role" ON counters FOR ALL TO service_role USING (true);
CREATE POLICY "Counters accessible by superadmin" ON counters FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);

-- OTPs table RLS Policies (CRITICAL: Only service role can access for security)
CREATE POLICY "OTPs accessible by service role only" ON otps FOR ALL TO service_role USING (true);

-- Initialize required counter records
INSERT INTO counters (id, count_value) VALUES ('global_visits', 0) ON CONFLICT (id) DO NOTHING;

-- END OF SCHEMA
