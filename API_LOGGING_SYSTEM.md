# API Logging System Documentation

## Overview
This system provides comprehensive API logging functionality with an ON/OFF toggle, allowing SuperAdmins to monitor all API requests while maintaining performance when logging is disabled.

## Architecture

### Components
1. **Database Schema**
   - `system_settings` table: Stores the `api_logging_enabled` toggle setting
   - `api_logs` table: Stores detailed API request logs

2. **Frontend Integration**
   - `apiClient` wrapper for all API calls with logging headers
   - Global fetch wrapper that adds 'x-log-api' header

3. **Supabase Integration**
   - Dedicated admin client for secure database operations
   - Service role key for backend operations

4. **Backend Logging**
   - `apiLogger` utility that checks toggle before logging
   - `apiRouteWrapper` for wrapping API route handlers
   - Global Next.js middleware for automatic logging

5. **Security**
   - Row Level Security (RLS) policies for secure access
   - JWT-based role verification

6. **SuperAdmin Interface**
   - Toggle switch for enabling/disabling logging
   - Detailed logs viewing with filtering capabilities

## Frontend Implementation

### API Client Wrapper
```typescript
// lib/apiClient.ts
export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  const startTime = Date.now();

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'x-log-api': 'true', // 🔥 LOGGING FLAG
    },
  });

  // expose timing to backend if needed
  res.headers.append(
    'x-response-time',
    (Date.now() - startTime).toString()
  );

  return res;
}
```

### Usage in Components
```typescript
import { apiClient } from '@/lib/apiClient';

// Use the wrapper instead of direct fetch
const response = await apiClient.get('/api/cars');
const response = await apiClient.post('/api/bookings', data);
```

## Backend Implementation

### API Route Wrapper
```typescript
// lib/apiRouteWrapper.ts
import { withApiLogging } from '@/lib/apiRouteWrapper';

// Apply to any API route
export const GET = withApiLogging(async (request: Request) => {
  // Your route logic
  return Response.json({ data: 'example' });
});
```

### Direct Logger Usage
```typescript
// lib/apiLogger.ts
import { logApi } from '@/lib/apiLogger';

// Use in any API route for detailed logging
await logApi({
  endpoint: '/api/cars',
  method: 'GET',
  statusCode: 200,
  responseTime: 150,
  userId: 'user-123',
  req: request,
});
```

## Database Schema

### system_settings table
```sql
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  key TEXT,  -- Added for compatibility with requirements
  value BOOLEAN NOT NULL  -- Added for compatibility with requirements
);
```

### api_logs table
```sql
CREATE TABLE IF NOT EXISTS api_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    request_payload JSONB,
    response_payload JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Implementation Details

### 1. Supabase Admin Client
Located at: `lib/supabase/admin.ts`
- Uses service role key for backend operations
- Provides secure access to database operations

### 2. API Logger Function
Located at: `middleware/apiLogger.ts`
- Checks `api_logging_enabled` setting before logging
- Only performs database operations when logging is enabled
- Logs detailed request information

### 3. API Route Wrappers
Located at: `lib/apiLoggingWrapper.ts` and `lib/apiLoggerWrapper.ts`
- `withApiLogging` function wraps API routes for automatic logging
- Measures response time
- Captures request/response details
- Handles errors appropriately

### 4. API Endpoints

#### GET /api/admin/api-logging-toggle
- Returns current logging status
- Requires SuperAdmin role
- Response: `{ enabled: boolean }`

#### PUT /api/admin/api-logging-toggle
- Updates logging status
- Requires SuperAdmin role
- Request body: `{ enabled: boolean }`
- Response: `{ message: string, enabled: boolean }`

#### GET /api/admin/logs
- Fetches API logs with pagination and filtering
- Requires SuperAdmin role
- Supports query parameters for filtering

#### DELETE /api/admin/logs
- Clears old logs based on retention settings
- Requires SuperAdmin role

## Security

### RLS Policies
- SuperAdmins can read all logs
- SuperAdmins can update logging settings
- Backend services can insert logs
- Regular users have no access to logs or settings

### Authentication
- JWT token verification
- Role-based access control
- SuperAdmin role required for logging management

## Usage

### Enabling Logging
1. Log in as SuperAdmin
2. Navigate to Admin Dashboard → API Logging
3. Toggle the switch to ON
4. API requests will now be logged to the database

### Viewing Logs
1. Access the API Logging interface as SuperAdmin
2. Use filters to narrow down results
3. View detailed information about each API request
4. Use pagination for large datasets

### Disabling Logging
1. Navigate to the API Logging interface
2. Toggle the switch to OFF
3. No new logs will be created (performance optimization)

## Performance Considerations

### When Logging is OFF
- No database calls are made
- Zero performance impact
- All logging code is bypassed

### When Logging is ON
- Single database query to check setting on each API call
- Additional database insert for each API request
- Minimal performance impact for most applications

## API Route Integration

To add logging to your API routes, wrap your handlers:

```typescript
import { withApiLogging } from '@/lib/apiLoggingWrapper';

async function GETHandler(request: Request) {
  // Your API logic here
  return Response.json({ message: 'Success' });
}

export const GET = withApiLogging(GETHandler);
```

## SuperAdmin UI

The SuperAdmin interface provides:
- Global toggle for enabling/disabling logging
- Detailed logs view with filtering
- Performance metrics
- Error tracking
- Response time analysis

## Testing

To test the implementation:
1. Start your Next.js application: `npm run dev`
2. Navigate to `/admin/superadmin/api-logging` as a superadmin user
3. Toggle the logging ON
4. Make some API calls to generate logs
5. View the logs in the interface
6. Toggle logging OFF and verify no new logs are created

## Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for backend operations
- `JWT_SECRET` - Secret for JWT token verification

## Migrations

The following database migrations are included:
1. `002_create_api_logs_table.sql` - Creates the logs table
2. `003_create_system_settings_table.sql` - Creates the settings table
3. `004_add_api_logging_toggle.sql` - Adds the API logging setting
4. `005_update_rls_policies_for_api_logging.sql` - Updates RLS policies
5. `006_update_system_settings_schema.sql` - Updates schema for compatibility

## Error Handling

The system handles errors gracefully:
- If settings cannot be fetched, logging defaults to OFF (safe)
- Database errors are logged to console but don't break functionality
- Authentication failures return appropriate HTTP status codes

## Maintenance

### Log Retention
- Logs are retained based on the `api_log_retention_days` setting
- Old logs can be cleared manually or automatically

### Monitoring
- Monitor the `api_logs` table size
- Set up alerts for high error rates
- Track response time trends