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
  
  // Check if user is authenticated - this could be called by a scheduled job or admin
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const tokenData = verifyToken(token);

    if (tokenData.valid) {
      userId = tokenData.userId;
    }
  }

  try {
    // Get the log retention period from system settings or default to 30 days
    const { data: settingsData, error: settingsError } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'api_log_retention_days')
      .single();

    let retentionDays = 30; // default
    if (!settingsError && settingsData && settingsData.setting_value) {
      retentionDays = parseInt(settingsData.setting_value) || 30;
    }
    
    // Calculate the cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`Cleaning up API logs older than ${cutoffDate.toISOString()} (retention: ${retentionDays} days)`);

    // Delete logs older than the cutoff date
    const { error, count } = await supabase
      .from('api_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('Error cleaning up API logs:', error);
      await logApiCall(request, 500, userId, startTime, error.message);
      return Response.json({ error: 'Failed to clean up API logs', details: error.message }, { status: 500 });
    }

    console.log(`Successfully cleaned up ${count} old API logs`);

    const response = Response.json({ 
      message: 'API logs cleanup completed successfully', 
      deletedCount: count || 0,
      cutoffDate: cutoffDate.toISOString(),
      retentionDays 
    });
    
    await logApiCall(request, response.status, userId, startTime);
    return response;
  } catch (error: any) {
    console.error('Unexpected error during API logs cleanup:', error);
    await logApiCall(request, 500, userId, startTime, error.message);
    return Response.json({ error: 'Failed to clean up API logs', details: error.message }, { status: 500 });
  }
}