-- Migration to add password_reset_tokens table to Supabase database

-- Create the password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_used ON password_reset_tokens(used);

-- Enable Row Level Security on password_reset_tokens table
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Apply the function to password_reset_tokens table (assuming update_updated_at_column function exists)
-- If the function doesn't exist, you might need to create it:
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = NOW();
--     RETURN NEW;
-- END;
-- $$ language 'plpgsql';

-- Create trigger to update the updated_at column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers 
                   WHERE trigger_name = 'update_password_reset_tokens_updated_at') THEN
        CREATE TRIGGER update_password_reset_tokens_updated_at 
            BEFORE UPDATE ON password_reset_tokens 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- RLS Policies for password_reset_tokens table
CREATE POLICY "Service role can manage password reset tokens" ON password_reset_tokens FOR ALL TO service_role USING (true);

-- END OF PASSWORD RESET TOKENS MIGRATION