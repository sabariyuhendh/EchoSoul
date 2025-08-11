import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { User } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading, refetch, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0, // Always refetch to ensure fresh auth state
  });

  // Debug logging (only in development)
  if (import.meta.env.DEV) {
    console.log('useAuth - data:', user, 'isLoading:', isLoading, 'isAuthenticated:', !!user);
    console.log('Browser cookies:', document.cookie);
  }

  // Force periodic auth checks if session exists but user is null
  useEffect(() => {
    const sessionCookie = document.cookie.includes('connect.sid');
    if (sessionCookie && !user && !isLoading) {
      console.log('Session cookie exists but no user - forcing refresh');
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      }, 1000);
    }
  }, [user, isLoading, queryClient]);

  return {
    user: user || undefined,
    isLoading,
    isAuthenticated: !!user,
    refetch,
  };
}