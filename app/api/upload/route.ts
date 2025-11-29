import { NextResponse } from 'next/server';
import { fileServices } from '@/lib/supabase/services/generalServices';
import { verifyToken } from '@/lib/auth';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

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
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Determine file type
    let fileType = 'other';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    else if (file.type === 'application/pdf') fileType = 'pdf';
    else if (file.type.startsWith('audio/')) fileType = 'audio';
    else if (file.type.includes('document') || file.type.includes('word') || file.type.includes('sheet')) fileType = 'document';

    // Validate file types
    const allowedTypes = ['image', 'video', 'pdf', 'audio', 'document'];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'File type not supported. Allowed: images, videos, PDFs, audio, documents' },
        { status: 400 }
      );
    }

    // Get file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}_${randomString}_${file.name}`;

    // Save file to database using Supabase
    const fileDoc = await fileServices.createFile({
      name: fileName,
      path: `/uploads/${fileName}`, // This would typically point to a storage system
      size: file.size,
      type: file.type,
      uploaded_by: decodedToken.userId,
    });

    if (!fileDoc) {
      return NextResponse.json(
        { error: 'Failed to save file record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'File uploaded successfully',
      fileId: fileDoc.id,
      fileName: file.name,
      fileType,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
