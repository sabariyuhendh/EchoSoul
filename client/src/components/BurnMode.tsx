
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Flame, ArrowLeft } from 'lucide-react';

interface BurnModeProps {
  content: string;
  onBack: () => void;
  onComplete: () => void;
}

const BurnMode = ({ content, onBack, onComplete }: BurnModeProps) => {
  const [burnProgress, setBurnProgress] = useState(0);
  const [isIgnited, setIsIgnited] = useState(false);
  const [burnedText, setBurnedText] = useState(content);
  const [flames, setFlames] = useState<Array<{id: number, x: number, y: number, size: number}>>([]);

  useEffect(() => {
    if (isIgnited) {
      // Create flame particles
      const newFlames = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: 60 + Math.random() * 30,
        size: 20 + Math.random() * 40
      }));
      setFlames(newFlames);

      const burnInterval = setInterval(() => {
        setBurnProgress(prev => {
          const newProgress = prev + 1;
          
          // Gradually burn away text
          if (newProgress > 20 && newProgress < 80) {
            const burnAmount = Math.floor((newProgress - 20) / 60 * content.length);
            const remainingText = content.slice(burnAmount);
            setBurnedText(remainingText);
          }
          
          if (newProgress >= 100) {
            clearInterval(burnInterval);
            setBurnedText('');
            setTimeout(() => {
              onComplete();
            }, 2000);
            return 100;
          }
          return newProgress;
        });
      }, 80);

      return () => clearInterval(burnInterval);
    }
  }, [isIgnited, content, onComplete]);

  const startBurning = () => {
    setIsIgnited(true);
    setBurnProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-900 via-red-900 to-black text-white relative overflow-hidden">
      {/* Fire Effects */}
      {isIgnited && (
        <div className="absolute inset-0 z-10">
          {flames.map(flame => (
            <div
              key={flame.id}
              className="absolute animate-pulse"
              style={{
                left: `${flame.x}%`,
                bottom: `${flame.y}%`,
                width: `${flame.size}px`,
                height: `${flame.size * 1.5}px`,
              }}
            >
              <div className="w-full h-full bg-gradient-to-t from-red-500 via-orange-400 to-yellow-300 rounded-full opacity-80 animate-bounce" 
                   style={{animationDuration: `${0.5 + Math.random()}s`}} />
            </div>
          ))}
          
          {/* Floating embers */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={`ember-${i}`}
              className="absolute w-2 h-2 bg-orange-400 rounded-full animate-ping"
              style={{
                left: `${20 + Math.random() * 60}%`,
                bottom: `${10 + Math.random() * 80}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto relative z-20 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-orange-200 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>

        {/* Paper with Text */}
        <div className="relative mb-8">
          <div className={`bg-yellow-50 p-8 rounded-lg shadow-2xl transition-all duration-300 ${
            isIgnited ? 'bg-gradient-to-t from-orange-100 to-yellow-50 border-2 border-orange-300' : ''
          }`}>
            <Textarea
              value={burnedText}
              readOnly
              className={`min-h-64 bg-transparent border-none text-lg resize-none focus:ring-0 transition-all duration-300 ${
                isIgnited ? 'text-red-700' : 'text-gray-800'
              }`}
              style={{
                textShadow: isIgnited ? '0 0 5px rgba(255, 100, 0, 0.5)' : 'none',
                fontFamily: 'serif'
              }}
            />
            
            {/* Burn holes effect */}
            {isIgnited && burnProgress > 30 && (
              <>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-black rounded-full opacity-60"
                    style={{
                      width: `${10 + Math.random() * 20}px`,
                      height: `${10 + Math.random() * 20}px`,
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <Card className="bg-black/30 backdrop-blur-sm border-orange-400/30 p-6 text-center">
          {!isIgnited ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Ready to burn it away?</h2>
              <Button
                onClick={startBurning}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
              >
                <Flame className="w-4 h-4 mr-2" />
                Ignite
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Flame className="w-8 h-8 text-white animate-bounce" />
              </div>
              <h2 className="text-xl font-semibold">
                {burnProgress < 30 ? 'Catching fire...' : 
                 burnProgress < 70 ? 'Burning away...' : 
                 'Turning to ash...'}
              </h2>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-red-500 to-orange-400 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${burnProgress}%` }}
                />
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BurnMode;
