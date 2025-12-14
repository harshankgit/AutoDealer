import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth';
import { getSupabaseServiceRole } from '@/lib/supabase/server';
import { fileServices } from '@/lib/supabase/services/generalServices';

// Initialize Supabase client for storage operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken: any = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decodedToken.userId;

    // Fetch user details from Supabase
    const { data: userData, error: userError } = await getSupabaseServiceRole()
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
        updated_at,
        last_login
      `)
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        phone: userData.phone || null,
        location: userData.location || null,
        profile_image: userData.profile_image || null,
        scanner_image: userData.scanner_image || null,
        role: userData.role || 'user',
        created_at: userData.created_at,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken: any = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decodedToken.userId;
    const { username, phone, location } = await request.json();

    // Validate required fields
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Update user profile in Supabase (email is not updated as it's not editable)
    const { error: updateError } = await getSupabaseServiceRole()
      .from('users')
      .update({
        username,
        phone: phone || null,
        location: location || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
    }

    // Fetch the user data again to get the unchanged email
    const { data: userData, error: userError } = await getSupabaseServiceRole()
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
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching updated user data:', userError);
      return NextResponse.json({ error: 'Failed to fetch updated user data' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        phone: userData.phone || null,
        location: userData.location || null,
        profile_image: userData.profile_image || null,
        scanner_image: userData.scanner_image || null,
        role: userData.role || 'user',
        created_at: userData.created_at,
        last_login: userData.last_login || 'N/A',
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken: any = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decodedToken.userId;
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (image.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Get file buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}_${randomString}_${image.name}`;
    const filePath = `profile_images/${fileName}`;

    // Create a service role Supabase client for storage operations
    const serviceRoleUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // This should be set in your environment variables

    if (!serviceRoleUrl || !serviceRoleKey) {
      console.error('Missing service role environment variables for storage');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const serviceSupabase = createClient(serviceRoleUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    });

    // Upload to Supabase storage using service role
    const { data: uploadData, error: uploadError } = await serviceSupabase
      .storage
      .from('profile-images') // Using a dedicated bucket for profile images
      .upload(filePath, buffer, {
        contentType: image.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading image to Supabase storage:', uploadError);
      console.error('Upload error details:', {
        message: uploadError.message,
        status: (uploadError as any).status || 'unknown',
        name: uploadError.name
      });
      return NextResponse.json({ error: 'Failed to upload image', details: uploadError.message }, { status: 500 });
    }

    // Get public URL using service role
    const { data: { publicUrl } } = serviceSupabase
      .storage
      .from('profile-images')
      .getPublicUrl(filePath);

    // Update user profile with new image URL
    const { error: updateError } = await getSupabaseServiceRole()
      .from('users')
      .update({
        profile_image: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user profile with image URL:', updateError);

      // Attempt to delete the uploaded file if database update fails
      await serviceSupabase.storage.from('profile-images').remove([filePath]);

      return NextResponse.json({ error: 'Failed to update profile with image' }, { status: 500 });
    }

    // Fetch updated user data
    const { data: userData, error: userError } = await getSupabaseServiceRole()
      .from('users')
      .select('id, username, email, phone, location, profile_image, scanner_image, role, created_at, last_login')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching updated user data:', userError);
      return NextResponse.json({ error: 'Failed to fetch updated user data' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Profile image updated successfully',
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        phone: userData.phone || null,
        location: userData.location || null,
        profile_image: userData.profile_image || null,
        scanner_image: userData.scanner_image || null,
        role: userData.role || 'user',
        created_at: userData.created_at,
        last_login: userData.last_login || 'N/A',
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Profile image upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}