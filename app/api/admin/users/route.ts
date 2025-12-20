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
    // Get all users with admin role
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, created_at')
      .eq('role', 'admin')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admins:', error);
      await logApiCall(request, 500, userId, startTime, error.message);
      return Response.json({ error: 'Failed to fetch admins' }, { status: 500 });
    }

    const response = Response.json({ 
      admins: data || [],
      count: data?.length || 0
    });
    
    await logApiCall(request, response.status, userId, startTime);
    return response;
  } catch (error: any) {
    console.error('Unexpected error fetching admins:', error);
    await logApiCall(request, 500, userId, startTime, error.message);
    return Response.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}