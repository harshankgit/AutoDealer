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

  if (!tokenData.valid || !tokenData.userId) {
    await logApiCall(request, 401, userId, startTime, 'Unauthorized');
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Allow superadmins to access all bookings, admins to access bookings for their cars
  if (tokenData.role !== 'superadmin' && tokenData.role !== 'admin') {
    await logApiCall(request, 403, userId, startTime, 'Forbidden: Admin or superadmin access required');
    return Response.json({ error: 'Unauthorized: Admin or superadmin access required' }, { status: 403 });
  }

  try {
    // Build query based on user role
    let query = getSupabaseServiceRole()
      .from('bookings')
      .select(`
        id,
        carid,
        userid,
        roomid,
        start_date,
        end_date,
        total_price,
        status,
        created_at,
        updated_at,
        users:userid(username, email),
        cars:carid(title, brand, model, year, price)
      `)
      .order('created_at', { ascending: false });

    // If user is admin (not superadmin), restrict to bookings for their cars
    if (tokenData.role === 'admin') {
      // Get the admin's rooms to find their cars
      const { data: roomsData, error: roomsError } = await getSupabaseServiceRole()
        .from('rooms')
        .select('id')
        .eq('adminid', tokenData.userId);

      if (roomsError || !roomsData) {
        console.error('Error fetching rooms for admin:', roomsError);
        await logApiCall(request, 500, userId, startTime, roomsError?.message || 'Failed to fetch rooms');
        return Response.json({ error: 'Failed to fetch bookings' }, { status: 500 });
      }

      if (roomsData.length === 0) {
        // No rooms for this admin, return empty result
        const response = Response.json({
          bookings: [],
          count: 0
        });
        await logApiCall(request, response.status, userId, startTime);
        return response;
      }

      // Get cars in admin's rooms
      const { data: carsData, error: carsError } = await getSupabaseServiceRole()
        .from('cars')
        .select('id')
        .in('roomid', roomsData.map(room => room.id));

      if (carsError || !carsData) {
        console.error('Error fetching cars for admin:', carsError);
        await logApiCall(request, 500, userId, startTime, carsError?.message || 'Failed to fetch cars');
        return Response.json({ error: 'Failed to fetch bookings' }, { status: 500 });
      }

      if (carsData.length === 0) {
        // No cars in admin's rooms, return empty result
        const response = Response.json({
          bookings: [],
          count: 0
        });
        await logApiCall(request, response.status, userId, startTime);
        return response;
      }

      // Filter bookings to only include those for admin's cars
      query = query.in('carid', carsData.map(car => car.id));
    }

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      await logApiCall(request, 500, userId, startTime, error.message);
      return Response.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    // Get room information for all bookings
    const roomIds = Array.from(new Set(data.map(booking => booking.roomid).filter(id => id)));
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

    // Transform the data to match the expected format
    const transformedBookings = data.map(booking => ({
      id: booking.id,
      carid: booking.carid,
      userid: booking.userid,
      roomid: booking.roomid,
      customer_name: (booking.users as any)?.username || 'Unknown Customer',
      car_title: (booking.cars as any)?.title || 'Unknown Car',
      room_name: roomMap[booking.roomid as string]?.name || 'Unknown Room',
      booking_date: booking.created_at,
      status: booking.status,
      total_amount: booking.total_price,
      car: booking.cars,
      user: booking.users,
      room: roomMap[booking.roomid as string] || null
    }));

    const response = Response.json({
      bookings: transformedBookings,
      count: transformedBookings.length
    });

    await logApiCall(request, response.status, userId, startTime);
    return response;
  } catch (error: any) {
    console.error('Unexpected error fetching bookings:', error);
    await logApiCall(request, 500, userId, startTime, error.message);
    return Response.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}