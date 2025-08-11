import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { signInWithGoogle } from '@/lib/firebase';
import { FaGoogle } from 'react-icons/fa';

const GoogleLogin = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const googleAuthMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      const firebaseUser = await signInWithGoogle();
      
      // Send Firebase user data to backend to create/update user
      return apiRequest('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          profileImageUrl: firebaseUser.photoURL || '',
        }),
      });
    },
    onSuccess: async () => {
      // Invalidate and refetch the auth user query
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Welcome to EchoSoul",
        description: "You are now signed in with Google",
      });
      
      // Navigate to home after successful login
      setTimeout(() => {
        navigate('/');
      }, 500);
    },
    onError: (error) => {
      setIsLoading(false);
      toast({
        title: "Sign in failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-gray-900/90 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="space-y-6">
          {/* Logo */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-light">
              <span className="text-gradient-echo font-medium">Echo</span>
              <span className="text-gradient-soul font-light">Soul</span>
            </h1>
            <p className="text-gray-400 text-sm">Your emotional wellness companion</p>
          </div>

          {/* Google Sign In Button */}
          <div className="space-y-4">
            <Button
              onClick={() => googleAuthMutation.mutate()}
              disabled={googleAuthMutation.isPending || isLoading}
              className="w-full bg-white text-black hover:bg-gray-100 transition-all duration-200 py-3 text-base font-medium flex items-center justify-center space-x-3 rounded-xl"
            >
              <FaGoogle className="text-lg" />
              <span>Continue with Google</span>
              {(googleAuthMutation.isPending || isLoading) && (
                <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
              )}
            </Button>
            
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              By signing in, you agree to our Terms of Service and Privacy Policy. 
              EchoSoul uses secure authentication to protect your emotional wellness data.
            </p>
          </div>

          {/* Features Preview */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-gray-400 text-xs text-center mb-3">What awaits you:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-blue-500/10 rounded-lg">
                <div className="text-blue-400 font-medium">Vault</div>
                <div className="text-gray-500">8-min journaling</div>
              </div>
              <div className="text-center p-2 bg-green-500/10 rounded-lg">
                <div className="text-green-400 font-medium">Calm Space</div>
                <div className="text-gray-500">Meditation</div>
              </div>
              <div className="text-center p-2 bg-red-500/10 rounded-lg">
                <div className="text-red-400 font-medium">Let It Go</div>
                <div className="text-gray-500">Release emotions</div>
              </div>
              <div className="text-center p-2 bg-purple-500/10 rounded-lg">
                <div className="text-purple-400 font-medium">Letters Live</div>
                <div className="text-gray-500">AI letters</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GoogleLogin;