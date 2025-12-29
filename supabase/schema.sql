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
DROP TABLE IF EXISTS monthly_visits CASCADE;

-- Create the users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    favorites TEXT[] DEFAULT '{}',
    scanner_image TEXT,
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
    payment_receipt_image TEXT,
    payment_details JSONB,
    admin_notes TEXT,
    admin_scanner_image TEXT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    expected_delivery_date DATE,
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
    action VARCHAR(50) DEFAULT 'registration',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the counters table for global counters
CREATE TABLE counters (
    id VARCHAR(50) PRIMARY KEY,
    count_value INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the monthly_visits table
CREATE TABLE monthly_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year_month VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
    month_name VARCHAR(20) NOT NULL,
    visit_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(year_month)
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
ALTER TABLE monthly_visits ENABLE ROW LEVEL SECURITY;

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
CREATE TRIGGER update_monthly_visits_updated_at BEFORE UPDATE ON monthly_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Monthly visits table RLS Policies
CREATE POLICY "Monthly visits accessible by service role" ON monthly_visits FOR ALL TO service_role USING (true);
CREATE POLICY "Monthly visits accessible by authenticated users" ON monthly_visits FOR SELECT TO authenticated USING (true);

-- OTPs table RLS Policies (CRITICAL: Only service role can access for security)
CREATE POLICY "OTPs accessible by service role only" ON otps FOR ALL TO service_role USING (true);

-- Initialize required counter records
INSERT INTO counters (id, count_value) VALUES ('global_visits', 0) ON CONFLICT (id) DO NOTHING;

-- END OF SCHEMA

-- Chat System Schema for One-User-Per-Room Model
-- This schema supports the redesigned chat system with real-time features

-- Drop existing chat-related tables if they exist (to start fresh)
-- IMPORTANT: This would be used in development or when migrating completely
DROP TABLE IF EXISTS chat_typing_indicators CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_conversations CASCADE;

-- Create the chat_conversations table to track chat sessions between user and room
CREATE TABLE chat_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    roomid UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    unread_count INTEGER DEFAULT 0,

    -- Ensure one chat per user per room
    UNIQUE(roomid, userid)
);

-- Create the chat_messages table to store individual messages
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    senderid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'car_details', 'image', 'file'
    car_details JSONB, -- Store car details when sending car info
    file_url TEXT, -- URL for file attachments
    file_name VARCHAR(255), -- Original file name
    file_type VARCHAR(50), -- File type (image, pdf, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Indexes for performance
    INDEX idx_chat_messages_conversation (conversation_id),
    INDEX idx_chat_messages_sender (senderid),
    INDEX idx_chat_messages_timestamp (timestamp),
    INDEX idx_chat_messages_read_status (is_read)
);

-- Create the chat_typing_indicators table for real-time typing indicators
CREATE TABLE chat_typing_indicators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_typing BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 seconds', -- Auto-expire typing indicators

    UNIQUE(conversation_id, userid)
);

-- Create indexes for better query performance
CREATE INDEX idx_chat_conversations_room_user ON chat_conversations(roomid, userid);
CREATE INDEX idx_chat_conversations_user ON chat_conversations(userid);
CREATE INDEX idx_chat_conversations_room ON chat_conversations(roomid);
CREATE INDEX idx_chat_conversations_last_message ON chat_conversations(last_message_at DESC);

-- Enable Row Level Security on new chat tables
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_typing_indicators ENABLE ROW LEVEL SECURITY;

-- Apply the function to chat_conversations table
CREATE TRIGGER update_chat_conversations_updated_at
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for chat_conversations table
CREATE POLICY "Users can view their own chat conversations" ON chat_conversations FOR SELECT TO authenticated USING (
    userid = auth.uid()
);
CREATE POLICY "Users can create own chat conversations" ON chat_conversations FOR INSERT TO authenticated WITH CHECK (
    userid = auth.uid()
);
CREATE POLICY "Users can update own chat conversations" ON chat_conversations FOR UPDATE TO authenticated USING (
    userid = auth.uid()
);
CREATE POLICY "Users can delete own chat conversations" ON chat_conversations FOR DELETE TO authenticated USING (
    userid = auth.uid()
);
CREATE POLICY "Admin can view chat conversations in their rooms" ON chat_conversations FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM rooms r WHERE r.id = roomid AND r.adminid = auth.uid()
    )
);
CREATE POLICY "Admin can manage chat conversations in their rooms" ON chat_conversations FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM rooms r WHERE r.id = roomid AND r.adminid = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);
CREATE POLICY "Superadmin can manage all chat conversations" ON chat_conversations FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);

-- RLS Policies for chat_messages table
CREATE POLICY "Users can view messages in their conversations" ON chat_messages FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM chat_conversations cc WHERE cc.id = conversation_id AND cc.userid = auth.uid()
    )
);
CREATE POLICY "Users can send messages in their conversations" ON chat_messages FOR INSERT TO authenticated WITH CHECK (
    senderid = auth.uid() AND
    EXISTS (
        SELECT 1 FROM chat_conversations cc WHERE cc.id = conversation_id AND cc.userid = auth.uid()
    )
);
CREATE POLICY "Users can update own messages" ON chat_messages FOR UPDATE TO authenticated USING (
    senderid = auth.uid()
);
CREATE POLICY "Users can delete own messages" ON chat_messages FOR DELETE TO authenticated USING (
    senderid = auth.uid()
);
CREATE POLICY "Admin can manage messages in their room conversations" ON chat_messages FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM chat_messages cm
        JOIN chat_conversations cc ON cm.conversation_id = cc.id
        JOIN rooms r ON cc.roomid = r.id
        WHERE cm.id = chat_messages.id AND r.adminid = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);
CREATE POLICY "Superadmin can manage all chat messages" ON chat_messages FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);

-- RLS Policies for chat_typing_indicators table
CREATE POLICY "Users can manage their own typing indicators" ON chat_typing_indicators FOR ALL TO authenticated USING (
    userid = auth.uid()
);
CREATE POLICY "Admin can view typing indicators in their rooms" ON chat_typing_indicators FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM chat_typing_indicators cti
        JOIN chat_conversations cc ON cti.conversation_id = cc.id
        JOIN rooms r ON cc.roomid = r.id
        WHERE r.adminid = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);
CREATE POLICY "Superadmin can manage all typing indicators" ON chat_typing_indicators FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);

-- Function to update unread count when a new message is inserted
CREATE OR REPLACE FUNCTION update_unread_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the unread count in the chat_conversations table
    UPDATE chat_conversations
    SET
        unread_count = unread_count + 1,
        last_message_at = NEW.timestamp
    WHERE id = NEW.conversation_id
    AND userid != NEW.senderid; -- Only increment for messages sent by others

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update unread count after inserting a new message
CREATE TRIGGER trigger_update_unread_count
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_unread_count();

-- Function to reset unread count when conversation is viewed
CREATE OR REPLACE FUNCTION reset_unread_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Reset unread count to 0 when updating conversation (e.g., when user views chat)
    UPDATE chat_conversations
    SET unread_count = 0
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(conversation_id_param UUID, user_id_param UUID)
RETURNS void AS $$
BEGIN
    UPDATE chat_messages
    SET is_read = TRUE
    WHERE conversation_id = conversation_id_param
    AND senderid != user_id_param  -- Only mark messages from others as read
    AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create the password_reset_tokens table
CREATE TABLE password_reset_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX idx_password_reset_tokens_used ON password_reset_tokens(used);

-- Enable Row Level Security on password_reset_tokens table
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Apply the function to password_reset_tokens table
CREATE TRIGGER update_password_reset_tokens_updated_at
    BEFORE UPDATE ON password_reset_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for password_reset_tokens table
CREATE POLICY "Service role can manage password reset tokens" ON password_reset_tokens FOR ALL TO service_role USING (true);

-- Create indexes for performance optimization
CREATE INDEX idx_chat_messages_conversation_sender ON chat_messages(conversation_id, senderid);
CREATE INDEX idx_chat_messages_conversation_read ON chat_messages(conversation_id, is_read);

-- END OF CHAT SCHEMA