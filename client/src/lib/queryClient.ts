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
        const response = await fetch(url as string, {
          credentials: 'include', // Include cookies for all queries
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
      },
    },
  },
});

export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    credentials: 'include', // Include cookies for session management
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};