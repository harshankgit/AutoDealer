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

// Convenience methods
export const apiClient = {
  get: (url: string, options?: RequestInit) => 
    apiFetch(url, { ...options, method: 'GET' }),
  
  post: (url: string, body?: any, options?: RequestInit) => 
    apiFetch(url, { 
      ...options, 
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    }),
  
  put: (url: string, body?: any, options?: RequestInit) => 
    apiFetch(url, { 
      ...options, 
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    }),
  
  delete: (url: string, options?: RequestInit) => 
    apiFetch(url, { ...options, method: 'DELETE' })
};