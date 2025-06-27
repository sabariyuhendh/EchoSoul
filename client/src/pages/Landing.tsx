import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Landing = () => {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-teal-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(139,92,246,0.1),transparent_50%)]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 backdrop-blur-xl bg-black/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-green-400 rounded-full"></div>
              <h1 className="text-xl font-semibold tracking-tight text-white">EchoSoul</h1>
            </div>
            <Button 
              onClick={handleLogin}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Hero section */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-light tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400">
                EchoSoul
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto leading-relaxed">
              Your personal sanctuary for emotional wellness, self-expression, and inner peace
            </p>
          </div>

          {/* Features grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <Card className="glass p-6 border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-blue-400"></div>
                </div>
                <h3 className="text-lg font-medium text-white">Vault</h3>
                <p className="text-gray-400 text-sm">8-minute emotional release sessions in complete privacy</p>
              </div>
            </Card>

            <Card className="glass p-6 border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-green-400"></div>
                </div>
                <h3 className="text-lg font-medium text-white">Letters</h3>
                <p className="text-gray-400 text-sm">AI-assisted letter writing with personalized styles</p>
              </div>
            </Card>

            <Card className="glass p-6 border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-purple-400"></div>
                </div>
                <h3 className="text-lg font-medium text-white">Let It Go</h3>
                <p className="text-gray-400 text-sm">Interactive emotional release through virtual activities</p>
              </div>
            </Card>

            <Card className="glass p-6 border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-teal-400"></div>
                </div>
                <h3 className="text-lg font-medium text-white">Mood</h3>
                <p className="text-gray-400 text-sm">Track your emotional journey with insightful analytics</p>
              </div>
            </Card>
          </div>

          {/* Call to action */}
          <div className="space-y-6 pt-8">
            <p className="text-gray-400 text-lg">
              Join thousands on their journey to emotional wellness
            </p>
            <Button 
              onClick={handleLogin}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-all duration-300 transform hover:scale-105"
            >
              Begin Your Journey
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;