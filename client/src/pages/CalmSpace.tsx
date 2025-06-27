
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CalmSpace = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);

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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Blackhole Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* Blackhole layers */}
          <div className="w-96 h-96 bg-gradient-radial from-transparent via-purple-900/20 to-black rounded-full animate-spin-slow"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-radial from-transparent via-blue-900/30 to-transparent rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-radial from-black via-purple-800/50 to-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-black rounded-full shadow-2xl"></div>
        </div>
        
        {/* Floating particles */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
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
