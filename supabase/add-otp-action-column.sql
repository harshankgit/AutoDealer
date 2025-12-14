-- Add action column to otps table to support different types of OTPs
ALTER TABLE otps ADD COLUMN IF NOT EXISTS action VARCHAR(50) DEFAULT 'registration';