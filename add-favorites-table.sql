-- Create favorites table to store user car preferences
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, car_id)
);

-- Enable Row Level Security for favorites table
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for favorites table
CREATE POLICY "Users can view own favorites" ON favorites
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add own favorites" ON favorites
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
FOR DELETE USING (auth.uid() = user_id);

-- Update the users table to remove the favorites column if it exists as an array
ALTER TABLE users DROP COLUMN IF EXISTS favorites CASCADE;