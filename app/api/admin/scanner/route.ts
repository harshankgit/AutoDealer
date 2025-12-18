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
    const formUserId = formData.get('userId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Scanner image is required' },
        { status: 400 }
      );
    }

    // Use form userId if provided, otherwise use the one from the token (for admin uploads)
    const userId = formUserId || decoded?.userId;

    if (!userId) {
      console.error('User ID is required. Form data keys:', Array.from(formData.keys()));
      // Include the form data keys in the error for debugging
      return NextResponse.json(
        {
          error: 'User ID is required. Please include "userId" field in form data or use a valid admin token.',
          receivedFormDataKeys: Array.from(formData.keys()),
          exampleUsage: 'Form data should contain "scannerImage" and "userId" fields, or use a token with user ID'
        },
        { status: 400 }
      );
    }

    // Verify that the user exists
    const user = await userServices.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Upload the image to Supabase storage
    const supabase = getSupabaseServiceRole();
    const fileBuffer = await file.arrayBuffer();
    const fileName = `${Date.now()}-${userId}-${file.name}`;

    // First, verify if the bucket exists by attempting to upload
    // Note: You need to create the 'scanner-uploads' bucket in your Supabase dashboard first
    const { data, error } = await supabase
      .storage
      .from('scanner-uploads')
      .upload(fileName, fileBuffer, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading scanner image:', error);
      // Check if this is a bucket not found error by checking the error message
      if (error.name === 'HttpError' && (error as any).status === 404) {
        return NextResponse.json(
          { error: 'Storage bucket not found. Please create a bucket named "scanner-uploads" in your Supabase dashboard.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to upload scanner image: ' + error.message },
        { status: 500 }
      );
    }

    // Get the public URL for the uploaded image
    const { data: urlData } = supabase
      .storage
      .from('scanner-uploads')
      .getPublicUrl(fileName);
      
    if (!urlData?.publicUrl) {
      return NextResponse.json(
        { error: 'Failed to generate public URL for scanner image' },
        { status: 500 }
      );
    }

    // Update the user's scanner_image field in the database
    const updatedUser = await userServices.updateUserScannerImage(userId, urlData.publicUrl);
    
    if (!updatedUser) {
      // Clean up the uploaded file if DB update fails
      await supabase.storage.from('scanner-uploads').remove([fileName]);
      return NextResponse.json(
        { error: 'Failed to update user with scanner image' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Scanner image uploaded and linked to user successfully',
      scannerImageUrl: urlData.publicUrl,
      userId: updatedUser.id
    }, { status: 200 });

  } catch (error: any) {
    console.error('Upload scanner image error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Allow GET requests to fetch a user's scanner image
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

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      console.error('User ID is required for GET request');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await userServices.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      userId: user.id,
      scannerImageUrl: user.scanner_image
    }, { status: 200 });
  } catch (error: any) {
    console.error('Get scanner image error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}