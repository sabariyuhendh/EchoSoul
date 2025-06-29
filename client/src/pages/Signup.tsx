import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, ArrowLeft } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
    window.location.href = '/api/signup';
  };

  const handleGoogleSignup = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-black text-white page-content flex items-center justify-center p-6">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-lavender-500 to-rose-500 rounded-full blur-3xl opacity-20 animate-breathe"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-calm-500 to-sage-500 rounded-full blur-3xl opacity-20 animate-breathe" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
        
        <Card className="apple-card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-lavender-400 to-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-light tracking-tight mb-2">
              <span className="text-gradient-wellness">Create Account</span>
            </h1>
            <p className="text-gray-400">Join your emotional wellness journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="bg-transparent border-white/20 text-white placeholder-gray-500 focus:border-lavender-400"
                  placeholder="Your name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-transparent border-white/20 text-white placeholder-gray-500 focus:border-lavender-400"
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="bg-transparent border-white/20 text-white placeholder-gray-500 focus:border-lavender-400"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="bg-transparent border-white/20 text-white placeholder-gray-500 focus:border-lavender-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit"
              className="w-full apple-button bg-gradient-to-r from-lavender-500 to-rose-500 hover:from-lavender-600 hover:to-rose-600"
            >
              Create Account
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black text-gray-400">Or continue with</span>
            </div>
          </div>

          <Button 
            onClick={handleGoogleSignup}
            variant="outline"
            className="w-full apple-button border-white/20 hover:bg-white/10"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </Button>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-lavender-400 hover:text-lavender-300 transition-colors">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Signup;