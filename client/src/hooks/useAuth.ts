// Clean auth hook
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch('/api/auth/user', {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (res.status === 401) {
        return null;
      }
      
      if (!res.ok) {
        throw new Error('Failed to fetch user');
      }
      
      return res.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user: user || undefined,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
