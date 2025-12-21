import { NextRequest } from 'next/server';
import { logApi } from '@/lib/apiLogger';
import { createClient } from '@supabase/supabase-js';
import { verify } from 'jsonwebtoken';

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

// Helper function to get client IP
const getClientIp = (request: NextRequest): string => {
  return request.headers.get('x-forwarded-for') ||
         request.headers.get('x-real-ip') ||
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
    // Get all scanner images with admin information
    const { data: scannerData, error: scannerError } = await supabase
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

    if (scannerError) {
      console.error('Error fetching scanner images for room-wise stats:', scannerError);
      await logApiCall(request, 500, userId, startTime, scannerError.message);
      return Response.json({ error: 'Failed to fetch scanner images for room-wise statistics' }, { status: 500 });
    }

    // Get all rooms
    const { data: roomsData, error: roomsError } = await supabase
      .from('rooms')
      .select('id, name, location, adminid')
      .order('name', { ascending: true });

    if (roomsError) {
      console.error('Error fetching rooms for room-wise scanner stats:', roomsError);
      await logApiCall(request, 500, userId, startTime, roomsError.message);
      return Response.json({ error: 'Failed to fetch rooms for room-wise scanner statistics' }, { status: 500 });
    }

    // Get admin information for rooms
    const adminIds = Array.from(new Set(roomsData.map(room => room.adminid).filter(id => id)));
    let adminMap: Record<string, any> = {};
    
    if (adminIds.length > 0) {
      const { data: adminsData, error: adminsError } = await supabase
        .from('users')
        .select('id, username, email')
        .in('id', adminIds);
        
      if (!adminsError && adminsData) {
        adminMap = adminsData.reduce((acc, admin) => {
          acc[admin.id] = admin;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    // Create room map for quick lookup
    const roomMap = roomsData.reduce((acc, room) => {
      acc[room.id] = {
        ...room,
        admin_info: adminMap[room.adminid] || null
      };
      return acc;
    }, {} as Record<string, any>);

    // Group scanner images by room
    const scannersByRoom: Record<string, any[]> = {};
    scannerData.forEach(scanner => {
      const roomId = scanner.roomid;
      if (roomId) {
        if (!scannersByRoom[roomId]) {
          scannersByRoom[roomId] = [];
        }
        scannersByRoom[roomId].push(scanner);
      }
    });

    // Calculate statistics for each room
    const roomScannerStats = roomsData.map(room => {
      const roomScanners = scannersByRoom[room.id] || [];
      const totalScanners = roomScanners.length;
      
      // Get unique admins who uploaded to this room
      const uniqueAdminIds = Array.from(new Set(roomScanners.map(s => s.adminid)));
      
      return {
        room_id: room.id,
        room_name: room.name,
        room_location: room.location,
        admin_info: adminMap[room.adminid] || null,
        total_scanners: totalScanners,
        unique_admins: uniqueAdminIds.length,
        last_uploaded: roomScanners.length > 0 
          ? roomScanners[0].uploaded_at 
          : null,
        scanners: roomScanners.map(scanner => ({
          id: scanner.id,
          admin_name: (scanner.users as any)?.username || 'Unknown Admin',
          admin_email: (scanner.users as any)?.email || 'Unknown Email',
          image_url: scanner.image_url,
          uploaded_at: scanner.uploaded_at
        }))
      };
    });

    const response = Response.json({
      room_scanner_stats: roomScannerStats,
      total_rooms: roomsData.length,
      total_scanners: scannerData.length
    });

    await logApiCall(request, response.status, userId, startTime);
    return response;
  } catch (error: any) {
    console.error('Unexpected error fetching room-wise scanner statistics:', error);
    await logApiCall(request, 500, userId, startTime, error.message);
    return Response.json({ error: 'Failed to fetch room-wise scanner statistics' }, { status: 500 });
  }
}