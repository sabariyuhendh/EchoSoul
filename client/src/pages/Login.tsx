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
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

  const authMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; isSignUp: boolean }) => {
      const endpoint = data.isSignUp ? '/api/auth/signup' : '/api/auth/login';
      return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email: data.email, password: data.password }),
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
    authMutation.mutate({ email: email.trim(), password, isSignUp });
  };

  return (
    <div className="min-h-screen bg-black text-white page-content flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-6">
        <Card className="glass p-8 border border-white/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-green-400 rounded-full mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-white">EchoSoul</h1>
            <p className="text-gray-400 mt-2">
              {isSignUp ? "Create your emotional wellness account" : "Welcome back to your emotional journey"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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