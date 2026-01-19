// New clean login/register page
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';

const LoginNew = () => {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' 
        ? { email, password }
        : { email, password, firstName, lastName };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Invalidate auth query to refresh user state
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      // Navigate to home
      setLocation('/');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900/50 border-white/10 backdrop-blur-xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-light">
            <span className="text-gradient-echo">Echo</span>
            <span className="text-gradient-soul">Soul</span>
          </CardTitle>
          <p className="text-gray-400 text-sm">Your emotional wellness companion</p>
        </CardHeader>
        
        <CardContent>
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              variant={mode === 'login' ? 'default' : 'outline'}
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className="flex-1"
            >
              Login
            </Button>
            <Button
              type="button"
              variant={mode === 'register' ? 'default' : 'outline'}
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className="flex-1"
            >
              Register
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
              {mode === 'register' && (
                <p className="text-xs text-gray-500">Must be at least 6 characters</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginNew;










