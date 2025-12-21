import { NextRequest } from 'next/server';
import { logApi } from '@/lib/apiLogger';
import { verify } from 'jsonwebtoken';
import { getSupabaseServiceRole } from '@/lib/supabase/server';

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

// Helper function to get client IP
const getClientIp = (request: NextRequest): string => {
  return request.headers.get('x-forwarded-for') ||
         request.headers.get('x-real-ip') ||
         request.headers.get('x-client-ip') ||
         'unknown';
};

// Helper function to log the API request
const logApiCall = async (request: NextRequest, statusCode: number, userId: string | null, startTime: number, error?: string) => {
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const responseTime = Date.now() - startTime;

  await logApi({
    endpoint: request.nextUrl.pathname,
    method: request.method,
    statusCode,
    responseTime,
    userId,
    requestPayload: null,
    responsePayload: null,
    errorMessage: error || null,
    req: request,
  });
};

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | null = null;
  
  // Check if user is authenticated and has superadmin role
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    await logApiCall(request, 401, userId, startTime, 'Unauthorized');
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const tokenData = verifyToken(token);

  userId = tokenData.userId || null;

  if (!tokenData.valid || !tokenData.userId || tokenData.role !== 'superadmin') {
    await logApiCall(request, 403, userId, startTime, 'Forbidden: Super admin access required');
    return Response.json({ error: 'Unauthorized: Super admin access required' }, { status: 403 });
  }

  try {
    // Get all scanner images with admin and room information
    const { data, error } = await getSupabaseServiceRole()
      .from('scanner_images')
      .select(`
        id,
        adminid,
        roomid,
        image_url,
        uploaded_at,
        users:adminid(username, email)
      `)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching scanner images:', error);
      await logApiCall(request, 500, userId, startTime, error.message);
      return Response.json({ error: 'Failed to fetch scanner images' }, { status: 500 });
    }

    // Get room information for all scanner images
    const roomIds = Array.from(new Set(data.map(scanner => scanner.roomid).filter(id => id)));
    let roomMap: Record<string, any> = {};

    if (roomIds.length > 0) {
      const { data: roomsData, error: roomsError } = await getSupabaseServiceRole()
        .from('rooms')
        .select('id, name, location')
        .in('id', roomIds);

      if (!roomsError && roomsData) {
        roomMap = roomsData.reduce((acc, room) => {
          acc[room.id] = room;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    // Transform the data to include room information
    const transformedScanners = data.map(scanner => ({
      id: scanner.id,
      adminid: scanner.adminid,
      roomid: scanner.roomid,
      image_url: scanner.image_url,
      uploaded_at: scanner.uploaded_at,
      admin_username: (scanner.users as any)?.username || 'Unknown Admin',
      room_name: roomMap[scanner.roomid as string]?.name || 'Unknown Room',
      admin: scanner.users,
      room: roomMap[scanner.roomid as string] || null
    }));

    const response = Response.json({
      scanners: transformedScanners,
      count: transformedScanners.length
    });
    
    await logApiCall(request, response.status, userId, startTime);
    return response;
  } catch (error: any) {
    console.error('Unexpected error fetching scanner images:', error);
    await logApiCall(request, 500, userId, startTime, error.message);
    return Response.json({ error: 'Failed to fetch scanner images' }, { status: 500 });
  }
}