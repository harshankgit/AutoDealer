// This is a test API route to verify logging functionality
export async function GET(request: Request) {
  // Simulate an API call that should be logged when logging is enabled
  const url = new URL(request.url);
  const throwError = url.searchParams.get('error') === 'true';
  
  if (throwError) {
    // This will trigger error logging
    return Response.json({ error: 'Test error for logging' }, { status: 500 });
  }
  
  // Successful response
  return Response.json({ 
    message: 'Test API call successful', 
    timestamp: new Date().toISOString(),
    path: '/api/test-logging' 
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    return Response.json({ 
      message: 'POST request received', 
      data: body,
      path: '/api/test-logging'
    });
  } catch (error) {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}