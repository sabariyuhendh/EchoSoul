import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Link, useLocation } from 'wouter';

const Login = () => {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

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
    onSuccess: () => {
      toast({
        title: isSignUp ? "Account created successfully" : "Welcome back",
        description: "You are now logged in",
      });
      navigate('/');
    },
    onError: (error) => {
      toast({
        title: "Authentication failed",
        description: error.message || "Please check your credentials",
        variant: "destructive",
      });
    },
  });

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
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-green-400 rounded-full mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-white">Letters Live</h1>
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
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
              onClick={() => window.location.href = '/api/auth/google'}
              className="w-full mt-4 bg-white hover:bg-gray-100 text-black font-medium border border-white/20"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
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