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

  // Debug logging
  console.log('useAuth - data:', user);
  console.log('useAuth - isLoading:', isLoading);
  console.log('useAuth - error:', error);
  console.log('useAuth - isAuthenticated:', !!user);

  return {
    user: user || undefined,
    isLoading,
    isAuthenticated: !!user,
    refetch,
  };
}