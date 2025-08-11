import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
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
  }

  return {
    user: user || undefined,
    isLoading,
    isAuthenticated: !!user,
    refetch,
  };
}