import { NextResponse } from 'next/server';
import { fileServices } from '@/lib/supabase/services/generalServices';
import { verifyToken } from '@/lib/auth';
import { getSupabaseServiceRole } from '@/lib/supabase/server';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for car images

export async function POST(request: Request) {
  try {
    // Verify auth token
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken: any = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[]; // JavaScript File type, not the service interface

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Validate number of files
    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 images allowed' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceRole();
    const uploadedFileUrls = [];
    const uploadedFileIds = [];

    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'File size exceeds 10MB limit' },
          { status: 400 }
        );
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Only image files are allowed' },
          { status: 400 }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileName = `${timestamp}_${randomString}_${file.name}`;
      const folderName = 'car-images';

      // Use a specific bucket name - 'images' based on the storage.ts configuration
      const bucketName = 'images';
      const uploadResult = await supabase
        .storage
        .from(bucketName)
        .upload(`${folderName}/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadResult.error) {
        console.error('First upload attempt failed:', uploadResult.error);

        // Try 'public' bucket as fallback
        const fallbackUploadResult = await supabase
          .storage
          .from('public')
          .upload(`${folderName}/${fileName}`, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (fallbackUploadResult.error) {
          console.error('Fallback upload also failed:', fallbackUploadResult.error);
          return NextResponse.json(
            { error: `Failed to upload file: ${uploadResult.error.message} and fallback also failed: ${fallbackUploadResult.error.message}` },
            { status: 500 }
          );
        } else {
          // Fallback succeeded
          // Get public URL for the uploaded file from 'public' bucket
          const { data: publicUrlData } = supabase
            .storage
            .from('public')
            .getPublicUrl(`${folderName}/${fileName}`);

          if (publicUrlData?.publicUrl) {
            // Save file metadata to database using Supabase service
            const fileDoc = await fileServices.createFile({
              name: fileName,
              path: `public/${folderName}/${fileName}`, // Store relative path in the DB
              size: file.size,
              type: file.type,
              uploaded_by: decodedToken.userId,
            });

            if (fileDoc) {
              uploadedFileIds.push(fileDoc.id);
              uploadedFileUrls.push(publicUrlData.publicUrl);
            }
          }
          continue; // Continue to next file
        }
      } else {
        // First upload succeeded
        // Get public URL for the uploaded file
        const { data: publicUrlData } = supabase
          .storage
          .from(bucketName)
          .getPublicUrl(`${folderName}/${fileName}`);

        if (publicUrlData?.publicUrl) {
          // Save file metadata to database using Supabase service
          const fileDoc = await fileServices.createFile({
            name: fileName,
            path: `${folderName}/${fileName}`, // Store relative path in the DB
            size: file.size,
            type: file.type,
            uploaded_by: decodedToken.userId,
          });

          if (fileDoc) {
            uploadedFileIds.push(fileDoc.id);
            uploadedFileUrls.push(publicUrlData.publicUrl);
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Car images uploaded successfully',
      fileIds: uploadedFileIds,
      fileUrls: uploadedFileUrls,
    });
  } catch (error: any) {
    console.error('Car image upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload car images' },
      { status: 500 }
    );
  }
}