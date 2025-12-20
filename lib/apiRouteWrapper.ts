// lib/apiRouteWrapper.ts
import { logApi } from './apiLogger';

export function withApiLogging(handler: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    const startTime = Date.now();
    let userId: string | null = null;
    let requestPayload: any = null;

    try {
      // Extract user ID from auth header if present
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // In a real app, you'd decode the JWT to get user ID
        // For now, we'll skip this and let individual routes handle it
      }

      // Try to get request payload
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        try {
          // Clone the request to read the body without consuming it
          const bodyText = await req.text();
          if (bodyText) {
            requestPayload = JSON.parse(bodyText);
            // Restore the request body for the handler
            req = new Request(req, { body: bodyText });
          }
        } catch (e) {
          // If JSON parsing fails, continue without payload
        }
      }

      // Execute the original handler
      const response = await handler(req);

      // Calculate response time
      const responseTime = Date.now() - startTime;

      // Log successful request
      await logApi({
        endpoint: new URL(req.url).pathname,
        method: req.method,
        statusCode: response.status,
        responseTime,
        userId,
        requestPayload,
        responsePayload: null, // We can't easily capture response payload
        req,
      });

      return response;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;

      // Log error
      await logApi({
        endpoint: new URL(req.url).pathname,
        method: req.method,
        statusCode: 500,
        responseTime,
        userId,
        requestPayload,
        errorMessage: error.message || 'Internal Server Error',
        req,
      });

      // Re-throw the error
      throw error;
    }
  };
}