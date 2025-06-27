
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Flame, Zap, Mic, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import BurnMode from '@/components/BurnMode';
import SmashMode from '@/components/SmashMode';
import ScreamMode from '@/components/ScreamMode';

type ReleaseMode = 'burn' | 'smash' | 'scream';

const LetItGo = () => {
  const [mode, setMode] = useState<ReleaseMode | null>(null);
  const [content, setContent] = useState('');
  const [timeLeft, setTimeLeft] = useState(3600);

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

  const handleModeComplete = () => {
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

  if (mode === 'smash') {
    return (
      <SmashMode 
        content={content}
        onBack={handleBackToSelection}
        onComplete={handleModeComplete}
      />
    );
  }

  if (mode === 'scream') {
    return (
      <ScreamMode 
        content={content}
        onBack={handleBackToSelection}
        onComplete={handleModeComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <Timer className="w-4 h-4" />
            <span className="text-sm">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
            <Flame className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Let It Go Room</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            A safe space to release your emotions. Choose how you want to let it go – nothing is saved, everything disappears.
          </p>
        </div>

        {/* Writing Area */}
        <Card className="bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-12 animate-fade-in">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write everything you want to release... your anger, frustration, pain. Choose how you want to let it go."
            className="min-h-48 bg-transparent border-none text-lg resize-none focus:ring-0 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600"
          />
        </Card>

        {/* Mode Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Burn Mode */}
          <Card 
            className="bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 p-8 hover:shadow-xl dark:hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group hover:ring-2 hover:ring-red-500/20 animate-fade-in"
            onClick={() => content.trim() && setMode('burn')}
          >
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4 group-hover:animate-bounce">
                🔥
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Burn Mode</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Write what's bothering you and watch it burn away in flames.
                </p>
              </div>
              <Button
                disabled={!content.trim()}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 disabled:opacity-50"
              >
                Choose Mode
              </Button>
            </div>
          </Card>

          {/* Smash Mode */}
          <Card 
            className="bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 p-8 hover:shadow-xl dark:hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group hover:ring-2 hover:ring-yellow-500/20 animate-fade-in"
            onClick={() => content.trim() && setMode('smash')}
            style={{ animationDelay: '0.1s' }}
          >
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4 group-hover:animate-bounce">
                💥
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Smash Mode</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Break virtual objects to release your frustration safely.
                </p>
              </div>
              <Button
                disabled={!content.trim()}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 disabled:opacity-50"
              >
                Choose Mode
              </Button>
            </div>
          </Card>

          {/* Scream Mode */}
          <Card 
            className="bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 p-8 hover:shadow-xl dark:hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group hover:ring-2 hover:ring-blue-500/20 animate-fade-in"
            onClick={() => content.trim() && setMode('scream')}
            style={{ animationDelay: '0.2s' }}
          >
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4 group-hover:animate-bounce">
                🎤
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Scream Mode</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Let it all out vocally – shatter glass with the power of your voice.
                </p>
              </div>
              <Button
                disabled={!content.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 disabled:opacity-50"
              >
                Choose Mode
              </Button>
            </div>
          </Card>
        </div>

        {/* Privacy Note */}
        <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            <Timer className="w-4 h-4 inline mr-1" />
            All entries auto-delete after 1 hour for your privacy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LetItGo;
