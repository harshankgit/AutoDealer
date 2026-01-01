import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  // Initialize Supabase client with error checking
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    return Response.json({ error: 'Server configuration error: Missing Supabase URL' }, { status: 500 });
  }

  if (!supabaseKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    return Response.json({ error: 'Server configuration error: Missing Supabase key' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch all active slider images in order
  try {
    const { data, error, count } = await supabase
      .from('slider_images')
      .select('id, image_url, alt_text, order_position, created_at', { count: 'exact' })
      .eq('active', true) // Only fetch active images
      .order('order_position', { ascending: true });

    if (error) {
      console.error('Error fetching slider images:', error);
      return Response.json({ error: `Failed to fetch slider images: ${error.message}` }, { status: 500 });
    }

    console.log(`Fetched ${data?.length || 0} slider images, total count: ${count}`);

    const response = Response.json({ images: data || [], count: count || 0 });

    // Add headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error: any) {
    console.error('Unexpected error fetching slider images:', error);
    return Response.json({ error: `Unexpected error: ${error.message}` }, { status: 500 });
  }
}