
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, BookOpen, MessageCircle, Flame, TrendingUp, Mic, Users, Sparkles, Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: BookOpen, title: "Vault", path: "/vault", color: "calm" },
    { icon: MessageCircle, title: "Letters", path: "/letters", color: "sage" },
    { icon: Flame, title: "Let It Go", path: "/letitgo", color: "amber" },
    { icon: TrendingUp, title: "Mood", path: "/mood", color: "rose" },
    { icon: Mic, title: "Whisper", path: "/whisper", color: "lavender" },
    { icon: Heart, title: "Soulmate", path: "/soulmate", color: "calm" },
    { icon: Users, title: "Feed", path: "/feed", color: "sage" },
    { icon: Sparkles, title: "Calm Space", path: "/calm", color: "lavender" }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/90 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-calm-400 to-sage-400 rounded-full flex items-center justify-center breathe">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-gradient-wellness">EchoSoul</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  className={`apple-button px-4 py-2 transition-all duration-300 ${
                    isActive(item.path)
                      ? `bg-gradient-to-r from-${item.color}-500/20 to-${item.color}-600/20 text-${item.color}-400 border border-${item.color}-500/30`
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
                    className={`w-full justify-start apple-button transition-all duration-300 ${
                      isActive(item.path)
                        ? `bg-gradient-to-r from-${item.color}-500/20 to-${item.color}-600/20 text-${item.color}-400`
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
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
