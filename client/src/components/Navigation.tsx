
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@shared/schema';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const typedUser = user as User | undefined;

  const navItems = [
    { title: "Vault", path: "/vault", color: "calm" },
    { title: "Letters", path: "/letters", color: "sage" },
    { title: "Let It Go", path: "/letitgo", color: "amber" },
    { title: "Mood", path: "/mood", color: "rose" },
    { title: "Whisper", path: "/whisper", color: "lavender" },
    { title: "Soulmate", path: "/soulmate", color: "calm" },
    { title: "Feed", path: "/feed", color: "sage" },
    { title: "Calm Space", path: "/calm", color: "lavender" },
    { title: "Humour Club", path: "/humour", color: "amber" }
  ];

  const isActive = (path: string) => location === path;

  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 mt-6">
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full"></div>
            <h1 className="text-lg font-semibold tracking-tight text-white">EchoSoul</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <span
                  className={`px-4 py-2 text-sm font-medium transition-all duration-300 cursor-pointer ${
                    isActive(item.path)
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.title}
                </span>
              </Link>
            ))}
          </div>
            
          {/* User menu */}
          {isAuthenticated && typedUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={typedUser.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {typedUser.firstName?.[0] || typedUser.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-black/90 border-white/20 text-white">
                <DropdownMenuItem className="focus:bg-white/10">
                  <div className="flex flex-col">
                    <span className="font-medium">{typedUser.firstName || "User"}</span>
                    <span className="text-sm text-gray-400">{typedUser.email}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="focus:bg-white/10 cursor-pointer"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={handleLogin}
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 border border-white/20"
            >
              Sign In
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="lg:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "✕" : "☰"}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
