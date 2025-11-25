
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Flame, Timer } from 'lucide-react';
import { Link } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import BurnMode from '@/components/BurnModeRealistic';

type ReleaseMode = 'burn';

const LetItGo = () => {
  const [mode, setMode] = useState<ReleaseMode | null>(null);
  const [content, setContent] = useState('');
  const [timeLeft, setTimeLeft] = useState(3600);
  const queryClient = useQueryClient();

  const createEntryMutation = useMutation({
    mutationFn: async ({ content, mode }: { content: string; mode: ReleaseMode }) => {
      return apiRequest('/api/letitgo', {
        method: 'POST',
        body: JSON.stringify({ content, mode }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/letitgo'] });
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleModeComplete = async () => {
    if (content.trim() && mode) {
      await createEntryMutation.mutateAsync({ content: content.trim(), mode });
    }
    setMode(null);
    setContent('');
  };

  const handleBackToSelection = () => {
    setMode(null);
  };

  // If a mode is active, render that mode's component
  if (mode === 'burn') {
    return (
      <BurnMode 
        content={content}
        onBack={handleBackToSelection}
        onComplete={handleModeComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white page-content">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-2 text-gray-400">
            <Timer className="w-4 h-4" />
            <span className="text-sm">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
            <Flame className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Let It Go Room</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A safe space to release your emotions. Write what's bothering you and watch it burn away – nothing is saved, everything disappears.
          </p>
        </div>

        {/* Writing Area */}
        <Card className="glass p-8 mb-8 animate-fade-in border border-white/10">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write everything you want to release... your anger, frustration, pain. Then watch it burn away."
            className="min-h-48 bg-transparent border-none text-lg resize-none focus:ring-0 text-white placeholder-gray-500"
          />
        </Card>

        {/* Burn Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={() => setMode('burn')}
            disabled={!content.trim()}
            className="immersive-button danger px-8 py-3"
          >
            <Flame className="w-5 h-5 mr-2" />
            Burn It Away
          </Button>
        </div>

        {/* Privacy Note */}
        <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-gray-400 text-sm">
            <Timer className="w-4 h-4 inline mr-1" />
            All entries auto-delete after 1 hour for your privacy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LetItGo;
