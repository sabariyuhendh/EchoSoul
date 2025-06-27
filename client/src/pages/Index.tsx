import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, MessageCircle, BookOpen, Mic, TrendingUp, Sparkles, Shield, Clock, ArrowRight, Flame, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: "Vault",
      description: "8-minute timed emotional release sessions in your private space",
      color: "calm",
      gradient: "bg-calm-gradient",
      path: "/vault"
    },
    {
      icon: MessageCircle,
      title: "Letters You'll Never Send",
      description: "Write and stylize emotional letters with AI assistance",
      color: "sage",
      gradient: "bg-sage-gradient",
      path: "/letters"
    },
    {
      icon: Flame,
      title: "Let-It-Go Room",
      description: "Interactive emotional release through virtual destruction",
      color: "lavender",
      gradient: "bg-lavender-gradient",
      path: "/letitgo"
    },
    {
      icon: TrendingUp,
      title: "Mood Tracking",
      description: "Daily mood logging with insights and trend analysis",
      color: "rose",
      gradient: "bg-rose-gradient",
      path: "/mood"
    },
    {
      icon: Mic,
      title: "WhisperBox",
      description: "Voice diary for private audio reflections and thoughts",
      color: "amber",
      gradient: "bg-amber-gradient",
      path: "/whisper"
    },
    {
      icon: Heart,
      title: "AI Soulmate",
      description: "Mood-aware AI companion for emotional support",
      color: "calm",
      gradient: "bg-wellness-flow",
      path: "/soulmate"
    },
    {
      icon: Users,
      title: "Community Feed",
      description: "Anonymous sharing of emotional insights and support",
      color: "sage",
      gradient: "bg-wellness-flow",
      path: "/feed"
    },
    {
      icon: Sparkles,
      title: "Calm Space",
      description: "Meditative space with cosmic visuals and calming music",
      color: "lavender",
      gradient: "bg-wellness-flow",
      path: "/calm"
    }
  ];

  const values = [
    {
      icon: Shield,
      title: "Complete Privacy",
      description: "Your emotions are yours alone. Anonymous usage and secure storage.",
      color: "calm"
    },
    {
      icon: Heart,
      title: "Emotional Safety",
      description: "A judgment-free space designed specifically for teen emotional wellness.",
      color: "sage"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Access your emotional toolkit anytime, anywhere you need it.",
      color: "lavender"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section - Apple Style with Calming Accents */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        >
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-calm-500 to-sage-500 rounded-full blur-3xl opacity-20 breathe"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-lavender-500 to-rose-500 rounded-full blur-3xl opacity-20 breathe" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-amber-500 to-calm-500 rounded-full blur-3xl opacity-10 breathe" style={{animationDelay: '1s'}}></div>
        </div>

        <div className={`text-center max-w-5xl mx-auto transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-6xl md:text-8xl font-light mb-8 tracking-tight leading-none">
            Your Safe Space for
            <br />
            <span className="text-gradient-wellness font-normal text-glow-calm">Emotional Wellness</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            A private sanctuary designed for teens to process emotions, find peace, 
            and grow through various therapeutic tools and AI-powered support.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/vault">
              <Button className="apple-button bg-gradient-to-r from-calm-500 to-sage-500 text-white hover:from-calm-600 hover:to-sage-600 px-8 py-4 text-lg font-medium border-0 calm-shadow">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/calm">
              <Button variant="outline" className="apple-button border-white/30 text-white hover:bg-white/10 hover:border-calm-400/50 px-8 py-4 text-lg font-light">
                Enter Calm Space
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className={`transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-20">
            <h3 className="text-5xl md:text-6xl font-light mb-6 tracking-tight">
              Emotional Wellness
              <br />
              <span className="text-gradient-wellness">Tools</span>
            </h3>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
              Eight powerful tools designed to help you navigate your emotional journey with calm and clarity
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const cardClass = `${feature.color}-card`;
              return (
                <Link key={feature.title} to={feature.path}>
                  <Card 
                    className={`${cardClass} p-8 transition-all duration-700 cursor-pointer ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{animationDelay: `${600 + index * 100}ms`}}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br from-${feature.color}-400 to-${feature.color}-600 rounded-2xl flex items-center justify-center mb-6 breathe`} style={{animationDelay: `${index * 500}ms`}}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-medium mb-4 tracking-tight">{feature.title}</h4>
                    <p className="text-gray-400 leading-relaxed font-light">{feature.description}</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 px-6 max-w-6xl mx-auto">
        <div className={`transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-20">
            <h3 className="text-5xl md:text-6xl font-light mb-6 tracking-tight">
              Built with
              <br />
              <span className="text-gradient-calm text-glow-calm">Care</span>
            </h3>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
              Every feature is designed with your emotional safety and privacy in mind
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Shield,
                title: "Complete Privacy",
                description: "Your emotions are yours alone. Anonymous usage and secure storage.",
                color: "calm"
              },
              {
                icon: Heart,
                title: "Emotional Safety",
                description: "A judgment-free space designed specifically for teen emotional wellness.",
                color: "sage"
              },
              {
                icon: Clock,
                title: "24/7 Support",
                description: "Access your emotional toolkit anytime, anywhere you need it.",
                color: "lavender"
              }
            ].map((value, index) => (
              <div 
                key={value.title}
                className={`text-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{animationDelay: `${900 + index * 150}ms`}}
              >
                <div className={`w-16 h-16 bg-gradient-to-br from-${value.color}-400 to-${value.color}-600 rounded-3xl flex items-center justify-center mx-auto mb-6 apple-hover breathe`} style={{animationDelay: `${index * 800}ms`}}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-medium mb-4 tracking-tight">{value.title}</h4>
                <p className="text-gray-400 leading-relaxed font-light">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 max-w-4xl mx-auto">
        <div className={`apple-card p-16 text-center transition-all duration-1000 delay-1000 relative overflow-hidden ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="absolute inset-0 bg-wellness-overlay opacity-50"></div>
          <div className="relative z-10">
            <h3 className="text-4xl md:text-5xl font-light mb-6 tracking-tight">
              Ready to Begin Your
              <br />
              <span className="text-gradient-wellness text-glow-calm">Emotional Wellness Journey?</span>
            </h3>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Join thousands of teens who have found peace, healing, and growth through EchoSoul.
              Your emotional wellness matters, and you deserve a safe space to grow.
            </p>
            <Link to="/vault">
              <Button className="apple-button bg-gradient-to-r from-calm-500 via-sage-500 to-lavender-500 text-white hover:from-calm-600 hover:via-sage-600 hover:to-lavender-600 px-12 py-4 text-lg font-medium border-0 calm-shadow">
                Start Free Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-calm-400 to-sage-400 rounded-full flex items-center justify-center breathe">
              <Heart className="w-3 h-3 text-white" />
            </div>
            <span className="text-gray-400 text-lg font-light text-gradient-wellness">EchoSoul</span>
          </div>
          <p className="text-gray-500 font-light">
            Your emotional wellness, your rules, your safe space.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
