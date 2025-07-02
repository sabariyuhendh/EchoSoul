
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
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/90 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-green-400 rounded-full"></div>
            <h1 className="text-xl font-semibold tracking-tight text-white">EchoSoul</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  className={`px-4 py-2 transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.title}
                </Button>
              </Link>
            ))}
            
            {/* User menu */}
            {isAuthenticated && typedUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="ml-4">
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
                className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "✕" : "☰"}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4">
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
      </div>
    </nav>
  );
};

export default Navigation;
