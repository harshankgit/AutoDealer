-- Create slider_images table
CREATE TABLE IF NOT EXISTS slider_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    order_position INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    uploaded_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_slider_images_active ON slider_images(active);
CREATE INDEX IF NOT EXISTS idx_slider_images_order ON slider_images(order_position);

-- Enable Row Level Security (RLS)
ALTER TABLE slider_images ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Only authenticated users can read active slider images
CREATE POLICY "Allow read for active slider images" ON slider_images
FOR SELECT TO authenticated, anon
USING (active = true);

-- Only authenticated users with admin role can modify slider images
CREATE POLICY "Allow admin full access to slider images" ON slider_images
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'superadmin')
    )
);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_slider_images_updated_at 
    BEFORE UPDATE ON slider_images 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();