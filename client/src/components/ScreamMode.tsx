
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, ArrowLeft, Mic } from 'lucide-react';

interface ScreamModeProps {
  content: string;
  onBack: () => void;
  onComplete: () => void;
}

const ScreamMode = ({ content, onBack, onComplete }: ScreamModeProps) => {
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [glassShattered, setGlassShattered] = useState(false);
  const [soundWaves, setSoundWaves] = useState<Array<{id: number, scale: number}>>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationIdRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      setIsListening(true);
      monitorAudio();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const monitorAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const volumePercent = Math.min((average / 128) * 100, 100);
    
    setVolume(volumePercent);
    
    // Create sound wave ripples
    if (volumePercent > 10) {
      setSoundWaves(prev => [...prev, {
        id: Date.now(),
        scale: volumePercent / 100
      }].slice(-5));
    }
    
    // Shatter glass at high volume
    if (volumePercent > 70 && !glassShattered) {
      setGlassShattered(true);
      setTimeout(() => {
        onComplete();
      }, 3000);
    }
    
    if (isListening) {
      animationIdRef.current = requestAnimationFrame(monitorAudio);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white relative overflow-hidden">
      {/* Sound Wave Effects */}
      {isListening && (
        <div className="absolute inset-0 flex items-center justify-center">
          {soundWaves.map(wave => (
            <div
              key={wave.id}
              className="absolute border-2 border-purple-400/30 rounded-full animate-ping"
              style={{
                width: `${200 + wave.scale * 300}px`,
                height: `${200 + wave.scale * 300}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Glass Shatter Effect */}
      {glassShattered && (
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-white/80 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-white/10 animate-pulse" />
        </div>
      )}

      <div className="max-w-4xl mx-auto relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-purple-200 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>

        {/* Volume Visualizer */}
        <div className="flex justify-center mb-8">
          <div className="flex items-end space-x-2 h-32">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={`w-6 rounded-full transition-all duration-100 ${
                  volume > (i * 8) ? 'bg-gradient-to-t from-purple-600 to-pink-400' : 'bg-gray-700'
                }`}
                style={{
                  height: `${20 + (volume > (i * 8) ? volume : 0)}px`,
                  maxHeight: '120px'
                }}
              />
            ))}
          </div>
        </div>

        {/* Glass Barrier */}
        <div className={`relative h-40 mb-8 border-4 ${glassShattered ? 'border-red-500' : 'border-cyan-300/50'} rounded-lg bg-gradient-to-r from-cyan-400/10 to-blue-400/10 backdrop-blur-sm transition-all duration-300`}>
          <div className="absolute inset-0 flex items-center justify-center">
            {glassShattered ? (
              <div className="text-6xl animate-pulse">💥</div>
            ) : (
              <div className="text-2xl text-cyan-300/70">Glass Barrier</div>
            )}
          </div>
          
          {/* Crack effects when volume is high */}
          {volume > 50 && !glassShattered && (
            <>
              {Array.from({ length: Math.floor(volume / 20) }).map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-white/40 h-px"
                  style={{
                    width: `${30 + Math.random() * 50}px`,
                    left: `${Math.random() * 80 + 10}%`,
                    top: `${Math.random() * 80 + 10}%`,
                    transform: `rotate(${Math.random() * 180}deg)`,
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* Controls */}
        <Card className="bg-black/30 backdrop-blur-sm border-purple-400/30 p-6 text-center">
          {glassShattered ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Barrier Shattered! 🎉</h2>
              <p className="text-purple-200">Your voice broke through. You found your power.</p>
            </div>
          ) : !isListening ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Ready to break the silence?</h2>
              <p className="text-purple-200 mb-4">Scream loud enough to shatter the glass barrier!</p>
              <Button
                onClick={startListening}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Mic className="w-4 h-4 mr-2" />
                Start Screaming
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold">
                Volume: {Math.round(volume)}%
              </h2>
              <p className="text-purple-200">
                {volume < 30 ? 'Louder!' : volume < 70 ? 'Almost there!' : 'BREAK IT! 🔥'}
              </p>
              <Button
                onClick={stopListening}
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500/10"
              >
                Stop
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ScreamMode;
