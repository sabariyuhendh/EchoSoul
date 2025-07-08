import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SmashModeSimpleProps {
  content: string;
  onBack: () => void;
  onComplete: () => void;
}

const OBJECT_TYPES = {
  crystal_orb: {
    name: 'Crystal Orb',
    color: '#87CEEB',
    emoji: '🔮',
    pieces: 30,
    sound: 'crystal'
  },
  ceramic_vase: {
    name: 'Ceramic Vase',
    color: '#DEB887',
    emoji: '🏺',
    pieces: 25,
    sound: 'ceramic'
  },
  glass_bottle: {
    name: 'Glass Bottle',
    color: '#90EE90',
    emoji: '🍾',
    pieces: 35,
    sound: 'glass'
  },
  metal_cube: {
    name: 'Metal Cube',
    color: '#C0C0C0',
    emoji: '🔲',
    pieces: 20,
    sound: 'metal'
  },
  golden_sphere: {
    name: 'Golden Sphere',
    color: '#FFD700',
    emoji: '🌟',
    pieces: 40,
    sound: 'gold'
  }
};

const SmashModeSimple = ({ content, onBack, onComplete }: SmashModeSimpleProps) => {
  const [currentObject, setCurrentObject] = useState<keyof typeof OBJECT_TYPES>('crystal_orb');
  const [smashedCount, setSmashedCount] = useState(0);
  const [smashPower, setSmashPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [showContent, setShowContent] = useState(true);
  const [isSmashed, setIsSmashed] = useState(false);
  const [pieces, setPieces] = useState<Array<{id: number, x: number, y: number, opacity: number}>>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();
  
  // Initialize audio
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    } catch (error) {
      console.warn('Audio context initialization failed:', error);
    }
    return () => {
      try {
        audioContextRef.current?.close();
      } catch (error) {
        console.warn('Audio context cleanup failed:', error);
      }
    };
  }, []);

  // Save smash statistics
  const saveStats = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/smash/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
  });

  // Play destruction sound
  const playDestructionSound = (material: string, force: number) => {
    if (!soundEnabled || !audioContextRef.current) return;
    
    try {
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Material-specific sound design
      let frequency = 440;
      let filterFreq = 1000;
      
      switch (material) {
        case 'crystal':
          frequency = 2000 + Math.random() * 2000;
          filterFreq = 3000;
          break;
        case 'ceramic':
          frequency = 800 + Math.random() * 800;
          filterFreq = 2000;
          break;
        case 'glass':
          frequency = 1500 + Math.random() * 1500;
          filterFreq = 2500;
          break;
        case 'metal':
          frequency = 300 + Math.random() * 300;
          filterFreq = 1500;
          break;
        case 'gold':
          frequency = 1000 + Math.random() * 1000;
          filterFreq = 2200;
          break;
      }
      
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.type = 'square';
      
      filter.frequency.setValueAtTime(filterFreq, now);
      filter.Q.setValueAtTime(10, now);
      
      const volume = Math.min(force / 100, 1) * 0.3;
      gainNode.gain.setValueAtTime(volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      
      oscillator.start(now);
      oscillator.stop(now + 0.5);
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  };

  // Handle charging power
  const handleMouseDown = () => {
    setIsCharging(true);
    const interval = setInterval(() => {
      setSmashPower(prev => Math.min(prev + 2, 100));
    }, 50);
    
    const handleMouseUp = () => {
      clearInterval(interval);
      setIsCharging(false);
      if (smashPower > 20) {
        handleSmash();
      }
      setSmashPower(0);
    };
    
    const handleMouseLeave = () => {
      clearInterval(interval);
      setIsCharging(false);
      setSmashPower(0);
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  };

  // Handle smash
  const handleSmash = () => {
    const objType = OBJECT_TYPES[currentObject];
    
    setIsSmashed(true);
    playDestructionSound(objType.sound, smashPower);
    
    // Create explosion effect
    const newPieces = Array.from({ length: objType.pieces }, (_, i) => ({
      id: i,
      x: Math.random() * 400 - 200,
      y: Math.random() * 400 - 200,
      opacity: 1
    }));
    setPieces(newPieces);
    
    // Animate pieces fading out
    setTimeout(() => {
      setPieces(prev => prev.map(piece => ({ ...piece, opacity: 0 })));
    }, 100);
    
    // Save statistics
    saveStats.mutate({
      objectType: currentObject,
      smashPower,
      sessionId,
      timestamp: Date.now()
    });
    
    setSmashedCount(prev => prev + 1);
    
    // Reset after animation
    setTimeout(() => {
      setIsSmashed(false);
      setPieces([]);
      
      // Cycle to next object
      const objects = Object.keys(OBJECT_TYPES) as (keyof typeof OBJECT_TYPES)[];
      const currentIndex = objects.indexOf(currentObject);
      const nextIndex = (currentIndex + 1) % objects.length;
      setCurrentObject(objects[nextIndex]);
      
      if (smashedCount >= 4) {
        setTimeout(onComplete, 1000);
      }
    }, 2000);
    
    toast({
      title: "Smashed!",
      description: `You destroyed the ${objType.name} with ${smashPower}% power!`,
    });
  };

  const resetSession = () => {
    setSmashedCount(0);
    setCurrentObject('crystal_orb');
    setIsSmashed(false);
    setPieces([]);
    setSmashPower(0);
  };

  const objType = OBJECT_TYPES[currentObject];

  return (
    <div className="min-h-screen bg-black text-white p-6 page-content">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-600 bg-clip-text text-transparent">
              Smash Mode
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setSoundEnabled(!soundEnabled)}
              variant="ghost"
              size="icon"
              className="hover:bg-white/10"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button
              onClick={resetSession}
              variant="ghost"
              size="icon"
              className="hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-400">{smashedCount}</div>
              <div className="text-sm text-gray-400">Objects Smashed</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-400">{objType.name}</div>
              <div className="text-sm text-gray-400">Current Target</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400">{smashPower}%</div>
              <div className="text-sm text-gray-400">Power</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">{objType.pieces}</div>
              <div className="text-sm text-gray-400">Pieces</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Smash Area */}
        <Card className="bg-gray-900/50 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              Hold to charge power, release to smash!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative min-h-96 flex items-center justify-center">
              {/* Object to smash */}
              <div
                className={`relative cursor-pointer transition-all duration-200 ${
                  isCharging ? 'scale-110' : 'scale-100'
                } ${isSmashed ? 'scale-0' : ''}`}
                onMouseDown={handleMouseDown}
                style={{
                  filter: isCharging ? 'brightness(1.2)' : 'brightness(1)',
                }}
              >
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-2xl"
                  style={{
                    backgroundColor: objType.color,
                    boxShadow: `0 0 30px ${objType.color}50`,
                  }}
                >
                  {objType.emoji}
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <Badge variant="secondary">{objType.name}</Badge>
                </div>
              </div>

              {/* Destruction pieces */}
              {pieces.map(piece => (
                <div
                  key={piece.id}
                  className="absolute w-2 h-2 rounded-full transition-all duration-2000"
                  style={{
                    backgroundColor: objType.color,
                    left: `50%`,
                    top: `50%`,
                    transform: `translate(${piece.x}px, ${piece.y}px)`,
                    opacity: piece.opacity,
                  }}
                />
              ))}
            </div>

            {/* Power meter */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Power</span>
                <span className="text-sm font-bold text-orange-400">{smashPower}%</span>
              </div>
              <Progress value={smashPower} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Content display */}
        {showContent && content && (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <p className="text-gray-300 italic mb-4">"{content}"</p>
              <Button
                onClick={() => setShowContent(false)}
                variant="ghost"
                className="text-sm text-gray-400 hover:text-white"
              >
                Hide message
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SmashModeSimple;