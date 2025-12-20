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

// Enhanced API logging middleware function that can wrap API route handlers with toggle functionality
export function withApiLogging(handler: Function) {
  return async (request: NextRequest) => {
    const startTime = Date.now();
    let userId: string | null = null;
    let requestPayload: any = null;

    // Extract user ID from authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const tokenData = verifyToken(token);
      if (tokenData.valid) {
        userId = tokenData.userId;
      }
    }

    try {
      // Get request payload if available
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

      const responseTime = Date.now() - startTime;

      // Log the API request (the logApi function handles the toggle internally)
      await logApi({
        endpoint: request.nextUrl.pathname,
        method: request.method,
        statusCode: response.status,
        responseTime,
        userId,
        requestPayload,
        responsePayload: null, // We can't easily get response payload
        errorMessage: response.status >= 400 ? `HTTP ${response.status}` : undefined,
        req: request,
      });

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Log the error (the logApi function handles the toggle internally)
      await logApi({
        endpoint: request.nextUrl.pathname,
        method: request.method,
        statusCode: 500,
        responseTime,
        userId,
        requestPayload,
        responsePayload: null,
        errorMessage: error instanceof Error ? error.message : 'Internal Server Error',
        req: request,
      });

      // Re-throw the error so it's properly handled
      throw error;
    }
  };
}