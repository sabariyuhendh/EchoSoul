import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX, ArrowLeft, Clock, BarChart } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const CalmSpace = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [cosmicDebrisEnabled, setCosmicDebrisEnabled] = useState(true);
  const [debrisIntensity, setDebrisIntensity] = useState(50);
  const [smashableCrystalsEnabled, setSmashableCrystalsEnabled] = useState(true);
  const [breathingMode, setBreathingMode] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [breathingCount, setBreathingCount] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const breathingRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const tracks = [
    { name: 'Ambient Space', file: '/audio/ambient.mp3' },
    { name: 'Deep Focus', file: '/audio/focus.mp3' },
    { name: 'Interstellar', file: '/audio/interstellar.mp3' },
    { name: 'Lo-Fi Chill', file: '/audio/lofi.mp3' },
  ];

  // Load user preferences
  const { data: preferences } = useQuery({
    queryKey: ['/api/calm/preferences'],
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Save preferences
  const savePreferences = useMutation({
    mutationFn: async (prefs: any) => {
      return apiRequest('/api/calm/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs)
      });
    },
  });

  // Load preferences on component mount
  useEffect(() => {
    if (preferences) {
      setVolume(preferences.volume || 0.5);
      setCosmicDebrisEnabled(preferences.cosmicDebrisEnabled ?? true);
      setDebrisIntensity(preferences.debrisIntensity || 50);
      setSmashableCrystalsEnabled(preferences.smashableCrystalsEnabled ?? true);
      setCurrentTrack(preferences.currentTrack || 0);
    }
  }, [preferences]);

  // Auto-save preferences when they change
  useEffect(() => {
    if (preferences) {
      savePreferences.mutate({
        volume,
        cosmicDebrisEnabled,
        debrisIntensity,
        smashableCrystalsEnabled,
        currentTrack
      });
    }
  }, [volume, cosmicDebrisEnabled, debrisIntensity, smashableCrystalsEnabled, currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Timer functionality
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  // Breathing exercise
  useEffect(() => {
    if (breathingMode) {
      const cycle = () => {
        setBreathingPhase('inhale');
        setTimeout(() => setBreathingPhase('hold'), 4000);
        setTimeout(() => setBreathingPhase('exhale'), 8000);
        setTimeout(() => {
          setBreathingPhase('pause');
          setBreathingCount(prev => prev + 1);
        }, 12000);
      };
      
      cycle();
      breathingRef.current = setInterval(cycle, 16000);
    } else {
      clearInterval(breathingRef.current);
      setBreathingCount(0);
    }
    return () => clearInterval(breathingRef.current);
  }, [breathingMode]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsTimerRunning(false);
      } else {
        audioRef.current.play();
        setIsTimerRunning(true);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const changeTrack = (index: number) => {
    setCurrentTrack(index);
    setIsPlaying(false);
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setSessionTimer(0);
    setIsTimerRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale': return 'Breathe in slowly...';
      case 'hold': return 'Hold your breath...';
      case 'exhale': return 'Breathe out slowly...';
      case 'pause': return 'Pause and relax...';
      default: return 'Focus on your breath...';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white page-content relative overflow-hidden">
      {/* Simplified Visual Effects */}
      {cosmicDebrisEnabled && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 animate-pulse" />
          <div className="absolute inset-0">
            {Array.from({ length: Math.floor(debrisIntensity / 10) }, (_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/20 animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${Math.random() * 3 + 2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Smashable Crystals Simplified */}
      {smashableCrystalsEnabled && (
        <div className="absolute inset-0 z-10 pointer-events-auto">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="absolute w-8 h-8 bg-blue-400/60 rounded-full cursor-pointer hover:bg-blue-300/80 transition-colors animate-pulse"
              style={{
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`,
              }}
              onClick={() => {
                toast({
                  title: "Crystal shattered!",
                  description: "You released some tension 💎",
                });
              }}
            />
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-20 max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Calm Space
          </h1>
        </div>

        {/* Audio Player */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {tracks[currentTrack].name}
              </h2>
              <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-blue-400 font-mono">{formatTime(sessionTimer)}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={togglePlay}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                onClick={resetTimer}
                variant="outline"
                size="sm"
              >
                <BarChart className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {tracks.map((track, index) => (
                <Button
                  key={index}
                  onClick={() => changeTrack(index)}
                  variant={currentTrack === index ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                >
                  {track.name}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsMuted(!isMuted)}
                variant="ghost"
                size="icon"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
                max={1}
                step={0.1}
                className="flex-1"
              />
            </div>

            <audio
              ref={audioRef}
              src={tracks[currentTrack].file}
              loop
              onEnded={() => setIsPlaying(false)}
            />
          </div>
        </Card>

        {/* Breathing Exercise */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Breathing Exercise
                </h2>
                <p className="text-sm text-gray-400">4-4-4-4 breathing pattern</p>
              </div>
              <Switch
                checked={breathingMode}
                onCheckedChange={setBreathingMode}
              />
            </div>
            
            {breathingMode && (
              <div className="text-center">
                <div className="mb-6">
                  <div className={`w-24 h-24 mx-auto rounded-full border-4 transition-all duration-1000 relative ${
                    breathingPhase === 'inhale' ? 'scale-125 bg-blue-400/20 border-blue-400 shadow-lg shadow-blue-400/50' :
                    breathingPhase === 'hold' ? 'scale-125 bg-purple-400/20 border-purple-400 shadow-lg shadow-purple-400/50' :
                    breathingPhase === 'exhale' ? 'scale-100 bg-green-400/20 border-green-400 shadow-lg shadow-green-400/50' :
                    'scale-100 bg-gray-400/10 border-gray-400'
                  }`}>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
                  </div>
                </div>
                <p className="text-lg mb-2 font-medium">{getBreathingInstruction()}</p>
                <div className="bg-gray-800/50 rounded-full px-4 py-2 inline-block">
                  <p className="text-sm text-gray-300">Completed cycles: <span className="text-blue-400 font-bold">{breathingCount}</span></p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Settings */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Environment Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="cosmic-debris" className="text-white">Cosmic Debris</Label>
                  <p className="text-sm text-gray-400">Floating particles in background</p>
                </div>
                <Switch
                  id="cosmic-debris"
                  checked={cosmicDebrisEnabled}
                  onCheckedChange={setCosmicDebrisEnabled}
                />
              </div>
              
              {cosmicDebrisEnabled && (
                <div className="pl-4 border-l-2 border-blue-500/20">
                  <Label className="text-sm text-gray-300 mb-2 block">
                    Debris Intensity: {debrisIntensity}%
                  </Label>
                  <Slider
                    value={[debrisIntensity]}
                    onValueChange={(value) => setDebrisIntensity(value[0])}
                    max={100}
                    step={10}
                    className="mt-2"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smashable-crystals" className="text-white">Interactive Crystals</Label>
                  <p className="text-sm text-gray-400">Clickable stress relief elements</p>
                </div>
                <Switch
                  id="smashable-crystals"
                  checked={smashableCrystalsEnabled}
                  onCheckedChange={setSmashableCrystalsEnabled}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CalmSpace;