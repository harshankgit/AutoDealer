import { NextResponse } from 'next/server';
import { fileServices } from '@/lib/supabase/services/generalServices';
import { chatServices } from '@/lib/supabase/services/generalServices';
import { verifyToken } from '@/lib/auth';
import { getSupabaseServiceRole } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Find the file record in the database
    const file = await fileServices.getFileById(params.id);
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Get Supabase client with service role to access storage
    const supabase = getSupabaseServiceRole();

    // Extract bucket name from the path (format: bucket-name/folder/filename)
    const pathParts = file.path.split('/');
    const bucketName = pathParts[0];
    const filePath = pathParts.slice(1).join('/'); // Reconstruct the file path without bucket name

    // Try to get the file from Supabase Storage
    const { data, error } = await supabase
      .storage
      .from(bucketName) // Use the bucket from the stored path
      .download(filePath); // Use the file path without bucket name

    if (error) {
      console.error('Error downloading file from storage:', error);
      return NextResponse.json(
        { error: 'File not found in storage' },
        { status: 404 }
      );
    }

    // Create a response with the file content
    const blob = await data.arrayBuffer();
    const buffer = Buffer.from(blob);

    // Set the appropriate content type based on the file
    const contentType = file.type || 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': file.size.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error: any) {
    console.error('Get file error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve file' },
      { status: 500 }
    );
  }
}