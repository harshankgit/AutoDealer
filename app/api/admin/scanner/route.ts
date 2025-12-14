import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { userServices } from '@/lib/supabase/services/userService';
import { getSupabaseServiceRole } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Parse the form data
    const formData = await req.formData();
    const file = formData.get('scannerImage') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Scanner image is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceRole();
    const fileBuffer = await file.arrayBuffer();
    const fileName = `scanner/${decoded.userId}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    const { data, error } = await supabase
      .storage
      .from('scanner-uploads')
      .upload(fileName, fileBuffer, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading scanner image:', error);
      return NextResponse.json(
        { error: 'Failed to upload scanner image to storage' },
        { status: 500 }
      );
    }

    const publicUrl = supabase.storage
      .from('scanner-uploads')
      .getPublicUrl(fileName).data.publicUrl;

    if (!publicUrl) {
      return NextResponse.json(
        { error: 'Failed to get public URL for uploaded image' },
        { status: 500 }
      );
    }

    // Update the user's scanner image
    const updateResult = await userServices.updateUserScannerImage(decoded.userId, publicUrl);

    if (!updateResult) {
      return NextResponse.json(
        { error: 'Failed to update user scanner image' },
        { status: 500 }
      );
    }

    // Fetch the complete user data to return a full user object
    const supabaseClient = getSupabaseServiceRole();
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select(`
        id,
        username,
        email,
        phone,
        location,
        profile_image,
        scanner_image,
        role,
        created_at,
        last_login
      `)
      .eq('id', decoded.userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching updated user data:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch updated user data' },
        { status: 500 }
      );
    }

    const userForContext = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      phone: userData.phone || undefined,
      location: userData.location || undefined,
      profile_image: userData.profile_image || undefined,
      scanner_image: userData.scanner_image || undefined,
      created_at: userData.created_at,
      last_login: userData.last_login || undefined
    };

    return NextResponse.json({
      message: 'Scanner image uploaded and updated successfully',
      scannerImageUrl: publicUrl,
      user: userForContext
    }, { status: 200 });

  } catch (error: any) {
    console.error('Upload user scanner image error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get the user's scanner image
    const user = await userServices.getUserById(decoded.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      scannerImageUrl: user.scanner_image,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        favorites: user.favorites,
        scanner_image: user.scanner_image || undefined,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      message: 'Scanner image retrieved successfully'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Get user scanner image error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}