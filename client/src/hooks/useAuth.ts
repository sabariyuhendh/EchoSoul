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
          await apiRequest('/api/auth/google', {
            method: 'POST',
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              firstName: user.displayName?.split(' ')[0] || '',
              lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
              profileImageUrl: user.photoURL || '',
            }),
          });
          // Invalidate user query to refresh backend user data
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
  const { data: user, isLoading: backendLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !!firebaseUser && !firebaseLoading,
  });

  const isLoading = firebaseLoading || (firebaseUser && backendLoading);

  return {
    user: user || undefined,
    isLoading,
    isAuthenticated: !!firebaseUser && !!user,
    firebaseUser,
  };
}