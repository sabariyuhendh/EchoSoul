import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Flame, ArrowLeft } from 'lucide-react';

interface BurnModeProps {
  content: string;
  onBack: () => void;
  onComplete: () => void;
}

const BurnMode = ({ content, onBack, onComplete }: BurnModeProps) => {
  const [stage, setStage] = useState<'paper' | 'lighting' | 'burning' | 'complete'>('paper');
  const [burnProgress, setBurnProgress] = useState(0);
  const [ashParticles, setAshParticles] = useState<Array<{id: number, x: number, y: number, opacity: number, size: number}>>([]);
  const [smokeParticles, setSmokeParticles] = useState<Array<{id: number, x: number, y: number, opacity: number, size: number}>>([]);
  const [flameParticles, setFlameParticles] = useState<Array<{id: number, x: number, y: number, intensity: number, width: number, height: number, offset: number}>>([]);
  const [textChars, setTextChars] = useState<Array<{char: string, burned: boolean, id: number, opacity: number}>>([]);
  const [matchVisible, setMatchVisible] = useState(false);
  const [paperCurled, setPaperCurled] = useState(false);

  useEffect(() => {
    // Split content into individual characters for burning effect
    const chars = content.split('').map((char, i) => ({
      char,
      burned: false,
      id: i,
      opacity: 1
    }));
    setTextChars(chars);
  }, [content]);

  // Start lighting sequence
  useEffect(() => {
    if (stage === 'lighting') {
      setMatchVisible(true);
      setTimeout(() => {
        setStage('burning');
        setMatchVisible(false);
      }, 1500);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'burning' && burnProgress < 100) {
      const interval = setInterval(() => {
        setBurnProgress(prev => {
          const newProgress = Math.min(prev + 0.8, 100);
          
          // Burn characters progressively from bottom to top
          const burnLine = 100 - newProgress; // Line moves from bottom (100%) to top (0%)
          const charsToBurn = Math.floor(((100 - burnLine) / 100) * textChars.length);
          
          setTextChars(prevChars => 
            prevChars.map((char, i) => {
              const charPosition = (i / prevChars.length) * 100;
              const isBurned = charPosition > burnLine;
              return {
                ...char,
                burned: isBurned,
                opacity: isBurned ? Math.max(0, char.opacity - 0.1) : char.opacity
              };
            })
          );
          
          // Create realistic flame particles at burn line
          if (newProgress % 1.5 === 0) {
            const flameCount = Math.floor(3 + (newProgress / 20));
            const newFlames = Array.from({ length: flameCount }, (_, i) => ({
              id: Date.now() + i,
              x: 35 + Math.random() * 30, // Spread flames across the width
              y: burnLine + (Math.random() - 0.5) * 3, // Slight variation in height
              intensity: 0.9 + Math.random() * 0.1,
              width: 15 + Math.random() * 20, // Varying flame widths
              height: 25 + Math.random() * 35, // Varying flame heights
              offset: (Math.random() - 0.5) * 10 // Horizontal offset for natural look
            }));
            setFlameParticles(prev => [...prev.slice(-25), ...newFlames]);
          }

          // Paper curling effect as it burns
          if (newProgress > 20 && !paperCurled) {
            setPaperCurled(true);
          }
          
          // Create ash particles - more realistic
          if (newProgress % 2 === 0) {
            const ashCount = Math.floor(1 + (newProgress / 30));
            const newParticles = Array.from({ length: ashCount }, (_, i) => ({
              id: Date.now() + i + 1000,
              x: 35 + Math.random() * 30,
              y: burnLine - 3 - Math.random() * 5,
              opacity: 0.8 + Math.random() * 0.2,
              size: 1 + Math.random() * 4
            }));
            setAshParticles(prev => [...prev.slice(-50), ...newParticles]);
          }
          
          // Create smoke particles - more realistic
          if (newProgress % 2.5 === 0) {
            const smokeCount = Math.floor(1 + (newProgress / 25));
            const newSmoke = Array.from({ length: smokeCount }, (_, i) => ({
              id: Date.now() + i + 2000,
              x: 40 + Math.random() * 20,
              y: burnLine - 8 - Math.random() * 5,
              opacity: 0.4 + Math.random() * 0.3,
              size: 10 + Math.random() * 15
            }));
            setSmokeParticles(prev => [...prev.slice(-30), ...newSmoke]);
          }
          
          return newProgress;
        });
      }, 40);
      
      return () => clearInterval(interval);
    }
  }, [stage, burnProgress, textChars.length]);

  useEffect(() => {
    // Animate ash particles
    if (ashParticles.length > 0) {
      const interval = setInterval(() => {
        setAshParticles(prev => 
          prev.map(particle => ({
            ...particle,
            y: particle.y - 1.5,
            x: particle.x + (Math.random() - 0.5) * 1.5,
            opacity: Math.max(0, particle.opacity - 0.015)
          })).filter(p => p.opacity > 0)
        );
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [ashParticles]);

  useEffect(() => {
    // Animate smoke particles
    if (smokeParticles.length > 0) {
      const interval = setInterval(() => {
        setSmokeParticles(prev => 
          prev.map(particle => ({
            ...particle,
            y: particle.y - 1,
            x: particle.x + (Math.random() - 0.5) * 0.8,
            opacity: Math.max(0, particle.opacity - 0.01),
            size: particle.size + 0.5
          })).filter(p => p.opacity > 0 && p.y > -10)
        );
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [smokeParticles]);

  useEffect(() => {
    // Animate flame particles - more realistic movement
    if (flameParticles.length > 0) {
      const interval = setInterval(() => {
        setFlameParticles(prev => 
          prev.map(particle => ({
            ...particle,
            y: particle.y - 0.3 - Math.random() * 0.5, // Flames rise and flicker
            x: particle.x + (Math.random() - 0.5) * 1.5 + Math.sin(Date.now() / 200) * 0.5, // Natural swaying
            intensity: Math.max(0, particle.intensity - 0.015),
            width: particle.width + (Math.random() - 0.5) * 2, // Flames expand and contract
            height: particle.height + (Math.random() - 0.5) * 3,
            offset: particle.offset + (Math.random() - 0.5) * 2
          })).filter(p => p.intensity > 0 && p.y > -10)
        );
      }, 40);
      
      return () => clearInterval(interval);
    }
  }, [flameParticles]);

  useEffect(() => {
    if (burnProgress >= 100 && stage === 'burning') {
      setTimeout(() => {
        setStage('complete');
        setTimeout(() => {
          onComplete();
        }, 1500);
      }, 1000);
    }
  }, [burnProgress, stage, onComplete]);

  const startBurning = () => {
    setStage('lighting');
  };

  const burnLine = 100 - burnProgress;

  return (
    <div className="min-h-screen text-white relative overflow-hidden page-content" 
      style={{
        background: stage === 'burning' || stage === 'complete'
          ? `radial-gradient(ellipse at 50% ${burnLine}%, 
              rgba(20, 10, 0, 0.95) 0%,
              rgba(10, 5, 0, 0.98) 20%,
              rgba(0, 0, 0, 1) 50%,
              #000000 100%)`
          : '#000000'
      }}
    >
      {/* Realistic fire glow effect - darker, more atmospheric */}
      {stage === 'burning' && (
        <>
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              background: `radial-gradient(ellipse at 50% ${burnLine}%, 
                rgba(255, 140, 0, ${0.25 * (burnProgress / 100)}) 0%, 
                rgba(255, 69, 0, ${0.15 * (burnProgress / 100)}) 25%,
                rgba(139, 0, 0, ${0.08 * (burnProgress / 100)}) 50%,
                transparent 80%)`,
              filter: 'blur(40px)'
            }}
          />
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              background: `radial-gradient(ellipse at 50% ${burnLine}%, 
                rgba(255, 200, 100, ${0.15 * (burnProgress / 100)}) 0%, 
                transparent 60%)`,
              filter: 'blur(60px)'
            }}
          />
        </>
      )}
      
      {/* Smoke particles */}
      {smokeParticles.map(particle => (
        <div
          key={particle.id}
          className="absolute bg-gray-600 rounded-full pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            filter: 'blur(4px)',
            transform: `translate(-50%, -50%)`
          }}
        />
      ))}

      {/* Ash particles */}
      {ashParticles.map(particle => (
        <div
          key={particle.id}
          className="absolute bg-gray-500 rounded-full pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            filter: 'blur(1px)',
            transform: `translate(-50%, -50%) rotate(${particle.id * 45}deg)`
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
          <div 
            className="relative p-12 max-w-2xl mx-auto transition-all duration-500"
            style={{
              background: stage === 'burning' || stage === 'complete'
                ? `linear-gradient(to top, 
                    transparent ${Math.max(0, burnLine - 1)}%, 
                    #0a0500 ${Math.max(0, burnLine - 1.5)}%, 
                    #1a0a00 ${Math.max(0, burnLine - 3)}%, 
                    #2a1500 ${Math.max(0, burnLine - 5)}%, 
                    #4a1a00 ${Math.max(0, burnLine - 7)}%, 
                    #6B2F00 ${Math.max(0, burnLine - 10)}%, 
                    #8B4513 ${Math.max(0, burnLine - 13)}%, 
                    #A0522D ${Math.max(0, burnLine - 16)}%, 
                    #D2691E ${Math.max(0, burnLine - 20)}%, 
                    #DEB887 ${Math.max(0, burnLine - 25)}%, 
                    #F5DEB3 ${Math.max(0, burnLine - 30)}%, 
                    #FFF8DC ${Math.max(0, burnLine - 35)}%)`
                : '#FFF8DC',
              boxShadow: stage === 'burning'
                ? `0 0 ${40 + burnProgress * 0.5}px rgba(255, 140, 0, 0.7),
                   0 0 ${80 + burnProgress * 0.7}px rgba(255, 69, 0, 0.5),
                   0 0 ${120 + burnProgress * 0.9}px rgba(200, 0, 0, 0.3),
                   0 10px 40px rgba(0,0,0,0.5),
                   inset 0 -${burnProgress * 0.5}px 20px rgba(255, 69, 0, 0.3)` 
                : '0 10px 30px rgba(0,0,0,0.3)',
              transform: stage === 'burning' 
                ? `scale(${1 - burnProgress * 0.002}) 
                   perspective(1000px) 
                   rotateX(${paperCurled ? Math.min(5, burnProgress * 0.05) : 0}deg)
                   rotateY(${paperCurled ? (Math.sin(burnProgress) * 2) : 0}deg)` 
                : 'scale(1)',
              filter: burnProgress > 80 
                ? `brightness(${Math.max(0.3, 1 - (burnProgress - 80) * 0.015)}) 
                   contrast(${1 + (burnProgress - 80) * 0.01})` 
                : 'none',
              borderRadius: '4px',
              border: stage === 'burning' && burnProgress < 50
                ? `1px solid rgba(139, 69, 19, ${1 - burnProgress / 50})`
                : '1px solid rgba(0,0,0,0.1)',
              clipPath: stage === 'burning' && burnProgress > 10
                ? `inset(0 0 ${burnLine}% 0)`
                : 'none'
            }}
          >
            {/* Match/Lighter during lighting stage */}
            {matchVisible && (
              <div 
                className="absolute pointer-events-none z-20"
                style={{
                  left: '45%',
                  bottom: '10%',
                  transform: 'translateX(-50%)',
                  animation: 'matchStrike 1.5s ease-out'
                }}
              >
                <div className="relative">
                  {/* Match stick */}
                  <div 
                    className="absolute"
                    style={{
                      width: '4px',
                      height: '60px',
                      background: 'linear-gradient(to bottom, #8B4513, #654321)',
                      borderRadius: '2px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(-15deg)',
                      transformOrigin: 'bottom center'
                    }}
                  />
                  {/* Match head */}
                  <div 
                    className="absolute"
                    style={{
                      width: '8px',
                      height: '8px',
                      background: 'radial-gradient(circle, #FFD700, #FF4500)',
                      borderRadius: '50%',
                      left: '50%',
                      bottom: '60px',
                      transform: 'translateX(-50%)',
                      boxShadow: '0 0 10px rgba(255, 140, 0, 0.8)',
                      animation: 'matchFlame 1.5s ease-out'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Realistic burn edge effect - irregular burning line */}
            {stage === 'burning' && burnProgress < 100 && (
              <>
                {/* Main burn line with irregular edges */}
                <div 
                  className="absolute left-0 right-0 pointer-events-none z-10"
                  style={{
                    bottom: `${burnLine}%`,
                    height: '12px',
                    background: `linear-gradient(to top, 
                      transparent 0%,
                      rgba(0, 0, 0, 0.9) 10%,
                      rgba(50, 20, 0, 0.95) 20%,
                      rgba(100, 40, 0, 1) 30%,
                      rgba(200, 80, 0, 1) 40%,
                      rgba(255, 140, 0, 1) 50%,
                      rgba(255, 200, 0, 0.9) 60%,
                      rgba(255, 255, 150, 0.7) 70%,
                      rgba(255, 200, 0, 0.5) 80%,
                      transparent 100%)`,
                    filter: 'blur(4px)',
                    animation: 'flicker 0.12s infinite',
                    boxShadow: `0 0 30px rgba(255, 140, 0, 0.9),
                               0 0 60px rgba(255, 69, 0, 0.7),
                               0 0 90px rgba(255, 69, 0, 0.5),
                               0 0 120px rgba(200, 0, 0, 0.3)`,
                    clipPath: `polygon(
                      0% 0%,
                      ${10 + Math.sin(burnProgress) * 5}% ${Math.random() * 20}%,
                      ${30 + Math.cos(burnProgress * 2) * 5}% ${20 + Math.random() * 15}%,
                      ${50 + Math.sin(burnProgress * 1.5) * 8}% ${30 + Math.random() * 20}%,
                      ${70 + Math.cos(burnProgress * 3) * 5}% ${40 + Math.random() * 15}%,
                      ${90 + Math.sin(burnProgress * 2) * 5}% ${50 + Math.random() * 20}%,
                      100% 0%,
                      100% 100%,
                      0% 100%
                    )`
                  }}
                />
                {/* Secondary glow layer */}
                <div 
                  className="absolute left-0 right-0 pointer-events-none z-9"
                  style={{
                    bottom: `${burnLine - 2}%`,
                    height: '20px',
                    background: `radial-gradient(ellipse at center, 
                      rgba(255, 200, 100, 0.6) 0%,
                      rgba(255, 140, 0, 0.4) 30%,
                      transparent 70%)`,
                    filter: 'blur(8px)',
                    animation: 'flicker 0.18s infinite'
                  }}
                />
              </>
            )}
            
            {/* Text content with burning effect */}
            <div className="relative z-10" style={{ minHeight: '200px' }}>
              {content ? (
                <p 
                  className="text-xl font-medium leading-relaxed"
                  style={{
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    color: '#2c2c2c'
                  }}
                >
                  {textChars.map((charObj, i) => (
                    <span
                      key={charObj.id}
                      className="transition-all duration-200 inline-block"
                      style={{
                        color: charObj.burned 
                          ? 'transparent' 
                          : charObj.opacity < 1 
                            ? `rgba(44, 44, 44, ${charObj.opacity})`
                            : '#2c2c2c',
                        fontWeight: 500,
                        textShadow: charObj.burned 
                          ? '0 0 10px rgba(255, 140, 0, 0.9), 0 0 20px rgba(255, 69, 0, 0.7)' 
                          : '0 1px 2px rgba(0, 0, 0, 0.1)',
                        transform: charObj.burned 
                          ? `translateY(-${Math.random() * 8}px) scale(0.9)` 
                          : 'none',
                        opacity: charObj.opacity,
                        letterSpacing: '0.03em',
                        lineHeight: '1.8'
                      }}
                    >
                      {charObj.char === ' ' ? '\u00A0' : charObj.char}
                    </span>
                  ))}
                </p>
              ) : (
                <p className="text-gray-400 text-center">No content to burn</p>
              )}
            </div>

            {/* Realistic flame particles at burn line - more dynamic */}
            {flameParticles.map(particle => (
              <div
                key={particle.id}
                className="absolute pointer-events-none z-10"
                style={{
                  left: `${particle.x + particle.offset}%`,
                  bottom: `${particle.y}%`,
                  width: `${particle.width}px`,
                  height: `${particle.height}px`,
                  background: `radial-gradient(ellipse at bottom, 
                    rgba(255, 255, 255, ${particle.intensity * 0.9}) 0%, 
                    rgba(255, 255, 200, ${particle.intensity * 0.95}) 5%,
                    rgba(255, 220, 100, ${particle.intensity}) 15%, 
                    rgba(255, 180, 50, ${particle.intensity * 0.9}) 30%, 
                    rgba(255, 140, 0, ${particle.intensity * 0.8}) 50%, 
                    rgba(255, 100, 0, ${particle.intensity * 0.6}) 70%,
                    rgba(255, 69, 0, ${particle.intensity * 0.4}) 85%,
                    rgba(200, 0, 0, ${particle.intensity * 0.2}) 95%,
                    transparent 100%)`,
                  filter: `blur(${1 + Math.random()}px)`,
                  transform: `translateX(-50%) 
                             scaleX(${1 + Math.sin(Date.now() / 100 + particle.id) * 0.2}) 
                             scaleY(${1 + Math.cos(Date.now() / 120 + particle.id) * 0.3})`,
                  animation: 'flameFlicker 0.25s infinite alternate',
                  borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                  mixBlendMode: 'screen'
                }}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-12 text-center">
          {stage === 'paper' ? (
            <Button
              onClick={startBurning}
              className="immersive-button danger"
            >
              <Flame className="w-5 h-5 mr-2" />
              Light It Up
            </Button>
          ) : stage === 'lighting' ? (
            <div className="space-y-4">
              <p className="text-lg text-orange-300 animate-pulse">
                Lighting the paper...
              </p>
            </div>
          ) : stage === 'burning' ? (
            <div className="space-y-4">
              <p className="text-lg text-orange-300">
                {burnProgress < 100 ? 'Watching it burn away...' : 'Almost done...'}
              </p>
              <div className="w-64 h-2 bg-gray-800 rounded-full mx-auto overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                  style={{ width: `${burnProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-2xl text-orange-200 font-light">
                Released. You are free.
              </p>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flameFlicker {
          0% { 
            opacity: 0.85;
            filter: blur(1px) brightness(1);
          }
          25% { 
            opacity: 1;
            filter: blur(1.5px) brightness(1.1);
          }
          50% { 
            opacity: 0.9;
            filter: blur(1px) brightness(0.95);
          }
          75% { 
            opacity: 1;
            filter: blur(1.2px) brightness(1.05);
          }
          100% { 
            opacity: 0.88;
            filter: blur(1px) brightness(1);
          }
        }
        
        @keyframes flicker {
          0% { 
            opacity: 0.95; 
            transform: translateY(0) scaleY(1);
            filter: blur(4px) brightness(1);
          }
          20% { 
            opacity: 1; 
            transform: translateY(-0.5px) scaleY(1.05);
            filter: blur(4px) brightness(1.1);
          }
          40% { 
            opacity: 0.9; 
            transform: translateY(0) scaleY(0.98);
            filter: blur(4px) brightness(0.95);
          }
          60% { 
            opacity: 1; 
            transform: translateY(0.5px) scaleY(1.02);
            filter: blur(4px) brightness(1.05);
          }
          80% { 
            opacity: 0.92; 
            transform: translateY(0) scaleY(1);
            filter: blur(4px) brightness(1);
          }
          100% { 
            opacity: 0.98; 
            transform: translateY(0) scaleY(1);
            filter: blur(4px) brightness(1.02);
          }
        }

        @keyframes matchStrike {
          0% {
            transform: translateX(-50%) rotate(-15deg);
            opacity: 0;
          }
          20% {
            transform: translateX(-50%) rotate(-10deg);
            opacity: 1;
          }
          80% {
            transform: translateX(-50%) rotate(-5deg);
            opacity: 1;
          }
          100% {
            transform: translateX(-50%) rotate(0deg);
            opacity: 0;
          }
        }

        @keyframes matchFlame {
          0% {
            opacity: 0;
            transform: translateX(-50%) scale(0);
          }
          20% {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
          80% {
            opacity: 1;
            transform: translateX(-50%) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) scale(0.8);
          }
        }
      `}} />
    </div>
  );
};

export default BurnMode;