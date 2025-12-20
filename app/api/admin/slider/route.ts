import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verify } from 'jsonwebtoken';
import { uploadImageUrlToStorage } from '@/lib/supabase/storage';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to verify JWT token and get user info
const verifyToken = (token: string) => {
  try {
    // Use your JWT secret to verify the token
    const JWT_SECRET = process.env.JWT_SECRET!;
    const decoded = verify(token, JWT_SECRET) as { userId: string; role: string };
    return { valid: true, userId: decoded.userId, role: decoded.role };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false, userId: null, role: null };
  }
};

export async function GET(request: NextRequest) {
  // Fetch all slider images
  try {
    const { data, error } = await supabase
      .from('slider_images')
      .select('*')
      .eq('active', true) // Only fetch active images
      .order('order_position', { ascending: true });

    if (error) {
      console.error('Error fetching slider images:', error);
      return Response.json({ error: 'Failed to fetch slider images' }, { status: 500 });
    }

    return Response.json({ images: data || [] });
  } catch (error) {
    console.error('Unexpected error fetching slider images:', error);
    return Response.json({ error: 'Failed to fetch slider images' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Check if user is authenticated and has admin/superadmin role
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const tokenData = verifyToken(token);

  if (!tokenData.valid || !tokenData.userId || tokenData.role !== 'superadmin') {
    return Response.json({ error: 'Unauthorized: Super admin access required' }, { status: 403 });
  }

  try {
    const contentType = request.headers.get('content-type');

    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle form data upload (file upload)
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const altText = formData.get('alt_text') as string || '';
      const orderStr = formData.get('order') as string || '0';

      if (!file) {
        return Response.json({ error: 'File is required' }, { status: 400 });
      }

      const order = parseInt(orderStr, 10) || 0;

      // Upload the file directly to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images') // Make sure this bucket exists in your Supabase project
        .upload(`slider/${Date.now()}-${file.name}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading file to storage:', uploadError);
        return Response.json({ error: `Failed to upload image to storage: ${uploadError.message}` }, { status: 500 });
      }

      // Get the public URL for the uploaded file
      const { data: publicData } = supabase.storage
        .from('images')
        .getPublicUrl(uploadData.path);

      const finalImageUrl = publicData.publicUrl;

      // Insert the image record into the database
      const { data, error } = await supabase
        .from('slider_images')
        .insert([{
          image_url: finalImageUrl,
          alt_text: altText,
          order_position: order,
          uploaded_by: tokenData.userId,
          active: true  // Ensure new images are active by default
        }])
        .select()
        .single();

      if (error) {
        console.error('Error inserting slider image:', error);

        // Clean up: delete the uploaded file if DB insertion fails
        try {
          await supabase.storage
            .from('images')
            .remove([uploadData.path]);
        } catch (cleanupError) {
          console.error('Error cleaning up failed upload:', cleanupError);
        }

        return Response.json({ error: `Failed to save slider image: ${error.message}` }, { status: 500 });
      }

      return Response.json({ image: data }, { status: 201 });
    } else {
      // Handle JSON request (for backward compatibility or other use cases)
      let body;
      if (contentType && contentType.includes('application/json')) {
        body = await request.json();
      } else {
        // If not JSON, try to parse as text and then JSON
        const text = await request.text();
        try {
          body = JSON.parse(text);
        } catch (e) {
          return Response.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }
      }

      const { image_url, alt_text = '', order = 0 } = body;

      if (!image_url) {
        return Response.json({ error: 'Image URL is required' }, { status: 400 });
      }

      // If the image_url is a blob URL, upload it to Supabase storage first
      let finalImageUrl = image_url;
      if (image_url.startsWith('blob:')) {
        try {
          finalImageUrl = await uploadImageUrlToStorage(image_url, 'slider');
          if (!finalImageUrl) {
            return Response.json({ error: 'Failed to upload image to storage' }, { status: 500 });
          }
        } catch (uploadError) {
          console.error('Error uploading image to storage:', uploadError);
          return Response.json({ error: `Failed to upload image to storage: ${uploadError}` }, { status: 500 });
        }
      }

      const { data, error } = await supabase
        .from('slider_images')
        .insert([{
          image_url: finalImageUrl,
          alt_text,
          order_position: order,
          uploaded_by: tokenData.userId,
          active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('Error uploading slider image:', error);
        return Response.json({ error: `Failed to upload slider image: ${error.message}` }, { status: 500 });
      }

      return Response.json({ image: data }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Unexpected error uploading slider image:', error);
    return Response.json({ error: `Failed to upload slider image: ${error.message || error}` }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // Check if user is authenticated and has admin/superadmin role
  const authHeader = request.headers.get('authorization');
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const tokenData = verifyToken(token);

  if (!tokenData.valid || !tokenData.userId || tokenData.role !== 'superadmin') {
    return Response.json({ error: 'Unauthorized: Super admin access required' }, { status: 403 });
  }

  if (!id) {
    return Response.json({ error: 'Image ID is required' }, { status: 400 });
  }

  try {
    // First get the image record to access the image URL for deletion from storage
    const { data: imageData, error: fetchError } = await supabase
      .from('slider_images')
      .select('image_url')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching slider image for deletion:', fetchError);
      return Response.json({ error: 'Failed to find slider image' }, { status: 500 });
    }

    // Delete the image from storage if it's a Supabase storage URL
    if (imageData && imageData.image_url && imageData.image_url.includes('supabase.co')) {
      try {
        // Extract the file path from the Supabase storage URL
        // Supabase URLs are typically in the format: https://[project-ref].supabase.co/storage/v1/object/public/[bucket-name]/[file-path]
        const urlParts = imageData.image_url.split('/');
        const publicIndex = urlParts.indexOf('public');
        if (publicIndex !== -1 && publicIndex + 1 < urlParts.length) {
          const bucketName = urlParts[publicIndex + 1];
          const filePath = urlParts.slice(publicIndex + 2).join('/');

          if (filePath) {
            const { deleteImageFromStorage } = await import('@/lib/supabase/storage');
            await deleteImageFromStorage(filePath);
          }
        }
      } catch (storageError) {
        console.error('Error deleting image from storage:', storageError);
        // Don't fail the request if storage deletion fails, just log it
      }
    }

    // Delete the record from the database
    const { error } = await supabase
      .from('slider_images')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting slider image:', error);
      return Response.json({ error: 'Failed to delete slider image' }, { status: 500 });
    }

    return Response.json({ message: 'Slider image deleted successfully' });
  } catch (error) {
    console.error('Unexpected error deleting slider image:', error);
    return Response.json({ error: 'Failed to delete slider image' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // Check if user is authenticated and has admin/superadmin role
  const authHeader = request.headers.get('authorization');
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const tokenData = verifyToken(token);

  if (!tokenData.valid || !tokenData.userId || tokenData.role !== 'superadmin') {
    return Response.json({ error: 'Unauthorized: Super admin access required' }, { status: 403 });
  }

  if (!id) {
    return Response.json({ error: 'Image ID is required' }, { status: 400 });
  }

  try {
    const { order, alt_text, active } = await request.json();

    const updateData: any = {};
    if (order !== undefined) updateData.order_position = order;
    if (alt_text !== undefined) updateData.alt_text = alt_text;
    if (active !== undefined) updateData.active = active;

    const { data, error } = await supabase
      .from('slider_images')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating slider image:', error);
      return Response.json({ error: 'Failed to update slider image' }, { status: 500 });
    }

    return Response.json({ image: data });
  } catch (error) {
    console.error('Unexpected error updating slider image:', error);
    return Response.json({ error: 'Failed to update slider image' }, { status: 500 });
  }
}