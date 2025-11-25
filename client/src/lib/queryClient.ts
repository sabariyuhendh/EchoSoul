import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false;
        return failureCount < 3;
      },
      queryFn: async ({ queryKey }) => {
        const url = Array.isArray(queryKey) ? queryKey[0] : queryKey;
        const isAuthEndpoint = url === '/api/auth/user';
        
        // Only log non-auth requests to reduce console noise
        if (!isAuthEndpoint) {
          console.log('Making request to:', url, 'with credentials: include');
        }
        
        const response = await fetch(url as string, {
          credentials: 'include', // Include cookies for all queries
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        
        // Log response cookies for debugging (only for non-auth endpoints)
        if (!isAuthEndpoint) {
          const setCookieHeader = response.headers.get('set-cookie');
          if (setCookieHeader) {
            console.log('Response set-cookie header:', setCookieHeader);
          }
          console.log('Response status:', response.status, 'for', url);
        }
        
        if (!response.ok) {
          // For auth endpoints, handle 401 silently (expected for unauthenticated users)
          if (response.status === 401 && isAuthEndpoint) {
            return null; // Return null for unauthenticated users
          }
          console.error('Query failed:', response.status, response.statusText, 'for', url);
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (!isAuthEndpoint) {
          console.log('Response data for', url, ':', data);
        }
        return data;
      },
    },
  },
});

export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const isAuthEndpoint = url.includes('/api/auth/');
  
  // Only log non-auth requests to reduce console noise
  if (!isAuthEndpoint) {
    console.log('Making API request to:', url, 'with method:', options.method || 'GET');
  }
  
  const response = await fetch(url, {
    credentials: 'include', // Include cookies for session management
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      ...options.headers,
    },
    ...options,
  });
  
  if (!isAuthEndpoint) {
    console.log('API response status:', response.status, 'for', url);
  }

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `${response.status}: ${response.statusText}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      // If parsing fails, use the status text
    }
    throw new Error(errorMessage);
  }

  return response.json();
};