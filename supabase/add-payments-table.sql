BEGIN;

-- Drop the table if it exists (clean start)
DROP TABLE IF EXISTS payments CASCADE;

-- Create payments table
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bookingid UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_receipt_image TEXT, -- URL/path to receipt
    payment_method VARCHAR(50), -- e.g., 'cash', 'upi'
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending','approved','rejected','completed')),
    payment_details JSONB, -- extra info like UPI ID
    admin_notes TEXT,
    admin_scanner_image TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    expected_delivery_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_payments_bookingid ON payments(bookingid);
CREATE INDEX idx_payments_userid ON payments(userid);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_approved_by ON payments(approved_by);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own payments" ON payments
FOR SELECT TO authenticated
USING (userid = auth.uid());

CREATE POLICY "Users can create own payments" ON payments
FOR INSERT TO authenticated
WITH CHECK (userid = auth.uid());

-- Admin policies
CREATE POLICY "Admin can view payments for their rooms" ON payments
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM bookings b
        JOIN cars c ON b.carid = c.id
        JOIN rooms r ON c.roomid = r.id
        WHERE b.id = payments.bookingid
        AND r.adminid = auth.uid()
    )
);

CREATE POLICY "Admin can update payments for their rooms" ON payments
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM bookings b
        JOIN cars c ON b.carid = c.id
        JOIN rooms r ON c.roomid = r.id
        WHERE b.id = payments.bookingid
        AND r.adminid = auth.uid()
    )
);

-- Superadmin can manage all payments
CREATE POLICY "Superadmin can manage all payments" ON payments
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);

-- Trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' OR TG_OP = 'INSERT' THEN
        IF TG_OP = 'UPDATE' OR TG_OP = 'INSERT' THEN
            NEW.updated_at = NOW();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to payments table
CREATE TRIGGER trigger_update_payments_updated_at
BEFORE INSERT OR UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMIT;
