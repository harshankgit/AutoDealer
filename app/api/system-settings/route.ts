import { NextRequest } from 'next/server';
import { logApi } from '@/lib/apiLogger';
import { createClient } from '@supabase/supabase-js';
import { verify } from 'jsonwebtoken';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables in system-settings route');
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
    const { settingKey, settingValue } = await request.json();

    if (!settingKey) {
      await logApiCall(request, 400, userId, startTime, 'Setting key is required');
      return Response.json({ error: 'Setting key is required' }, { status: 400 });
    }

    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client not initialized');
      await logApiCall(request, 500, userId, startTime, 'Supabase client not initialized');
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Insert or update the setting in the database
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: settingKey,
        setting_value: settingValue,
        updated_at: new Date().toISOString()
      }, { onConflict: 'setting_key' });

    if (error) {
      console.error('Error updating system setting:', error);
      await logApiCall(request, 500, userId, startTime, error.message);
      return Response.json({ error: 'Failed to update system setting' }, { status: 500 });
    }

    const response = Response.json({
      message: 'System setting updated successfully',
      settingKey,
      settingValue
    });

    await logApiCall(request, response.status, userId, startTime);
    return response;
  } catch (error: any) {
    console.error('Unexpected error updating system setting:', error);
    await logApiCall(request, 500, userId, startTime, error.message);
    return Response.json({ error: 'Failed to update system setting' }, { status: 500 });
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

    // Get all system settings
    const { data, error } = await supabase
      .from('system_settings')
      .select('*');

    if (error) {
      console.error('Error fetching system settings:', error);
      await logApiCall(request, 500, userId, startTime, error.message);
      return Response.json({ error: 'Failed to fetch system settings' }, { status: 500 });
    }

    const response = Response.json({ settings: data || [] });
    
    await logApiCall(request, response.status, userId, startTime);
    return response;
  } catch (error: any) {
    console.error('Unexpected error fetching system settings:', error);
    await logApiCall(request, 500, userId, startTime, error.message);
    return Response.json({ error: 'Failed to fetch system settings' }, { status: 500 });
  }
}