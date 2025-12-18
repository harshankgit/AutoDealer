import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get room ID from params
    const roomId = params.id;

    if (!roomId) {
      return Response.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Fetch room details to get admin ID
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('adminid')
      .eq('id', roomId)
      .single();

    if (roomError || !roomData) {
      return Response.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Fetch admin user details to get scanner image
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('scanner_image')
      .eq('id', roomData.adminid)
      .single();

    if (userError || !userData) {
      return Response.json(
        { error: 'Admin not found or scanner image not available' },
        { status: 404 }
      );
    }

    // Return the scanner image URL
    return Response.json({
      scanner_image: userData.scanner_image,
    });
  } catch (error) {
    console.error('Error fetching room admin scanner:', error);
    return Response.json(
      { error: 'Failed to fetch room admin scanner' },
      { status: 500 }
    );
  }
}