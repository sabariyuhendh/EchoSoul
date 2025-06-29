
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX, ArrowLeft, Clock, BarChart } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';

const CalmSpace = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch user preferences
  const { data: preferences } = useQuery({
    queryKey: ['calm-preferences'],
    queryFn: async () => {
      const response = await fetch('/api/calm/preferences');
      return response.json();
    }
  });

  // Save preferences mutation
  const savePreferences = useMutation({
    mutationFn: async (prefs: any) => {
      const response = await fetch('/api/calm/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs)
      });
      return response.json();
    }
  });

  // Log meditation session
  const logSession = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await fetch('/api/calm/log-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });
      return response.json();
    }
  });

  const tracks = [
    { name: "Lofi Beats", duration: "3:24", url: "/audio/lofi.mp3" },
    { name: "Interstellar Main Theme", duration: "4:35", url: "/audio/interstellar.mp3" },
    { name: "Ambient Space", duration: "5:12", url: "/audio/ambient.mp3" },
    { name: "Deep Focus", duration: "6:18", url: "/audio/focus.mp3" }
  ];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const changeTrack = (index: number) => {
    setCurrentTrack(index);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-black text-white page-content relative overflow-hidden">
      {/* Interstellar Black Hole Background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        {/* Stars field */}
        <div className="absolute inset-0">
          {[...Array(200)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 3}px`,
                height: `${Math.random() * 3}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: `rgba(255, 255, 255, ${0.3 + Math.random() * 0.7})`,
                animation: `twinkle ${2 + Math.random() * 4}s infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        {/* Black hole system */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* Accretion disk */}
          <div 
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: `conic-gradient(from 0deg at 50% 50%, 
                transparent 0deg,
                rgba(255, 140, 0, 0.1) 45deg,
                rgba(255, 215, 0, 0.2) 90deg,
                rgba(255, 255, 255, 0.3) 135deg,
                rgba(135, 206, 235, 0.2) 180deg,
                rgba(138, 43, 226, 0.1) 225deg,
                transparent 270deg,
                transparent 360deg)`,
              animation: 'rotate-slow 30s linear infinite',
              filter: 'blur(3px)',
              transform: 'rotateX(75deg)'
            }}
          />
          
          {/* Inner accretion disk */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
            style={{
              background: `conic-gradient(from 180deg at 50% 50%, 
                rgba(255, 69, 0, 0.4),
                rgba(255, 140, 0, 0.6),
                rgba(255, 215, 0, 0.4),
                rgba(255, 69, 0, 0.4))`,
              animation: 'rotate-fast 15s linear infinite reverse',
              filter: 'blur(2px)',
              transform: 'rotateX(75deg)'
            }}
          />
          
          {/* Photon sphere */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full"
            style={{
              background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%)',
              animation: 'pulse-slow 4s ease-in-out infinite',
              boxShadow: '0 0 100px rgba(255, 215, 0, 0.3)'
            }}
          />
          
          {/* Event horizon */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(0, 0, 0, 0.95), black)',
              boxShadow: `inset 0 0 50px rgba(0, 0, 0, 0.9),
                          0 0 100px rgba(0, 0, 0, 0.8),
                          0 0 150px rgba(138, 43, 226, 0.3)`,
              animation: 'wobble 20s ease-in-out infinite'
            }}
          />
          
          {/* Gravitational lensing effect */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(255, 255, 255, 0.05) 40%, transparent 60%)',
              animation: 'lens-distort 10s ease-in-out infinite',
              filter: 'blur(1px)'
            }}
          />
          
          {/* Jet streams */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full w-4 h-[300px]"
            style={{
              background: 'linear-gradient(to top, transparent, rgba(147, 112, 219, 0.3), transparent)',
              filter: 'blur(4px)',
              animation: 'jet-pulse 3s ease-in-out infinite'
            }}
          />
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-4 h-[300px]"
            style={{
              background: 'linear-gradient(to bottom, transparent, rgba(147, 112, 219, 0.3), transparent)',
              filter: 'blur(4px)',
              animation: 'jet-pulse 3s ease-in-out infinite',
              animationDelay: '1.5s'
            }}
          />
        </div>
      </div>

      <div className="relative z-10 p-6 pt-24">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="text-center">
              <h1 className="text-3xl font-light tracking-tight">
                <span className="text-gradient-wellness">Calm Space</span>
              </h1>
              <p className="text-gray-400 text-sm">Find peace in the cosmic void</p>
            </div>
            <div className="w-24"></div>
          </div>

          {/* Music Player */}
          <Card className="apple-card p-8 mb-8 backdrop-blur-xl bg-white/5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-light mb-4 text-gradient-lavender">
                {tracks[currentTrack].name}
              </h2>
              <div className="flex items-center justify-center space-x-6 mb-6">
                <Button
                  onClick={togglePlay}
                  className="apple-button bg-gradient-to-r from-lavender-500 to-purple-500 text-white px-8 py-4 rounded-full"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>
              </div>
              
              {/* Volume Control */}
              <div className="flex items-center justify-center space-x-4">
                <VolumeX className="w-4 h-4 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-32 accent-lavender-500"
                />
                <Volume2 className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            <audio
              ref={audioRef}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={tracks[currentTrack].url} type="audio/mpeg" />
            </audio>
          </Card>

          {/* Track List */}
          <Card className="apple-card p-6 backdrop-blur-xl bg-white/3">
            <h3 className="text-xl font-light mb-4 text-gradient-calm">Calming Tracks</h3>
            <div className="space-y-3">
              {tracks.map((track, index) => (
                <div
                  key={index}
                  onClick={() => changeTrack(index)}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                    index === currentTrack
                      ? 'bg-gradient-to-r from-lavender-500/20 to-purple-500/20 border border-lavender-500/30'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{track.name}</span>
                    <span className="text-gray-400 text-sm">{track.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Breathing Exercise */}
          <Card className="apple-card p-8 mt-8 text-center backdrop-blur-xl bg-white/3">
            <h3 className="text-xl font-light mb-4 text-gradient-sage">Deep Breathing</h3>
            <p className="text-gray-400 mb-6">Breathe with the cosmic rhythm</p>
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-calm-400 to-sage-400 rounded-full flex items-center justify-center breathe">
              <div className="text-2xl font-light">∞</div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Inhale for 4 seconds, hold for 4, exhale for 6
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalmSpace;
