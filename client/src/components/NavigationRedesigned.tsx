import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@shared/schema';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, Menu, X } from 'lucide-react';

const NavigationRedesigned = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const typedUser = user as User | undefined;

  // Main navigation items (always visible)
  const mainNavItems = [
    { title: "Vault", path: "/vault", color: "from-blue-400 to-cyan-400" },
    { title: "Letters Live", path: "/letters", color: "from-green-400 to-emerald-400" },
    { title: "Let It Go", path: "/letitgo", color: "from-red-400 to-orange-400" },
    { title: "Mood", path: "/mood", color: "from-pink-400 to-rose-400" },
    { title: "Calm Space", path: "/calm", color: "from-purple-400 to-indigo-400" }
  ];

  // Dropdown "More" items
  const moreNavItems = [
    { title: "Whisper", path: "/whisper", color: "from-indigo-400 to-purple-400" },
    { title: "Lyra", path: "/soulmate", color: "from-blue-400 to-cyan-400" },
    { title: "Feed", path: "/feed", color: "from-green-400 to-teal-400" },
    { title: "Humour Club", path: "/humour", color: "from-yellow-400 to-orange-400" },
    { title: "Reflection Room", path: "/reflection", color: "from-violet-400 to-purple-400" }
  ];

  const isActive = (path: string) => location === path;

  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 mt-4 w-full max-w-7xl px-4">
      <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <h1 className="text-xl font-light text-white tracking-wide">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-rose-400">
                Echo
              </span>
              <span className="text-gray-300">
                Soul
              </span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Main nav items */}
            {mainNavItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className={`
                    relative px-4 py-2 text-sm font-medium transition-all duration-200 
                    ${isActive(item.path) 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }
                    rounded-full
                  `}
                >
                  {item.title}
                </Button>
              </Link>
            ))}
            
            {/* More dropdown */}
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-full flex items-center gap-1"
                >
                  More
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl"
              >
                {moreNavItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <DropdownMenuItem
                      className={`
                        px-4 py-3 text-sm font-medium transition-all duration-200 rounded-xl cursor-pointer
                        ${isActive(item.path) 
                          ? `bg-gradient-to-r ${item.color} text-white` 
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }
                      `}
                    >
                      {item.title}
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-white/10 rounded-full px-3 py-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={typedUser?.profileImageUrl || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-xs">
                        {typedUser?.firstName?.[0]?.toUpperCase() || typedUser?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-300 hidden md:block">{typedUser?.firstName || typedUser?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-40 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl"
                >
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={handleLogin}
                className="apple-button bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20"
              >
                Sign In
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden hover:bg-white/10 rounded-full p-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-white/10">
            <div className="space-y-2">
              {/* Main nav items */}
              {mainNavItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    className={`
                      w-full justify-start px-4 py-3 text-sm font-medium transition-all duration-200 
                      ${isActive(item.path) 
                        ? `bg-gradient-to-r ${item.color} text-white` 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }
                      rounded-xl
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.title}
                  </Button>
                </Link>
              ))}
              
              {/* More section */}
              <div className="pt-2">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-2">
                  More
                </div>
                {moreNavItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive(item.path) ? "default" : "ghost"}
                      size="sm"
                      className={`
                        w-full justify-start px-4 py-3 text-sm font-medium transition-all duration-200 
                        ${isActive(item.path) 
                          ? `bg-gradient-to-r ${item.color} text-white` 
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }
                        rounded-xl
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.title}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationRedesigned;