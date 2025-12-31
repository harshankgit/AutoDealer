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
  let userRole: string | null = null;

  // Check if user is authenticated and has admin or superadmin role
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For unauthenticated users, return empty data instead of error
    const response = Response.json({
      monthlyBookings: [],
      totalBookings: 0,
      totalRevenue: 0
    });
    await logApiCall(request, response.status, userId, startTime);
    return response;
  }

  const token = authHeader.substring(7);
  const tokenData = verifyToken(token);

  userId = tokenData.userId || null;
  userRole = tokenData.role;

  if (!tokenData.valid || !tokenData.userId) {
    // For invalid tokens, return empty data instead of error
    const response = Response.json({
      monthlyBookings: [],
      totalBookings: 0,
      totalRevenue: 0
    });
    await logApiCall(request, 200, userId, startTime); // Log as success with 200
    return response;
  }

  // Allow superadmins and admins to access booking data
  if (tokenData.role !== 'superadmin' && tokenData.role !== 'admin') {
    await logApiCall(request, 403, userId, startTime, 'Forbidden: Admin or superadmin access required');
    return Response.json({ error: 'Unauthorized: Admin or superadmin access required' }, { status: 403 });
  }

  try {
    // Build query based on user role
    let query = getSupabaseServiceRole()
      .from('bookings')
      .select('created_at, total_price, status')
      .gte('created_at', new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString()) // Last 12 months
      .order('created_at', { ascending: true });

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
        return Response.json({ error: 'Failed to fetch booking data' }, { status: 500 });
      }

      if (roomsData.length === 0) {
        // No rooms for this admin, return empty result
        const response = Response.json({
          monthlyBookings: [],
          totalBookings: 0,
          totalRevenue: 0
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
        return Response.json({ error: 'Failed to fetch booking data' }, { status: 500 });
      }

      if (carsData.length === 0) {
        // No cars in admin's rooms, return empty result
        const response = Response.json({
          monthlyBookings: [],
          totalBookings: 0,
          totalRevenue: 0
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
      console.error('Error fetching booking data:', error);
      await logApiCall(request, 500, userId, startTime, error.message);
      return Response.json({ error: 'Failed to fetch booking data' }, { status: 500 });
    }

    // Process the data to group by month
    const monthlyBookingsMap: Record<string, { count: number; revenue: number; pending: number; confirmed: number; completed: number }> = {};

    data.forEach(booking => {
      const date = new Date(booking.created_at);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyBookingsMap[monthYear]) {
        monthlyBookingsMap[monthYear] = {
          count: 0,
          revenue: 0,
          pending: 0,
          confirmed: 0,
          completed: 0
        };
      }

      monthlyBookingsMap[monthYear].count += 1;
      monthlyBookingsMap[monthYear].revenue += booking.total_price || 0;

      switch (booking.status.toLowerCase()) {
        case 'pending':
          monthlyBookingsMap[monthYear].pending += 1;
          break;
        case 'confirmed':
        case 'booked':
          monthlyBookingsMap[monthYear].confirmed += 1;
          break;
        case 'completed':
        case 'sold':
          monthlyBookingsMap[monthYear].completed += 1;
          break;
      }
    });

    // Convert map to array and sort by date
    const monthlyBookings = Object.entries(monthlyBookingsMap)
      .map(([monthYear, data]) => ({
        month: monthYear,
        count: data.count,
        revenue: data.revenue,
        pending: data.pending,
        confirmed: data.confirmed,
        completed: data.completed
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate totals
    const totalBookings = data.length;
    const totalRevenue = data.reduce((sum, booking) => sum + (booking.total_price || 0), 0);

    const response = Response.json({
      monthlyBookings,
      totalBookings,
      totalRevenue
    });

    await logApiCall(request, response.status, userId, startTime);
    return response;
  } catch (error: any) {
    console.error('Unexpected error fetching booking data:', error);
    await logApiCall(request, 500, userId, startTime, error.message);
    return Response.json({ error: 'Failed to fetch booking data' }, { status: 500 });
  }
}