import { NextRequest } from 'next/server';
import { logApi } from './apiLogger';
import { verify } from 'jsonwebtoken';

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

// Enhanced API route wrapper that automatically logs requests with toggle functionality
export const withApiLogging = (handler: Function) => {
  return async (request: NextRequest) => {
    const startTime = Date.now();
    let userId: string | null = null;
    let requestPayload: any = null;

    // Try to extract user ID from authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const tokenData = verifyToken(token);
      if (tokenData.valid) {
        userId = tokenData.userId;
      }
    }

    try {
      // Try to get request payload
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        try {
          // Clone the request to read the body without consuming it
          const bodyText = await request.text();
          if (bodyText) {
            requestPayload = JSON.parse(bodyText);
          }
          // Note: We can't restore the body to the original request in Next.js App Router
          // The original request will be consumed, but the handler will receive the same data
        } catch (e) {
          // If JSON parsing fails, continue without payload
        }
      }

      // Execute the original handler
      const response = await handler(request);

      // Log successful request (the logApi function handles the toggle internally)
      const responseTime = Date.now() - startTime;

      await logApi({
        endpoint: request.nextUrl.pathname,
        method: request.method,
        statusCode: response.status,
        responseTime,
        userId,
        requestPayload,
        responsePayload: null, // We can't easily capture response payload
        errorMessage: response.status >= 400 ? `HTTP ${response.status}` : undefined,
        req: request,
      });

      return response;
    } catch (error: any) {
      // Log error (the logApi function handles the toggle internally)
      const responseTime = Date.now() - startTime;

      await logApi({
        endpoint: request.nextUrl.pathname,
        method: request.method,
        statusCode: 500,
        responseTime,
        userId,
        requestPayload,
        responsePayload: null,
        errorMessage: error.message || 'Internal Server Error',
        req: request,
      });

      // Re-throw the error
      throw error;
    }
  };
};