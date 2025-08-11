import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Heart } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

const ProtectedRoute = ({ children, fallbackMessage }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white page-content">
        <div className="max-w-2xl mx-auto px-6 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <p className="text-gray-400">Loading your wellness journey...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white page-content">
        <div className="max-w-2xl mx-auto px-6 flex items-center justify-center min-h-[50vh]">
          <Card className="glass border border-white/10 p-8 text-center">
            <CardContent className="space-y-6">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Sign In Required</h2>
                <p className="text-gray-400 mb-4">
                  {fallbackMessage || "This feature requires authentication to protect your personal wellness data."}
                </p>
              </div>
              <Button 
                onClick={() => window.location.href = '/login'}
                className="apple-button bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;