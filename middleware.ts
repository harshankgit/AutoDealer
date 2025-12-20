// middleware.ts - Global Next.js Middleware
import { NextRequest, NextResponse } from 'next/server';
import { logApi } from '@/lib/apiLogger';

// List of API routes to log (exclude auth, health check, etc.)
const LOGGED_ROUTES = ['/api/'];

// Routes to specifically exclude from logging
const EXCLUDED_ROUTES = [
  '/api/health',
  '/api/auth',
  '/api/webhook',
];

export async function middleware(request: NextRequest) {
  // Only log API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip excluded routes
  if (EXCLUDED_ROUTES.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if this route should be logged
  const shouldLog = LOGGED_ROUTES.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (!shouldLog) {
    return NextResponse.next();
  }

  const startTime = Date.now();

  // Continue with the request
  const response = NextResponse.next();

  // Log the request after the response is prepared
  // Note: In middleware, we can't await async operations that happen after response
  // So we'll use a fire-and-forget approach for logging
  logRequest(request, response, startTime).catch(console.error);

  return response;
}

async function logRequest(request: NextRequest, response: NextResponse, startTime: number) {
  try {
    // For middleware, we can't get the actual response body or final status
    // So this approach has limitations for complete logging
    // The more reliable approach is to use the wrapper method in individual routes
    const responseTime = Date.now() - startTime;
    
    await logApi({
      endpoint: request.nextUrl.pathname,
      method: request.method,
      statusCode: response.status,
      responseTime,
      userId: null, // Can't extract user in middleware without auth logic
      requestPayload: null, // Can't read body in middleware
      responsePayload: null,
      errorMessage: undefined,
      req: request as any, // Type conversion for compatibility
    });
  } catch (error) {
    console.error('Error logging request in middleware:', error);
  }
}

// Apply middleware to API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/api/:path*',
  ],
};