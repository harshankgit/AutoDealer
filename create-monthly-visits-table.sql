-- Create monthly_visits table for tracking website visits by month
CREATE TABLE IF NOT EXISTS monthly_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year_month VARCHAR(7) NOT NULL UNIQUE, -- Format: 'YYYY-MM'
    month_name VARCHAR(20) NOT NULL,       -- Format: 'Jan 2024'
    visit_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE monthly_visits ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role access
CREATE POLICY "Allow service role access to monthly_visits" ON monthly_visits
FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_monthly_visits_year_month ON monthly_visits(year_month);
CREATE INDEX IF NOT EXISTS idx_monthly_visits_month_name ON monthly_visits(month_name);