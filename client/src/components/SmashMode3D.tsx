import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Hammer, ArrowLeft, Zap } from 'lucide-react';

interface SmashModeProps {
  content: string;
  onBack: () => void;
  onComplete: () => void;
}

interface SmashableObject {
  id: string;
  emoji: string;
  name: string;
  x: number;
  y: number;
  z: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  size: number;
  broken: boolean;
  material: 'glass' | 'metal' | 'wood' | 'stone' | 'crystal';
  pieces?: Piece[];
}

interface Piece {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotation: number;
  size: number;
  opacity: number;
}

const SmashMode = ({ content, onBack, onComplete }: SmashModeProps) => {
  const [objects, setObjects] = useState<SmashableObject[]>([]);
  const [smashedCount, setSmashedCount] = useState(0);
  const [hammerPower, setHammerPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const animationRef = useRef<number>();
  const sceneRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);
  
  // Play realistic destruction sound based on material
  const playDestructionSound = (material: string, power: number) => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    
    // Create oscillators and noise for realistic material sounds
    if (material === 'glass' || material === 'crystal') {
      // High-pitched glass breaking sound
      for (let i = 0; i < 5; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(2000 + Math.random() * 3000, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        
        gain.gain.setValueAtTime((power / 100) * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        osc.start(now + i * 0.02);
        osc.stop(now + 0.5);
      }
    } else if (material === 'wood') {
      // Low crack sound for wood
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
      
      gain.gain.setValueAtTime((power / 100) * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc.start(now);
      osc.stop(now + 0.3);
    } else {
      // Generic impact sound for stone/metal
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(100, now);
      gain.gain.setValueAtTime((power / 100) * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      
      osc.start(now);
      osc.stop(now + 0.2);
    }
    
    // Add impact thud
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    
    thud.connect(thudGain);
    thudGain.connect(ctx.destination);
    
    thud.frequency.setValueAtTime(60, now);
    thudGain.gain.setValueAtTime((power / 100) * 0.6, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    thud.start(now);
    thud.stop(now + 0.1);
  };

  useEffect(() => {
    // Initialize 3D objects with realistic materials
    const initialObjects: SmashableObject[] = [
      { 
        id: '1', 
        emoji: '💎', 
        name: 'Crystal', 
        x: 15, 
        y: 25, 
        z: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        size: 120, 
        broken: false,
        material: 'crystal'
      },
      { 
        id: '2', 
        emoji: '🏺', 
        name: 'Vase', 
        x: 40, 
        y: 35, 
        z: -50,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        size: 110, 
        broken: false,
        material: 'glass'
      },
      { 
        id: '3', 
        emoji: '🪟', 
        name: 'Window', 
        x: 65, 
        y: 20, 
        z: -100,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        size: 130, 
        broken: false,
        material: 'glass'
      },
      { 
        id: '4', 
        emoji: '🧱', 
        name: 'Brick', 
        x: 25, 
        y: 55, 
        z: -25,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        size: 100, 
        broken: false,
        material: 'stone'
      },
      { 
        id: '5', 
        emoji: '📦', 
        name: 'Crate', 
        x: 55, 
        y: 60, 
        z: -75,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        size: 115, 
        broken: false,
        material: 'wood'
      },
      { 
        id: '6', 
        emoji: '🪙', 
        name: 'Coin', 
        x: 80, 
        y: 40, 
        z: -150,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        size: 105, 
        broken: false,
        material: 'metal'
      },
    ];
    setObjects(initialObjects);

    // Start 3D rotation animation
    const animate = () => {
      setObjects(prev => prev.map(obj => ({
        ...obj,
        rotationY: obj.rotationY + (obj.broken ? 0 : 0.5),
        rotationX: obj.rotationX + (obj.broken ? 0 : 0.3),
      })));
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const startCharging = () => {
    setIsCharging(true);
    setHammerPower(0);
  };

  const releaseHammer = (objectId: string) => {
    if (!isCharging) return;
    
    const power = Math.min(hammerPower, 100);
    setIsCharging(false);
    
    setObjects(prev => prev.map(obj => {
      if (obj.id === objectId && !obj.broken) {
        // Create realistic destruction based on material
        const pieceCount = obj.material === 'glass' ? 20 : 
                          obj.material === 'crystal' ? 15 :
                          obj.material === 'wood' ? 10 : 8;
        
        const pieces: Piece[] = Array.from({ length: pieceCount }, (_, i) => {
          const angle = (i / pieceCount) * Math.PI * 2;
          const force = (power / 100) * 15;
          const randomForce = force + Math.random() * 5;
          
          return {
            x: 0,
            y: 0,
            z: 0,
            vx: Math.cos(angle) * randomForce + (Math.random() - 0.5) * 5,
            vy: -Math.abs(Math.sin(angle) * randomForce) - Math.random() * 10,
            vz: (Math.random() - 0.5) * 10,
            rotation: Math.random() * 360,
            size: obj.size / (3 + Math.random() * 2),
            opacity: 1
          };
        });

        setSmashedCount(prev => prev + 1);
        
        // Play realistic sound effect
        playDestructionSound(obj.material, power);
        
        // Screen shake effect
        if (sceneRef.current) {
          sceneRef.current.style.animation = 'shake 0.3s ease-out';
          setTimeout(() => {
            if (sceneRef.current) sceneRef.current.style.animation = '';
          }, 300);
        }

        return { ...obj, broken: true, pieces };
      }
      return obj;
    }));
    
    setHammerPower(0);
  };

  useEffect(() => {
    if (isCharging) {
      const interval = setInterval(() => {
        setHammerPower(prev => Math.min(prev + 2, 100));
      }, 20);
      return () => clearInterval(interval);
    }
  }, [isCharging]);

  useEffect(() => {
    // Animate pieces falling
    let animationId: number;
    
    const animatePieces = () => {
      setObjects(prev => prev.map(obj => {
        if (obj.broken && obj.pieces) {
          const updatedPieces = obj.pieces.map(piece => ({
            ...piece,
            x: piece.x + piece.vx * 0.3,
            y: piece.y + piece.vy * 0.3,
            z: piece.z + piece.vz * 0.3,
            vy: piece.vy + 1.5, // Gravity
            vx: piece.vx * 0.95, // Friction
            vz: piece.vz * 0.95,
            rotation: piece.rotation + 10,
            opacity: Math.max(0, piece.opacity - 0.01)
          }));
          
          return { ...obj, pieces: updatedPieces };
        }
        return obj;
      }));
      
      animationId = requestAnimationFrame(animatePieces);
    };
    
    if (objects.some(obj => obj.broken)) {
      animatePieces();
    }
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [objects]);

  useEffect(() => {
    if (smashedCount >= 6) {
      setTimeout(() => {
        onComplete();
      }, 3000);
    }
  }, [smashedCount, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-800 text-white relative overflow-hidden page-content">
      {/* 3D Scene */}
      <div 
        ref={sceneRef}
        className="absolute inset-0 perspective-1000"
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      >
        {/* Destruction particles */}
        {smashedCount > 0 && (
          <div className="absolute inset-0">
            {Array.from({ length: smashedCount * 5 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: 0.6
                }}
              />
            ))}
          </div>
        )}

        {/* 3D Objects */}
        {objects.map((obj) => (
          <div
            key={obj.id}
            className="absolute transform-gpu transition-all duration-100"
            style={{
              left: `${obj.x}%`,
              top: `${obj.y}%`,
              transform: `
                translateX(-50%) 
                translateY(-50%) 
                translateZ(${obj.z}px)
                rotateX(${obj.rotationX}deg) 
                rotateY(${obj.rotationY}deg) 
                rotateZ(${obj.rotationZ}deg)
                scale(${obj.broken ? 0 : 1})
              `,
              transformStyle: 'preserve-3d',
              opacity: obj.broken ? 0 : 1
            }}
          >
            <Button
              variant="ghost"
              onMouseDown={startCharging}
              onMouseUp={() => releaseHammer(obj.id)}
              onMouseLeave={() => setIsCharging(false)}
              onTouchStart={startCharging}
              onTouchEnd={() => releaseHammer(obj.id)}
              className={`relative p-0 transition-all ${!obj.broken ? 'hover:scale-110 active:scale-95' : ''}`}
              style={{
                fontSize: `${obj.size}px`,
                width: `${obj.size}px`,
                height: `${obj.size}px`,
                transformStyle: 'preserve-3d',
                boxShadow: obj.material === 'glass' || obj.material === 'crystal' 
                  ? '0 0 20px rgba(255,255,255,0.3)' 
                  : '0 10px 30px rgba(0,0,0,0.5)'
              }}
            >
              <span className="text-center block">{obj.emoji}</span>
              {isCharging && !obj.broken && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full rounded-full border-4 border-red-500 animate-pulse" />
                </div>
              )}
            </Button>

            {/* Destruction pieces */}
            {obj.broken && obj.pieces && obj.pieces.map((piece, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  transform: `
                    translate3d(${piece.x}px, ${piece.y}px, ${piece.z}px) 
                    rotate(${piece.rotation}deg)
                  `,
                  fontSize: `${piece.size}px`,
                  opacity: piece.opacity,
                  pointerEvents: 'none'
                }}
              >
                {obj.material === 'glass' || obj.material === 'crystal' ? '✨' :
                 obj.material === 'wood' ? '🪵' :
                 obj.material === 'stone' ? '🪨' : '💥'}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 p-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="absolute top-6 left-6 apple-button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Instruction Card */}
        <Card className="amber-card max-w-2xl mx-auto mt-20 p-8 text-center backdrop-blur-md">
          <h2 className="text-3xl font-light mb-4 text-gradient-amber">Smash Room 3D</h2>
          <p className="text-lg text-gray-300 mb-6">{content}</p>
          <div className="space-y-4">
            <p className="text-gray-400">
              Hold down on objects to charge your hammer, then release to smash!
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Hammer className="w-6 h-6 text-amber-400" />
              <span className="text-amber-400 font-medium">{smashedCount}/6 Smashed</span>
            </div>
            {isCharging && (
              <div className="mt-4">
                <div className="w-64 h-4 bg-gray-700 rounded-full mx-auto overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-100"
                    style={{ width: `${hammerPower}%` }}
                  />
                </div>
                <p className="text-sm text-orange-400 mt-2">Power: {Math.round(hammerPower)}%</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}} />
    </div>
  );
};

export default SmashMode;