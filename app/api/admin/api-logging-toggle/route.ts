import { NextRequest } from 'next/server';
import { logApi } from '@/lib/apiLogger';
import { createClient } from '@supabase/supabase-js';
import { verify } from 'jsonwebtoken';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables in api-logging-toggle route');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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
const logApiCall = async (request: NextRequest, statusCode: number, userId: string | null, startTime: number, error?: string, requestPayload?: any) => {
  const responseTime = Date.now() - startTime;

  await logApi({
    endpoint: request.nextUrl.pathname,
    method: request.method,
    statusCode,
    responseTime,
    userId,
    requestPayload,
    responsePayload: null,
    errorMessage: error || undefined,
    req: request,
  });
};

export async function PUT(request: NextRequest) {
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
    const { enabled } = await request.json();

    if (typeof enabled !== 'boolean') {
      await logApiCall(request, 400, userId, startTime, 'Enabled parameter must be a boolean');
      return Response.json({ error: 'Enabled parameter must be a boolean' }, { status: 400 });
    }

    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client not initialized');
      await logApiCall(request, 500, userId, startTime, 'Supabase client not initialized');
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Update the API logging setting in the database
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: 'api_logging_enabled',
        setting_value: enabled.toString(),
        description: 'Enable or disable API request logging',
        updated_at: new Date().toISOString()
      }, { onConflict: 'setting_key' });

    if (error) {
      console.error('Error updating API logging setting:', error);
      await logApiCall(request, 500, userId, startTime, error.message);
      return Response.json({ error: 'Failed to update API logging setting' }, { status: 500 });
    }

    const response = Response.json({
      message: `API logging ${enabled ? 'enabled' : 'disabled'} successfully`,
      enabled
    });

    await logApiCall(request, response.status, userId, startTime);
    return response;
  } catch (error: any) {
    console.error('Unexpected error updating API logging setting:', error);
    await logApiCall(request, 500, userId, startTime, error.message);
    return Response.json({ error: 'Failed to update API logging setting' }, { status: 500 });
  }
}

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
    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client not initialized');
      await logApiCall(request, 500, userId, startTime, 'Supabase client not initialized');
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Get the API logging setting
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'api_logging_enabled')
      .single();

    if (error) {
      console.error('Error fetching API logging setting:', error);
      await logApiCall(request, 500, userId, startTime, error.message);
      return Response.json({ error: 'Failed to fetch API logging setting' }, { status: 500 });
    }

    const response = Response.json({ 
      enabled: data?.setting_value === 'true' 
    });

    await logApiCall(request, response.status, userId, startTime);
    return response;
  } catch (error: any) {
    console.error('Unexpected error fetching API logging setting:', error);
    await logApiCall(request, 500, userId, startTime, error.message);
    return Response.json({ error: 'Failed to fetch API logging setting' }, { status: 500 });
  }
}