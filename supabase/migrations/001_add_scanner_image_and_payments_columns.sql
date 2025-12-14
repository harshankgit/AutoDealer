-- Add scanner_image column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS scanner_image TEXT;

-- Add missing columns to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_receipt_image TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_details JSONB;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS admin_scanner_image TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS expected_delivery_date DATE;

-- Update the booking_id column name if it doesn't match
ALTER TABLE payments RENAME COLUMN bookingid TO booking_id;
ALTER TABLE payments RENAME COLUMN userid TO user_id;