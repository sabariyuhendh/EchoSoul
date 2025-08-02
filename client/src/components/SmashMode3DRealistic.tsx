import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Environment, 
  PerspectiveCamera, 
  ContactShadows,
  Float,
  useTexture,
  Sparkles
} from '@react-three/drei';
// Post-processing effects removed due to dependency conflicts
// Using built-in Three.js effects instead
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, Sparkles as SparklesIcon, Volume2, VolumeX } from 'lucide-react';

interface SmashMode3DRealisticProps {
  content: string;
  onBack: () => void;
  onComplete: () => void;
}

// Object types with materials and properties
const OBJECT_TYPES = {
  crystal_orb: {
    name: 'Crystal Orb',
    color: '#87CEEB',
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.9,
    thickness: 2,
    ior: 2.4,
    pieces: 30,
    soundFile: 'crystal'
  },
  ceramic_vase: {
    name: 'Ceramic Vase',
    color: '#DEB887',
    metalness: 0.0,
    roughness: 0.8,
    transmission: 0,
    thickness: 0,
    ior: 1.5,
    pieces: 25,
    soundFile: 'ceramic'
  },
  glass_bottle: {
    name: 'Glass Bottle',
    color: '#90EE90',
    metalness: 0.0,
    roughness: 0.1,
    transmission: 0.8,
    thickness: 0.5,
    ior: 1.5,
    pieces: 35,
    soundFile: 'glass'
  },
  metal_cube: {
    name: 'Metal Cube',
    color: '#C0C0C0',
    metalness: 0.9,
    roughness: 0.2,
    transmission: 0,
    thickness: 0,
    ior: 1.5,
    pieces: 20,
    soundFile: 'metal'
  }
};

// Debris particle component
function Debris({ position, velocity, material, size }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [opacity, setOpacity] = useState(1);

  useFrame((state, delta) => {
    if (meshRef.current && opacity > 0) {
      meshRef.current.position.x += velocity.x * delta;
      meshRef.current.position.y += velocity.y * delta;
      meshRef.current.position.z += velocity.z * delta;
      
      meshRef.current.rotation.x += delta * 5;
      meshRef.current.rotation.y += delta * 3;
      
      velocity.y -= 9.8 * delta; // Gravity
      
      const newOpacity = opacity - delta * 0.5;
      setOpacity(newOpacity);
      
      if (meshRef.current.material) {
        (meshRef.current.material as any).opacity = newOpacity;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[size, size, size]} />
      <meshPhysicalMaterial 
        {...material}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

// Main 3D object component
function SmashableObject({ 
  type, 
  onSmash, 
  content 
}: { 
  type: keyof typeof OBJECT_TYPES; 
  onSmash: () => void; 
  content: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isSmashed, setIsSmashed] = useState(false);
  const [debris, setDebris] = useState<any[]>([]);
  const [chargeLevel, setChargeLevel] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  
  const objectConfig = OBJECT_TYPES[type];
  const { camera } = useThree();

  // Handle mouse down/up for charge mechanic
  const handlePointerDown = () => {
    setIsCharging(true);
  };

  const handlePointerUp = () => {
    if (chargeLevel >= 0.99 && !isSmashed) {
      // Only smash when fully charged (100%)
      smashObject();
    } else if (chargeLevel > 0.3 && !isSmashed) {
      // Partial effects for partial charge
      smashObject();
    }
    setIsCharging(false);
    setChargeLevel(0);
  };

  // Update charge level
  useFrame((state, delta) => {
    if (isCharging && chargeLevel < 1) {
      setChargeLevel(Math.min(chargeLevel + delta * 2, 1));
    }
    
    // Subtle floating animation
    if (meshRef.current && !isSmashed) {
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05;
    }
    
    // Camera shake on impact
    if (isSmashed && meshRef.current) {
      const shakeIntensity = 0.02 * Math.exp(-state.clock.elapsedTime * 2);
      camera.position.x += (Math.random() - 0.5) * shakeIntensity;
      camera.position.y += (Math.random() - 0.5) * shakeIntensity;
    }
  });

  const smashObject = () => {
    if (!meshRef.current) return;
    
    setIsSmashed(true);
    
    // Create debris particles
    const newDebris = [];
    const pieceCount = objectConfig.pieces;
    
    for (let i = 0; i < pieceCount; i++) {
      const angle = (i / pieceCount) * Math.PI * 2;
      const force = 5 + Math.random() * 10;
      const elevation = Math.random() * Math.PI * 0.5;
      
      newDebris.push({
        id: i,
        position: [
          Math.sin(angle) * Math.random() * 0.5,
          Math.random() * 0.5,
          Math.cos(angle) * Math.random() * 0.5
        ],
        velocity: {
          x: Math.sin(angle) * Math.cos(elevation) * force * chargeLevel,
          y: Math.sin(elevation) * force * chargeLevel * 1.5,
          z: Math.cos(angle) * Math.cos(elevation) * force * chargeLevel
        },
        material: {
          color: objectConfig.color,
          metalness: objectConfig.metalness,
          roughness: objectConfig.roughness,
          transmission: objectConfig.transmission * 0.5,
          thickness: objectConfig.thickness * 0.5,
          ior: objectConfig.ior
        },
        size: 0.1 + Math.random() * 0.2
      });
    }
    
    setDebris(newDebris);
    
    // Play sound effect
    const audio = new Audio(`/sounds/${objectConfig.soundFile}-break.mp3`);
    audio.volume = 0.5;
    audio.play().catch(() => {});
    
    // Complete after animation
    setTimeout(() => {
      onSmash();
    }, 2000);
  };

  // Render different shapes based on type
  const renderGeometry = () => {
    switch (type) {
      case 'crystal_orb':
        return <sphereGeometry args={[1, 32, 32]} />;
      case 'ceramic_vase':
        return <cylinderGeometry args={[0.8, 0.6, 2, 32]} />;
      case 'glass_bottle':
        return <cylinderGeometry args={[0.4, 0.3, 2.5, 32]} />;
      case 'metal_cube':
        return <boxGeometry args={[1.5, 1.5, 1.5]} />;
      default:
        return <sphereGeometry args={[1, 32, 32]} />;
    }
  };

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
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => {
              setIsCharging(false);
              setChargeLevel(0);
            }}
            onPointerOver={() => setIsHovered(true)}
            onPointerOut={() => setIsHovered(false)}
            scale={isHovered ? 1.05 : 1}
          >
            {renderGeometry()}
            <meshPhysicalMaterial
              color={objectConfig.color}
              metalness={objectConfig.metalness}
              roughness={objectConfig.roughness}
              transmission={objectConfig.transmission}
              thickness={objectConfig.thickness}
              ior={objectConfig.ior}
              reflectivity={0.9}
              envMapIntensity={1}
              clearcoat={0.5}
              clearcoatRoughness={0.1}
              emissive={isCharging ? objectConfig.color : '#000000'}
              emissiveIntensity={chargeLevel * 0.5}
            />
          </mesh>
        </Float>
      )}
      
      {/* Charge indicator */}
      {isCharging && !isSmashed && (
        <mesh position={[0, -2, 0]}>
          <ringGeometry args={[1.5, 1.8, 32]} />
          <meshBasicMaterial color="#ffffff" opacity={chargeLevel} transparent />
        </mesh>
      )}
      
      {/* Debris particles */}
      {debris.map((piece) => (
        <Debris key={piece.id} {...piece} />
      ))}
      
      {/* Impact particles */}
      {isSmashed && (
        <Sparkles
          count={100}
          scale={3}
          size={2}
          speed={2}
          opacity={0.8}
          color={objectConfig.color}
        />
      )}
    </>
  );
}

// Scene lighting and environment
function SceneSetup() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#87CEEB" />
      <spotLight
        position={[0, 5, 0]}
        angle={0.5}
        penumbra={1}
        intensity={0.5}
        castShadow
      />
      <Environment preset="studio" background blur={0.5} />
      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.5}
        scale={10}
        blur={2}
        far={10}
      />
    </>
  );
}

// Simplified effects using built-in Three.js fog
function SceneEffects() {
  useFrame((state) => {
    // Dynamic fog based on time
    state.scene.fog = new THREE.Fog('#000000', 5, 20);
  });
  
  return null;
}

const SmashMode3DRealistic = ({ content, onBack, onComplete }: SmashMode3DRealisticProps) => {
  const [currentObject, setCurrentObject] = useState<keyof typeof OBJECT_TYPES>('crystal_orb');
  const [smashedCount, setSmashedCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showContent, setShowContent] = useState(true);

  const handleSmash = () => {
    setSmashedCount(prev => prev + 1);
    
    // Cycle through objects
    setTimeout(() => {
      const objects = Object.keys(OBJECT_TYPES) as (keyof typeof OBJECT_TYPES)[];
      const currentIndex = objects.indexOf(currentObject);
      const nextIndex = (currentIndex + 1) % objects.length;
      setCurrentObject(objects[nextIndex]);
    }, 2500);
    
    if (smashedCount >= 2) {
      setTimeout(onComplete, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white page-content relative">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas shadows>
          <Suspense fallback={null}>
            <SceneSetup />
            <Physics gravity={[0, -9.81, 0]}>
              <SmashableObject
                type={currentObject}
                onSmash={handleSmash}
                content={content}
              />
              {/* Ground plane */}
              <RigidBody type="fixed">
                <mesh position={[0, -2, 0]} receiveShadow>
                  <planeGeometry args={[100, 100]} />
                  <meshStandardMaterial color="#0a0a0a" />
                </mesh>
              </RigidBody>
            </Physics>
            <SceneEffects />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 p-6">
        <div className="flex justify-between items-start mb-8">
          <Button
            onClick={onBack}
            className="apple-button bg-white/10 hover:bg-white/20 text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="apple-button bg-white/10 hover:bg-white/20 text-white"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <Card className="apple-card max-w-md mx-auto p-6 backdrop-blur-xl bg-white/5 border-white/10">
          <h2 className="text-2xl font-light mb-4 text-gradient-wellness">
            Release Through Destruction
          </h2>
          <p className="text-gray-300 mb-4">
            Hold click to charge your smash. The longer you hold, the more spectacular the destruction.
          </p>
          <p className="text-sm text-gray-400">
            Current object: <span className="text-gradient-calm">{OBJECT_TYPES[currentObject].name}</span>
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Objects smashed: <span className="text-gradient-amber">{smashedCount}</span>
          </p>
        </Card>

        {/* Content display */}
        {showContent && content && (
          <Card className="apple-card max-w-lg mx-auto mt-6 p-6 backdrop-blur-xl bg-white/5 border-white/10">
            <p className="text-gray-300 italic">"{content}"</p>
            <Button
              onClick={() => setShowContent(false)}
              className="mt-4 text-sm text-gray-400 hover:text-white"
            >
              Hide message
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SmashMode3DRealistic;