import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { signInWithGoogle } from '@/lib/firebase';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useLocation } from 'wouter';

const GoogleLogin = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      console.log('Google sign in successful:', user);
      // Force navigation after successful sign in
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error: any) {
      console.error('Sign in error:', error);
      // If popup is blocked or cancelled, provide instructions
      if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/cancelled-popup-request') {
        alert('Please allow popups for this site and try again, or make sure you complete the sign-in process.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FaGoogle className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-400">Setting up your wellness journey...</p>
        </div>
      </div>
    );
  }

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
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-gray-100 transition-all duration-200 py-3 text-base font-medium flex items-center justify-center space-x-3 rounded-xl"
            >
              <FaGoogle className="text-lg" />
              <span>Continue with Google</span>
              {isLoading && (
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