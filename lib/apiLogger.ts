// lib/apiLogger.ts
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function logApi({
  endpoint,
  method,
  statusCode,
  responseTime,
  userId,
  requestPayload,
  responsePayload,
  errorMessage,
  req,
}: {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  userId?: string | null;
  requestPayload?: any;
  responsePayload?: any;
  errorMessage?: string | null | undefined;
  req: Request;
}) {
  try {
    // 🔹 Check toggle - only log if enabled
    const { data: setting, error: settingError } = await supabaseAdmin
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'api_logging_enabled')
      .single();

    if (settingError) {
      console.error('Error fetching API logging setting:', settingError);
      return; // Don't log if we can't determine setting
    }

    if (setting?.setting_value !== 'true') {
      return; // Skip logging if disabled
    }

    // Extract IP address with fallback options
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = req.headers.get('x-client-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip'); // Cloudflare

    const ip = forwarded?.split(',')[0]?.trim() ||
               realIp?.trim() ||
               clientIp?.trim() ||
               cfConnectingIp?.trim() ||
               null;

    // Insert log record
    const { error } = await supabaseAdmin.from('api_logs').insert({
      endpoint,
      method,
      status_code: statusCode,
      response_time_ms: responseTime,
      user_id: userId || null,
      ip_address: ip,
      user_agent: req.headers.get('user-agent') || null,
      request_payload: requestPayload || null,
      response_payload: responsePayload || null,
      error_message: errorMessage || null,
    });

    if (error) {
      console.error('Error inserting API log:', error);
    }
  } catch (error) {
    console.error('Error in logApi function:', error);
  }
}