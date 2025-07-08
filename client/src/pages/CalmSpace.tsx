
import { useState, useEffect, useRef, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX, ArrowLeft, Clock, BarChart } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Cosmic Debris Component for 3D background
function CosmicDebris({ count = 50 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = new THREE.Object3D();
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    for (let i = 0; i < count; i++) {
      const x = (i % 10 - 5) * 4;
      const y = Math.floor(i / 10 - 2.5) * 4;
      const z = (Math.sin(time * 0.5 + i) * 2) - 5;
      
      dummy.position.set(
        x + Math.sin(time * 0.3 + i) * 0.5,
        y + Math.cos(time * 0.4 + i) * 0.5,
        z
      );
      
      dummy.rotation.x = time * 0.5 + i;
      dummy.rotation.y = time * 0.3 + i;
      dummy.rotation.z = time * 0.2 + i;
      
      const scale = 0.1 + Math.sin(time * 0.5 + i) * 0.05;
      dummy.scale.set(scale, scale, scale);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#87CEEB"
        metalness={0.8}
        roughness={0.2}
        emissive="#4169E1"
        emissiveIntensity={0.1}
      />
    </instancedMesh>
  );
}

// Interactive Smashable Crystal
function SmashableCrystal({ position }: { position: [number, number, number] }) {
  const [broken, setBroken] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && !broken) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });
  
  const handleClick = () => {
    if (!broken) {
      setBroken(true);
      setTimeout(() => setBroken(false), 3000);
    }
  };
  
  if (broken) {
    return (
      <Sparkles
        count={30}
        scale={2}
        size={3}
        speed={2}
        opacity={0.8}
        color="#87CEEB"
        position={position}
      />
    );
  }
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        position={position}
        onClick={handleClick}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color="#00CED1"
          metalness={0.2}
          roughness={0.1}
          emissive="#00CED1"
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

const CalmSpace = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [cosmicDebrisEnabled, setCosmicDebrisEnabled] = useState(true);
  const [debrisIntensity, setDebrisIntensity] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch user preferences
  const { data: preferences } = useQuery({
    queryKey: ['calm-preferences'],
    queryFn: async () => {
      const response = await fetch('/api/calm/preferences');
      const data = await response.json();
      if (data) {
        setVolume(data.volume || 0.7);
        setCosmicDebrisEnabled(data.cosmicDebrisEnabled ?? true);
        setDebrisIntensity(data.debrisIntensity || 0.5);
      }
      return data;
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
    <div className="min-h-screen bg-black text-white page-content relative">
      {/* 3D Cosmic Debris Layer */}
      {cosmicDebrisEnabled && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.3 * debrisIntensity} />
              <pointLight position={[10, 10, 10]} intensity={0.5 * debrisIntensity} />
              <pointLight position={[-10, -10, -10]} intensity={0.5 * debrisIntensity} color="#87CEEB" />
              
              {/* Floating cosmic debris */}
              <CosmicDebris count={Math.round(40 * debrisIntensity)} />
              
              {/* Interactive smashable crystals */}
              {debrisIntensity > 0.3 && (
                <>
                  <SmashableCrystal position={[-3, 2, 0]} />
                  <SmashableCrystal position={[3, -2, 0]} />
                  <SmashableCrystal position={[0, 0, -2]} />
                </>
              )}
            
              {/* Background sparkles */}
              <Sparkles
                count={200}
                scale={15}
                size={1}
                speed={0.5}
                opacity={0.5}
                color="#ffffff"
              />
            </Suspense>
          </Canvas>
        </div>
      )}
      
      {/* Photorealistic Black Hole Background - inspired by Interstellar/Event Horizon */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black mix-blend-screen pointer-events-none">
        {/* Deep space environment */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-blue-950/10 to-black"></div>
        
        {/* Distant starfield */}
        <div className="absolute inset-0">
          {/* Background stars */}
          {[...Array(400)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${0.5 + Math.random() * 1.5}px`,
                height: `${0.5 + Math.random() * 1.5}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: `rgba(255, 255, 255, ${0.3 + Math.random() * 0.7})`,
                animation: `twinkle ${4 + Math.random() * 6}s infinite`,
                animationDelay: `${Math.random() * 8}s`
              }}
            />
          ))}
          
          {/* Bright foreground stars */}
          {[...Array(80)].map((_, i) => (
            <div
              key={`bright-star-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: `rgba(255, 255, 255, ${0.7 + Math.random() * 0.3})`,
                animation: `twinkle ${3 + Math.random() * 4}s infinite`,
                animationDelay: `${Math.random() * 5}s`,
                boxShadow: `0 0 ${4 + Math.random() * 6}px rgba(255, 255, 255, 0.6)`
              }}
            />
          ))}
        </div>

        {/* Main Black Hole System - matching the reference image */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* Outer glow/atmosphere - smoother cosmic glow */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
            style={{
              background: 'radial-gradient(circle at center, transparent 40%, rgba(135, 206, 250, 0.08) 50%, rgba(30, 144, 255, 0.12) 70%, transparent 85%)',
              filter: 'blur(40px)',
              animation: 'cosmic-glow 12s ease-in-out infinite'
            }}
          />
          
          {/* Brilliant white accretion ring - main feature from the image */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background: `conic-gradient(from 0deg at 50% 50%, 
                rgba(255, 255, 255, 0.9) 0deg,
                rgba(173, 216, 230, 0.8) 45deg,
                rgba(255, 255, 255, 1) 90deg,
                rgba(135, 206, 250, 0.8) 135deg,
                rgba(255, 255, 255, 0.9) 180deg,
                rgba(173, 216, 230, 0.8) 225deg,
                rgba(255, 255, 255, 1) 270deg,
                rgba(135, 206, 250, 0.8) 315deg,
                rgba(255, 255, 255, 0.9) 360deg)`,
              animation: 'rotate-slow 25s linear infinite',
              filter: 'blur(3px) brightness(1.2)',
              transform: 'rotateX(75deg)',
              boxShadow: `0 0 100px rgba(255, 255, 255, 0.8),
                          0 0 200px rgba(173, 216, 230, 0.6),
                          0 0 300px rgba(135, 206, 250, 0.4)`,
              mixBlendMode: 'screen'
            }}
          />
          
          {/* Inner bright ring */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
            style={{
              background: `conic-gradient(from 90deg at 50% 50%, 
                rgba(255, 255, 255, 1) 0deg,
                rgba(240, 248, 255, 0.9) 90deg,
                rgba(255, 255, 255, 1) 180deg,
                rgba(240, 248, 255, 0.9) 270deg)`,
              animation: 'rotate-fast 15s linear infinite reverse',
              filter: 'blur(2px) brightness(1.5)',
              transform: 'rotateX(75deg)',
              boxShadow: '0 0 150px rgba(255, 255, 255, 1)'
            }}
          />
          
          {/* Photon sphere - intense white glow */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full"
            style={{
              background: `radial-gradient(circle at 50% 50%, 
                transparent 30%,
                rgba(255, 255, 255, 0.95) 35%,
                rgba(255, 255, 255, 0.7) 40%,
                rgba(173, 216, 230, 0.4) 45%,
                transparent 50%)`,
              animation: 'pulse-slow 4s ease-in-out infinite',
              boxShadow: `0 0 80px rgba(255, 255, 255, 0.9),
                          0 0 160px rgba(173, 216, 230, 0.6)`,
              filter: 'blur(1px)'
            }}
          />
          
          {/* Event horizon - perfect black sphere */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(5, 5, 5, 0.95), black)',
              boxShadow: `inset 0 0 60px rgba(0, 0, 0, 1),
                          inset 0 0 100px rgba(0, 0, 0, 0.95),
                          0 0 120px rgba(0, 0, 0, 0.9)`,
              animation: 'wobble 30s ease-in-out infinite'
            }}
          >
            {/* Singularity - absolute darkness */}
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40px] h-[40px] rounded-full"
              style={{
                background: 'radial-gradient(circle at center, #000000, rgba(0, 0, 0, 0.98))',
                boxShadow: 'inset 0 0 40px #000000'
              }}
            />
          </div>
          
          {/* Gravitational lensing effects */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, 
                transparent 20%,
                rgba(255, 255, 255, 0.08) 30%,
                transparent 35%,
                rgba(173, 216, 230, 0.05) 45%,
                transparent 55%)`,
              animation: 'lens-distort 12s ease-in-out infinite',
              filter: 'blur(3px)'
            }}
          />
          
          {/* Subtle relativistic jets */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full w-6 h-[400px]"
            style={{
              background: `linear-gradient(to top, 
                transparent,
                rgba(173, 216, 230, 0.15) 30%,
                rgba(255, 255, 255, 0.25) 70%,
                transparent)`,
              filter: 'blur(8px)',
              animation: 'jet-pulse 6s ease-in-out infinite',
              transformOrigin: 'bottom center'
            }}
          />
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-6 h-[400px]"
            style={{
              background: `linear-gradient(to bottom, 
                transparent,
                rgba(173, 216, 230, 0.15) 30%,
                rgba(255, 255, 255, 0.25) 70%,
                transparent)`,
              filter: 'blur(8px)',
              animation: 'jet-pulse 6s ease-in-out infinite',
              animationDelay: '3s',
              transformOrigin: 'top center'
            }}
          />
        </div>
        
        {/* Floating debris and cosmic dust */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`debris-${i}`}
            className="absolute w-1 h-1 bg-white/60 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${15 + Math.random() * 25}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 15}s`,
              opacity: 0.6
            }}
          />
        ))}
      </div>

      <div className="relative z-10 calm-space-content">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="text-center">
              <h1 className="text-3xl font-light tracking-tight text-white">
                Calm Space
              </h1>
              <p className="text-gray-400 text-sm">Find peace in the cosmic void</p>
            </div>
            <div className="w-24"></div>
          </div>

          {/* Music Player */}
          <Card className="apple-card p-8 mb-8 backdrop-blur-xl bg-white/5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-light mb-4 text-white">
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

          {/* Cosmic Debris Controls */}
          <Card className="apple-card p-6 mt-8 backdrop-blur-xl bg-white/3">
            <h3 className="text-xl font-light mb-4 text-gradient-calm">Cosmic Debris</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Enable Cosmic Debris</span>
                <button
                  onClick={() => {
                    setCosmicDebrisEnabled(!cosmicDebrisEnabled);
                    savePreferences.mutate({
                      userId: 'dev-user-1',
                      cosmicDebrisEnabled: !cosmicDebrisEnabled,
                      debrisIntensity,
                      volume
                    });
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    cosmicDebrisEnabled ? 'bg-calm-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      cosmicDebrisEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {cosmicDebrisEnabled && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Debris Intensity</span>
                    <span className="text-gray-400 text-sm">{Math.round(debrisIntensity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={debrisIntensity}
                    onChange={(e) => {
                      const newIntensity = parseFloat(e.target.value);
                      setDebrisIntensity(newIntensity);
                      savePreferences.mutate({
                        userId: 'dev-user-1',
                        cosmicDebrisEnabled,
                        debrisIntensity: newIntensity,
                        volume
                      });
                    }}
                    className="w-full accent-calm-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Higher intensity adds more interactive crystals you can smash
                  </p>
                </div>
              )}
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
