import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { 
  Environment, 
  PerspectiveCamera, 
  OrbitControls,
  useTexture,
  useGLTF,
  ContactShadows,
  Center,
  Text3D,
  Float,
  Sparkles,
  PointMaterial,
  Points,
  useHelper,
  Lightformer,
  BakeShadows,
  AccumulativeShadows,
  RandomizedLight,
  Stage,
  PerformanceMonitor,
  Preload
} from '@react-three/drei';
import { 
  EffectComposer, 
  Bloom, 
  DepthOfField,
  Noise,
  Vignette,
  SSAO,
  SSR
} from '@react-three/postprocessing';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Hammer, ArrowLeft, Sparkle, Volume2, VolumeX } from 'lucide-react';
import * as THREE from 'three';
import { BlendFunction, KernelSize } from 'postprocessing';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface SmashModeHyperRealisticProps {
  content: string;
  onBack: () => void;
  onComplete: () => void;
}

// Define object types with realistic materials
const OBJECT_CATALOG = {
  crystal_orb: {
    name: 'Crystal Orb',
    baseColor: '#4FC3F7',
    emissiveColor: '#29B6F6',
    metalness: 0.0,
    roughness: 0.0,
    transmission: 1,
    thickness: 3,
    ior: 2.4,
    clearcoat: 1,
    clearcoatRoughness: 0,
    envMapIntensity: 3,
    pieces: 40,
    scale: 1.5,
    mass: 2
  },
  ceramic_vase: {
    name: 'Ancient Vase',
    baseColor: '#D4A574',
    emissiveColor: '#8B6914',
    metalness: 0.1,
    roughness: 0.9,
    transmission: 0,
    thickness: 0,
    ior: 1.5,
    clearcoat: 0.3,
    clearcoatRoughness: 0.5,
    envMapIntensity: 0.5,
    pieces: 30,
    scale: 2,
    mass: 3
  },
  glass_bottle: {
    name: 'Glass Bottle',
    baseColor: '#81C784',
    emissiveColor: '#43A047',
    metalness: 0.0,
    roughness: 0.0,
    transmission: 0.95,
    thickness: 1,
    ior: 1.5,
    clearcoat: 1,
    clearcoatRoughness: 0,
    envMapIntensity: 2,
    pieces: 35,
    scale: 1.8,
    mass: 1.5
  },
  obsidian_cube: {
    name: 'Obsidian Cube',
    baseColor: '#212121',
    emissiveColor: '#9C27B0',
    metalness: 0.95,
    roughness: 0.1,
    transmission: 0,
    thickness: 0,
    ior: 1.5,
    clearcoat: 1,
    clearcoatRoughness: 0,
    envMapIntensity: 1,
    pieces: 25,
    scale: 1.3,
    mass: 4
  },
  golden_sphere: {
    name: 'Golden Sphere',
    baseColor: '#FFD700',
    emissiveColor: '#FFA000',
    metalness: 1,
    roughness: 0.2,
    transmission: 0,
    thickness: 0,
    ior: 1.5,
    clearcoat: 0,
    clearcoatRoughness: 0,
    envMapIntensity: 2,
    pieces: 45,
    scale: 1.4,
    mass: 5
  }
};

// Physics-based debris particle
function DebrisParticle({ position, velocity, material, size }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [opacity, setOpacity] = useState(1);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 5;
      meshRef.current.rotation.y += delta * 3;
      setOpacity(prev => Math.max(0, prev - delta * 0.5));
    }
  });

  return (
    <RigidBody
      position={position}
      linearVelocity={velocity}
      angularVelocity={[
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ]}
      gravityScale={1.5}
      linearDamping={0.5}
      angularDamping={0.5}
    >
      <mesh ref={meshRef}>
        <boxGeometry args={[size, size, size]} />
        <meshPhysicalMaterial
          {...material}
          transparent
          opacity={opacity}
        />
      </mesh>
    </RigidBody>
  );
}

// Main smashable object with realistic physics
function SmashableObject({ 
  objectType, 
  onSmash, 
  isSmashed,
  smashPower 
}: { 
  objectType: keyof typeof OBJECT_CATALOG;
  onSmash: (force: number, pattern: string) => void;
  isSmashed: boolean;
  smashPower: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [debris, setDebris] = useState<any[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const object = OBJECT_CATALOG[objectType];
  
  // Generate destruction pattern based on impact
  const generateDebris = (impactPoint: THREE.Vector3, force: number) => {
    const pattern = force > 70 ? 'explosive' : force > 40 ? 'radial' : 'crack';
    const pieces = Math.floor(object.pieces * (force / 100));
    const newDebris = [];
    
    for (let i = 0; i < pieces; i++) {
      const angle = (i / pieces) * Math.PI * 2;
      const radius = Math.random() * 2;
      const height = Math.random() * 3;
      
      newDebris.push({
        id: `debris_${i}_${Date.now()}`,
        position: [
          impactPoint.x + Math.cos(angle) * radius,
          impactPoint.y + height,
          impactPoint.z + Math.sin(angle) * radius
        ],
        velocity: [
          Math.cos(angle) * force * 0.2,
          Math.random() * force * 0.3,
          Math.sin(angle) * force * 0.2
        ],
        size: Math.random() * 0.3 + 0.1,
        material: {
          color: object.baseColor,
          metalness: object.metalness,
          roughness: object.roughness,
          transmission: object.transmission,
          ior: object.ior
        }
      });
    }
    
    setDebris(newDebris);
    onSmash(force, pattern);
  };
  
  const handleClick = (event: any) => {
    if (!isSmashed && smashPower > 0) {
      event.stopPropagation();
      const impactPoint = event.point;
      generateDebris(impactPoint, smashPower);
    }
  };
  
  // Floating animation
  useFrame((state) => {
    if (meshRef.current && !isSmashed) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });
  
  return (
    <>
      {!isSmashed && (
        <Float
          speed={2}
          rotationIntensity={0.5}
          floatIntensity={0.5}
        >
          <mesh
            ref={meshRef}
            onClick={handleClick}
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
            scale={isHovered ? object.scale * 1.1 : object.scale}
          >
            {objectType === 'crystal_orb' && <sphereGeometry args={[1, 64, 64]} />}
            {objectType === 'ceramic_vase' && <cylinderGeometry args={[0.7, 1, 2, 32]} />}
            {objectType === 'glass_bottle' && <cylinderGeometry args={[0.3, 0.5, 2.5, 32]} />}
            {objectType === 'obsidian_cube' && <boxGeometry args={[1.5, 1.5, 1.5]} />}
            {objectType === 'golden_sphere' && <icosahedronGeometry args={[1, 2]} />}
            
            <meshPhysicalMaterial
              color={object.baseColor}
              emissive={object.emissiveColor}
              emissiveIntensity={isHovered ? 0.5 : 0.2}
              metalness={object.metalness}
              roughness={object.roughness}
              transmission={object.transmission}
              thickness={object.thickness}
              ior={object.ior}
              clearcoat={object.clearcoat}
              clearcoatRoughness={object.clearcoatRoughness}
              envMapIntensity={object.envMapIntensity}
              reflectivity={1}
            />
          </mesh>
        </Float>
      )}
      
      {/* Render debris particles */}
      {debris.map((particle) => (
        <DebrisParticle key={particle.id} {...particle} />
      ))}
    </>
  );
}

// Enhanced scene with realistic lighting and effects
function Scene({ 
  currentObject, 
  onSmash, 
  isSmashed,
  smashPower 
}: { 
  currentObject: keyof typeof OBJECT_CATALOG;
  onSmash: (force: number, pattern: string) => void;
  isSmashed: boolean;
  smashPower: number;
}) {
  return (
    <>
      {/* Lighting setup for realistic rendering */}
      <ambientLight intensity={0.2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        castShadow
        shadow-mapSize={2048}
      />
      <spotLight
        position={[-10, 10, -10]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        color="#4FC3F7"
      />
      
      {/* Environment for realistic reflections */}
      <Environment preset="warehouse" />
      
      {/* Ground with shadows */}
      <mesh receiveShadow position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      {/* Contact shadows for realism */}
      <ContactShadows
        position={[0, -2.8, 0]}
        opacity={0.6}
        scale={10}
        blur={2}
        far={10}
      />
      
      {/* Floating particles for atmosphere */}
      <Sparkles
        count={100}
        scale={10}
        size={2}
        speed={0.5}
        opacity={0.5}
        color="#4FC3F7"
      />
      
      {/* Main object */}
      <SmashableObject
        objectType={currentObject}
        onSmash={onSmash}
        isSmashed={isSmashed}
        smashPower={smashPower}
      />
    </>
  );
}

// Power meter visualization
function PowerMeter({ power }: { power: number }) {
  const colors = {
    low: '#4FC3F7',
    medium: '#FFA726',
    high: '#EF5350'
  };
  
  const color = power < 33 ? colors.low : power < 66 ? colors.medium : colors.high;
  
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
      <div className="bg-black/60 backdrop-blur-lg rounded-full p-4 border border-white/20">
        <div className="text-center mb-2">
          <span className="text-white text-sm font-medium">SMASH POWER</span>
        </div>
        <div className="w-64 h-8 bg-black/40 rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${power}%`,
              background: `linear-gradient(90deg, ${color}88 0%, ${color} 100%)`,
              boxShadow: `0 0 20px ${color}66`
            }}
          />
        </div>
        <div className="text-center mt-2">
          <span className="text-2xl font-bold" style={{ color }}>
            {Math.round(power)}%
          </span>
        </div>
      </div>
    </div>
  );
}

const SmashModeHyperRealistic = ({ content, onBack, onComplete }: SmashModeHyperRealisticProps) => {
  const [currentObject, setCurrentObject] = useState<keyof typeof OBJECT_CATALOG>('crystal_orb');
  const [smashedCount, setSmashedCount] = useState(0);
  const [smashPower, setSmashPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [showContent, setShowContent] = useState(true);
  const [isSmashed, setIsSmashed] = useState(false);
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
    
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    
    // Create complex sound based on material
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Material-specific sound design
    if (material.includes('crystal') || material.includes('glass')) {
      oscillator.frequency.setValueAtTime(2000 + Math.random() * 2000, now);
      oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.5);
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, now);
    } else if (material.includes('ceramic')) {
      oscillator.frequency.setValueAtTime(800 + Math.random() * 400, now);
      oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.3);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
    } else {
      oscillator.frequency.setValueAtTime(150 + Math.random() * 100, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);
    }
    
    gainNode.gain.setValueAtTime(0.3 * (force / 100), now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    oscillator.start(now);
    oscillator.stop(now + 0.5);
  };
  
  // Handle object destruction
  const handleSmash = (force: number, pattern: string) => {
    const object = OBJECT_CATALOG[currentObject];
    playDestructionSound(object.name, force);
    setIsSmashed(true);
    setSmashedCount(prev => prev + 1);
    
    // Save statistics
    saveStats.mutate({
      objectType: currentObject,
      smashForce: force,
      destructionPattern: pattern,
      emotionalRelease: Math.round(force / 10),
      sessionId
    });
    
    // Show feedback
    toast({
      title: `${object.name} Destroyed!`,
      description: `Power: ${Math.round(force)}% - Pattern: ${pattern}`,
    });
    
    // Cycle to next object
    setTimeout(() => {
      const objects = Object.keys(OBJECT_CATALOG) as (keyof typeof OBJECT_CATALOG)[];
      const currentIndex = objects.indexOf(currentObject);
      const nextIndex = (currentIndex + 1) % objects.length;
      setCurrentObject(objects[nextIndex]);
      setIsSmashed(false);
      setSmashPower(0);
      
      if (smashedCount >= 4) {
        setTimeout(onComplete, 1000);
      }
    }, 2000);
  };
  
  // Power charging mechanism
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCharging) {
      interval = setInterval(() => {
        setSmashPower(prev => Math.min(100, prev + 2));
      }, 20);
    } else if (smashPower > 0) {
      interval = setInterval(() => {
        setSmashPower(prev => Math.max(0, prev - 5));
      }, 50);
    }
    
    return () => clearInterval(interval);
  }, [isCharging, smashPower]);
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-1">Hyper-Realistic Smash Mode</h1>
            <p className="text-gray-400">{OBJECT_CATALOG[currentObject].name}</p>
          </div>
          
          <Button
            variant="ghost"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-white hover:bg-white/10"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
        </div>
      </div>
      
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas
          shadows
          camera={{ position: [0, 2, 8], fov: 45 }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.5
          }}
        >
          <Suspense fallback={null}>
            <PerformanceMonitor>
              <Physics gravity={[0, -9.81, 0]}>
                <Scene
                  currentObject={currentObject}
                  onSmash={handleSmash}
                  isSmashed={isSmashed}
                  smashPower={smashPower}
                />
              </Physics>
              
              <OrbitControls
                enablePan={false}
                enableZoom={false}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 2}
              />
              
              {/* Post-processing effects */}
              <EffectComposer>
                <Bloom
                  intensity={0.5}
                  kernelSize={KernelSize.LARGE}
                  luminanceThreshold={0.8}
                  luminanceSmoothing={0.9}
                />
                <DepthOfField
                  focusDistance={0.01}
                  focalLength={0.05}
                  bokehScale={3}
                />
                <Vignette
                  eskil={false}
                  offset={0.1}
                  darkness={0.4}
                />
              </EffectComposer>
            </PerformanceMonitor>
          </Suspense>
          <Preload all />
        </Canvas>
      </div>
      
      {/* Power meter */}
      <PowerMeter power={smashPower} />
      
      {/* Charge button */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20">
        <Button
          size="lg"
          className={`
            px-12 py-6 text-xl font-bold rounded-full
            transition-all duration-300 transform
            ${isCharging 
              ? 'bg-gradient-to-r from-red-600 to-orange-600 scale-110 animate-pulse' 
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:scale-105'
            }
            text-white shadow-2xl
          `}
          onMouseDown={() => setIsCharging(true)}
          onMouseUp={() => setIsCharging(false)}
          onMouseLeave={() => setIsCharging(false)}
          onTouchStart={() => setIsCharging(true)}
          onTouchEnd={() => setIsCharging(false)}
        >
          <Hammer className="w-6 h-6 mr-2" />
          {isCharging ? 'CHARGING...' : 'HOLD TO CHARGE'}
        </Button>
      </div>
      
      {/* Progress indicator */}
      <div className="absolute top-24 right-6 z-20">
        <Card className="bg-black/60 backdrop-blur-lg p-6 border-white/20">
          <h3 className="text-white text-lg font-semibold mb-4">Progress</h3>
          <div className="space-y-2">
            {Object.keys(OBJECT_CATALOG).map((key, index) => (
              <div key={key} className="flex items-center space-x-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${index < smashedCount 
                    ? 'bg-green-500' 
                    : index === smashedCount 
                    ? 'bg-blue-500 animate-pulse' 
                    : 'bg-gray-700'
                  }
                `}>
                  {index < smashedCount ? '✓' : index + 1}
                </div>
                <span className={`
                  text-sm
                  ${index < smashedCount 
                    ? 'text-green-400' 
                    : index === smashedCount 
                    ? 'text-white' 
                    : 'text-gray-500'
                  }
                `}>
                  {OBJECT_CATALOG[key as keyof typeof OBJECT_CATALOG].name}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      {/* Content display */}
      {showContent && content && (
        <div className="absolute top-24 left-6 z-20 max-w-md">
          <Card className="bg-black/60 backdrop-blur-lg p-6 border-white/20">
            <p className="text-gray-300 italic mb-4">"{content}"</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowContent(false)}
              className="text-gray-400 hover:text-white"
            >
              Hide message
            </Button>
          </Card>
        </div>
      )}
      
      {/* Instructions */}
      {smashedCount === 0 && (
        <div className="absolute bottom-52 left-1/2 transform -translate-x-1/2 z-20">
          <p className="text-white/60 text-center">
            Hold the button to charge power, then click the object to smash!
          </p>
        </div>
      )}
    </div>
  );
};

export default SmashModeHyperRealistic;