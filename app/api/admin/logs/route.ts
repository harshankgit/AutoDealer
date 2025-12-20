import { NextRequest } from 'next/server';
import { logApi } from '@/lib/apiLogger';
import { createClient } from '@supabase/supabase-js';
import { verify } from 'jsonwebtoken';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
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

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | null = null;

  // Check if Supabase client is available
  if (!supabase) {
    console.error('Supabase client not initialized');
    await logApiCall(request, 500, userId, startTime, 'Supabase client not initialized');
    return Response.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
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

    // Parse query parameters for filtering
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const startDate = url.searchParams.get('startDate') || '';
    const endDate = url.searchParams.get('endDate') || '';
    const endpoint = url.searchParams.get('endpoint') || '';
    const statusCode = url.searchParams.get('statusCode') || '';
    const method = url.searchParams.get('method') || '';
    const errorOnly = url.searchParams.get('errorOnly') === 'true';

    console.log('Query parameters:', { page, limit, startDate, endDate, endpoint, statusCode, method, errorOnly });

    // Build the query with filters
    let query = supabase
      .from('api_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (startDate) {
      query = query.gte('created_at', startDate);
      console.log('Added start date filter:', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
      console.log('Added end date filter:', endDate);
    }

    if (endpoint) {
      query = query.ilike('endpoint', `%${endpoint}%`);
      console.log('Added endpoint filter:', endpoint);
    }

    if (statusCode) {
      const statusCodeNum = parseInt(statusCode);
      query = query.eq('status_code', statusCodeNum);
      console.log('Added status code filter:', statusCodeNum);
    }

    if (method) {
      query = query.eq('method', method);
      console.log('Added method filter:', method);
    }

    if (errorOnly) {
      query = query.not('status_code', 'in', '(200,201,204)'); // Non-success status codes
      console.log('Added error only filter');
    }

    console.log('Executing query...');
    const { data, error, count } = await query;
    console.log('Query executed, data:', data?.length, 'error:', error, 'count:', count);

    if (error) {
      console.error('Error fetching API logs:', error);
      await logApiCall(request, 500, userId, startTime, error.message);
      return Response.json({ error: 'Failed to fetch API logs', details: error.message }, { status: 500 });
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response = Response.json({
      logs: data || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalLogs: count,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });

    await logApiCall(request, response.status, userId, startTime);
    return response;
  } catch (error: any) {
    console.error('Unexpected error fetching API logs:', error);
    await logApiCall(request, 500, userId, startTime, error.message);
    return Response.json({ error: 'Failed to fetch API logs', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | null = null;

  // Check if Supabase client is available
  if (!supabase) {
    console.error('Supabase client not initialized');
    await logApiCall(request, 500, userId, startTime, 'Supabase client not initialized');
    return Response.json({ error: 'Server configuration error' }, { status: 500 });
  }

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
    // Get retention days from query parameter, system settings, or default to 30 days
    const url = new URL(request.url);
    let retentionDays = parseInt(url.searchParams.get('retentionDays') || '30');

    // If not specified in query, get from system settings
    if (isNaN(retentionDays) || retentionDays <= 0) {
      const { data: settingsData, error: settingsError } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'api_log_retention_days')
        .single();

      if (!settingsError && settingsData && settingsData.setting_value) {
        retentionDays = parseInt(settingsData.setting_value) || 30;
      } else {
        retentionDays = 30; // default
      }
    }

    // Calculate the cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const { error, count } = await supabase
      .from('api_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('Error clearing API logs:', error);
      await logApiCall(request, 500, userId, startTime, error.message);
      return Response.json({ error: 'Failed to clear API logs' }, { status: 500 });
    }

    const response = Response.json({
      message: 'API logs cleared successfully',
      deletedCount: count || 0,
      cutoffDate: cutoffDate.toISOString(),
      retentionDays
    });
    
    await logApiCall(request, response.status, userId, startTime);
    return response;
  } catch (error: any) {
    console.error('Unexpected error clearing API logs:', error);
    await logApiCall(request, 500, userId, startTime, error.message);
    return Response.json({ error: 'Failed to clear API logs' }, { status: 500 });
  }
}