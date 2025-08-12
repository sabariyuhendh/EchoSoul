import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { onAuthStateChange } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      console.log('Firebase auth state changed:', user);
      setFirebaseUser(user);
      setFirebaseLoading(false);
      
      if (user) {
        // User signed in, sync with backend
        try {
          console.log('Syncing with backend for user:', user.uid);
          const response = await apiRequest('/api/auth/google', {
            method: 'POST',
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              firstName: user.displayName?.split(' ')[0] || '',
              lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
              profileImageUrl: user.photoURL || '',
            }),
          });
          console.log('Backend sync successful:', response);
          
          // Force immediate query refetch with a slight delay to ensure session is set
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
            queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
          }, 100);
        } catch (error) {
          console.error('Failed to sync with backend:', error);
        }
      } else {
        // User signed out, clear backend session
        queryClient.setQueryData(["/api/auth/user"], null);
      }
    });

    return unsubscribe;
  }, [queryClient]);

  // Get backend user data
  const { data: user, isLoading: backendLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: !!firebaseUser && !firebaseLoading,
    staleTime: 0, // Always fetch fresh data
    queryFn: () => fetch('/api/auth/user', { 
      credentials: 'include',
      headers: { 'Cache-Control': 'no-cache' }
    }).then(res => {
      if (res.status === 401) return null;
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    })
  });

  console.log('useAuth state:', {
    firebaseUser: !!firebaseUser,
    firebaseLoading,
    backendUser: !!user,
    backendLoading,
    error,
    isAuthenticated: !!firebaseUser && !!user
  });

  const isLoading = firebaseLoading || (firebaseUser && backendLoading);

  return {
    user: user || undefined,
    isLoading,
    isAuthenticated: !!firebaseUser && !!user,
    firebaseUser,
  };
}