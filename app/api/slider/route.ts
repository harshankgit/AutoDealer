import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  // Fetch all slider images in order
  try {
    const { data, error } = await supabase
      .from('slider_images')
      .select('id, image_url, alt_text, order_position, created_at')
      .order('order_position', { ascending: true });

    if (error) {
      console.error('Error fetching slider images:', error);
      return Response.json({ error: 'Failed to fetch slider images' }, { status: 500 });
    }

    const response = Response.json({ images: data || [] });

    // Add headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Unexpected error fetching slider images:', error);
    return Response.json({ error: 'Failed to fetch slider images' }, { status: 500 });
  }
}