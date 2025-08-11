import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Link, useLocation } from 'wouter';
import { signInWithGoogle } from '@/lib/firebase';
import { FaGoogle } from 'react-icons/fa';

const Login = () => {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const authMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; firstName?: string; lastName?: string; isSignUp: boolean }) => {
      const endpoint = data.isSignUp ? '/api/auth/signup' : '/api/auth/login';
      const payload = data.isSignUp 
        ? { email: data.email, password: data.password, firstName: data.firstName, lastName: data.lastName }
        : { email: data.email, password: data.password };
      return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      // Invalidate and refetch the auth user query
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: isSignUp ? "Account created successfully" : "Welcome back",
        description: "You are now logged in",
      });
      
      // Give more time for auth state to update
      setTimeout(() => {
        navigate('/');
      }, 300);
    },
    onError: (error) => {
      toast({
        title: "Authentication failed",
        description: error.message || "Please check your credentials",
        variant: "destructive",
      });
    },
  });

  const googleAuthMutation = useMutation({
    mutationFn: async () => {
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
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Welcome!",
        description: "Successfully signed in with Google",
      });
      
      setTimeout(() => {
        navigate('/');
      }, 300);
    },
    onError: (error) => {
      toast({
        title: "Google sign-in failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleGoogleSignIn = () => {
    googleAuthMutation.mutate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (isSignUp && (!firstName.trim() || !lastName.trim())) {
      toast({
        title: "Missing information",
        description: "Please fill in your first and last name",
        variant: "destructive",  
      });
      return;
    }
    
    authMutation.mutate({ 
      email: email.trim(), 
      password, 
      firstName: firstName.trim(), 
      lastName: lastName.trim(), 
      isSignUp 
    });
  };

  return (
    <div className="min-h-screen bg-black text-white page-content flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-6">
        <Card className="glass p-8 border border-white/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light text-white tracking-wide mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-rose-400">
                Echo
              </span>
              <span className="text-gray-300">
                Soul
              </span>
            </h1>
            <p className="text-gray-400 mt-2">
              {isSignUp ? "Create your emotional wellness account" : "Welcome back to your emotional journey"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    required={isSignUp}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full apple-button bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium transition-all duration-300"
              disabled={authMutation.isPending}
            >
              {authMutation.isPending
                ? "Please wait..."
                : isSignUp
                ? "Create Account"
                : "Sign In"
              }
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-400">or</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full mt-4 apple-button bg-white hover:bg-gray-100 text-black font-medium border border-white/20 transition-all duration-300"
              disabled={googleAuthMutation.isPending}
            >
              <FaGoogle className="w-5 h-5 mr-2 text-red-500" />
              {googleAuthMutation.isPending ? "Signing in..." : "Continue with Google"}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;