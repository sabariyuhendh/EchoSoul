import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flame, ArrowLeft } from 'lucide-react';

interface BurnModeProps {
  content: string;
  onBack: () => void;
  onComplete: () => void;
}

const BurnMode = ({ content, onBack, onComplete }: BurnModeProps) => {
  const [isBurning, setIsBurning] = useState(false);
  const [burnProgress, setBurnProgress] = useState(0);
  const [ashParticles, setAshParticles] = useState<Array<{id: number, x: number, y: number, opacity: number}>>([]);
  const [textChars, setTextChars] = useState<Array<{char: string, burned: boolean, id: number}>>([]);

  useEffect(() => {
    // Split content into individual characters for burning effect
    const chars = content.split('').map((char, i) => ({
      char,
      burned: false,
      id: i
    }));
    setTextChars(chars);
  }, [content]);

  useEffect(() => {
    if (isBurning && burnProgress < 100) {
      const interval = setInterval(() => {
        setBurnProgress(prev => {
          const newProgress = Math.min(prev + 1, 100);
          
          // Burn characters progressively
          const charsToBurn = Math.floor((newProgress / 100) * textChars.length);
          setTextChars(prevChars => 
            prevChars.map((char, i) => ({
              ...char,
              burned: i < charsToBurn
            }))
          );
          
          // Create ash particles
          if (newProgress % 5 === 0) {
            const newParticles = Array.from({ length: 3 }, (_, i) => ({
              id: Date.now() + i,
              x: 45 + Math.random() * 10,
              y: 50 - (newProgress * 0.3),
              opacity: 1
            }));
            setAshParticles(prev => [...prev, ...newParticles]);
          }
          
          return newProgress;
        });
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [isBurning, burnProgress, textChars.length]);

  useEffect(() => {
    // Animate ash particles
    if (ashParticles.length > 0) {
      const interval = setInterval(() => {
        setAshParticles(prev => 
          prev.map(particle => ({
            ...particle,
            y: particle.y - 2,
            x: particle.x + (Math.random() - 0.5) * 2,
            opacity: Math.max(0, particle.opacity - 0.02)
          })).filter(p => p.opacity > 0)
        );
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [ashParticles]);

  useEffect(() => {
    if (burnProgress >= 100) {
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  }, [burnProgress, onComplete]);

  const startBurning = () => {
    setIsBurning(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-orange-950 text-white relative overflow-hidden page-content">
      {/* Fire glow effect */}
      {isBurning && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 80%, 
              rgba(255, 100, 0, ${0.3 * (burnProgress / 100)}) 0%, 
              transparent 70%)`
          }}
        />
      )}
      
      {/* Ash particles */}
      {ashParticles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-gray-400 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity,
            filter: 'blur(1px)',
            transform: `rotate(${particle.id * 45}deg)`
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="absolute top-6 left-6 apple-button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Paper with text */}
        <div className="relative">
          <Card 
            className="relative p-12 max-w-2xl transition-all duration-500"
            style={{
              background: isBurning 
                ? `linear-gradient(to top, 
                    transparent ${burnProgress * 0.8}%, 
                    #8B4513 ${burnProgress * 0.8 + 5}%, 
                    #D2691E ${burnProgress * 0.8 + 10}%, 
                    #FFF8DC ${burnProgress * 0.8 + 15}%)`
                : '#FFF8DC',
              boxShadow: isBurning 
                ? `0 0 ${20 + burnProgress * 0.3}px rgba(255, 100, 0, 0.5)` 
                : '0 10px 30px rgba(0,0,0,0.3)',
              transform: isBurning ? `scale(${1 - burnProgress * 0.002})` : 'scale(1)',
              filter: burnProgress > 90 ? `brightness(${1 - (burnProgress - 90) * 0.08})` : 'none'
            }}
          >
            {/* Burn edge effect */}
            {isBurning && burnProgress < 100 && (
              <div 
                className="absolute left-0 right-0 h-4 pointer-events-none"
                style={{
                  bottom: `${100 - burnProgress}%`,
                  background: 'linear-gradient(to top, transparent, #FF4500, #FFD700, transparent)',
                  filter: 'blur(2px)',
                  animation: 'flicker 0.1s infinite'
                }}
              />
            )}
            
            {/* Text content with burning effect */}
            <div className="relative z-10">
              <p className="text-2xl font-handwriting leading-relaxed">
                {textChars.map((charObj, i) => (
                  <span
                    key={charObj.id}
                    className="transition-all duration-300 inline-block"
                    style={{
                      color: charObj.burned ? 'transparent' : '#2C1810',
                      textShadow: charObj.burned 
                        ? '0 0 5px rgba(255, 100, 0, 0.8)' 
                        : 'none',
                      transform: charObj.burned 
                        ? `translateY(-${Math.random() * 10}px) scale(0.8)` 
                        : 'none',
                      opacity: charObj.burned ? 0 : 1
                    }}
                  >
                    {charObj.char}
                  </span>
                ))}
              </p>
            </div>

            {/* Realistic flame particles */}
            {isBurning && burnProgress < 95 && (
              <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute bottom-0 w-8 h-16"
                    style={{
                      left: `${10 + i * 8}%`,
                      animation: `flame ${0.5 + Math.random() * 0.5}s infinite alternate`,
                      animationDelay: `${Math.random() * 0.5}s`
                    }}
                  >
                    <div 
                      className="w-full h-full rounded-full"
                      style={{
                        background: `radial-gradient(ellipse at bottom, 
                          #FFD700 0%, 
                          #FF6347 30%, 
                          #FF4500 60%, 
                          transparent 100%)`,
                        filter: 'blur(2px)'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Controls */}
        <div className="mt-12 text-center">
          {!isBurning ? (
            <Button
              onClick={startBurning}
              className="apple-button bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Flame className="w-5 h-5 mr-2" />
              Set It Free
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-orange-300">
                {burnProgress < 100 ? 'Releasing into the universe...' : 'Released. You are free.'}
              </p>
              <div className="w-64 h-2 bg-gray-800 rounded-full mx-auto overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                  style={{ width: `${burnProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flame {
          0% { 
            transform: translateY(0) scaleX(1) scaleY(1); 
            opacity: 0.8;
          }
          50% { 
            transform: translateY(-20px) scaleX(1.1) scaleY(1.2); 
            opacity: 1;
          }
          100% { 
            transform: translateY(-40px) scaleX(0.8) scaleY(1.5); 
            opacity: 0.4;
          }
        }
        
        @keyframes flicker {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        
        .font-handwriting {
          font-family: 'Caveat', cursive, -apple-system, sans-serif;
          font-size: 1.5rem;
        }
      `}} />
    </div>
  );
};

export default BurnMode;