import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX, ArrowLeft, Clock, BarChart, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';

const CalmSpace = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('ambient');
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const tracks = [
    { id: 'ambient', name: 'Ambient Space', file: '/audio/ambient.mp3', description: 'Ethereal cosmic soundscape' },
    { id: 'focus', name: 'Deep Focus', file: '/audio/focus.mp3', description: 'Concentrated meditation tones' },
    { id: 'lofi', name: 'Cosmic LoFi', file: '/audio/lofi.mp3', description: 'Relaxing space beats' },
    { id: 'interstellar', name: 'Interstellar', file: '/audio/interstellar.mp3', description: 'Journey through the cosmos' }
  ];

  const { data: preferences } = useQuery({
    queryKey: ['/api/calm-preferences'],
  });

  const savePrefsMutation = useMutation({
    mutationFn: async (prefs: any) => {
      const response = await fetch('/api/calm-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      return response.json();
    },
  });

  const logSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await fetch('/api/meditation-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });
      return response.json();
    },
  });

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (sessionActive) {
      intervalRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionActive]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setSessionActive(false);
      } else {
        audioRef.current.play();
        setSessionActive(true);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTrackChange = (trackId: string) => {
    try {
      const wasPlaying = isPlaying;
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        setSessionActive(false);
      }
      
      setCurrentTrack(trackId);
      
      setTimeout(() => {
        if (wasPlaying && audioRef.current) {
          audioRef.current.play().catch(error => {
            console.warn('Audio playback failed:', error);
          });
          setIsPlaying(true);
          setSessionActive(true);
        }
      }, 100);
    } catch (error) {
      console.error('Track change error:', error);
    }
  };

  const endSession = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setSessionActive(false);
    
    if (sessionTime > 0) {
      logSessionMutation.mutate({
        duration: sessionTime,
        track: currentTrack,
        timestamp: new Date().toISOString(),
      });
    }
    
    setSessionTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTrackData = tracks.find(t => t.id === currentTrack);

  return (
    <div className="min-h-screen text-white page-content relative overflow-hidden" style={{ background: '#000000' }}>
      {/* Clean Pure Black Space Background */}
      <div className="absolute inset-0" style={{ background: '#000000' }}>
        
        {/* Simple stars field - like real space */}
        <div className="absolute inset-0">
          {[...Array(150)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 1.5 + 0.5}px`,
                height: `${Math.random() * 1.5 + 0.5}px`,
                opacity: Math.random() * 0.8 + 0.2,
              }}
            />
          ))}
        </div>
        
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30">
              <Sparkles className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              Calm Space
            </h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Find peace in the infinite expanse of space. Let the cosmic sounds guide you to inner tranquility.
          </p>
        </div>

        {/* Main Player */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
                  <Play className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl text-white">{currentTrackData?.name}</h3>
                  <p className="text-gray-400 text-sm">{currentTrackData?.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono text-white">{formatTime(sessionTime)}</div>
                <div className="text-sm text-gray-400">
                  {sessionActive ? 'Session Active' : 'Ready to Begin'}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={togglePlayPause}
                disabled={!currentTrackData}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-8 py-3 rounded-full transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsMuted(!isMuted)}
                  variant="outline"
                  size="sm"
                  className="text-gray-400"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 accent-blue-500"
                />
              </div>
              
              {sessionActive && (
                <Button
                  onClick={endSession}
                  variant="outline"
                  className="text-gray-400 border-gray-600 hover:bg-gray-700/50 transition-colors"
                >
                  End Session
                </Button>
              )}
            </div>
            
            <audio
              ref={audioRef}
              src={currentTrackData?.file}
              loop
              onEnded={() => setIsPlaying(false)}
            />
          </CardContent>
        </Card>

        {/* Track Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {tracks.map((track) => (
            <Card
              key={track.id}
              className={`cursor-pointer transition-all duration-200 ${
                currentTrack === track.id
                  ? 'bg-blue-900/30 border-blue-500/50'
                  : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
              } backdrop-blur-sm`}
              onClick={() => handleTrackChange(track.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    currentTrack === track.id
                      ? 'bg-blue-500/20'
                      : 'bg-gray-700/50'
                  }`}>
                    <Play className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{track.name}</h4>
                    <p className="text-sm text-gray-400">{track.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{formatTime(sessionTime)}</div>
              <div className="text-sm text-gray-400">Current Session</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <BarChart className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {0}
              </div>
              <div className="text-sm text-gray-400">Total Sessions</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                0h 0m
              </div>
              <div className="text-sm text-gray-400">Total Time</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalmSpace;