
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Hammer, ArrowLeft } from 'lucide-react';

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
  size: number;
  broken: boolean;
}

const SmashMode = ({ content, onBack, onComplete }: SmashModeProps) => {
  const [objects, setObjects] = useState<SmashableObject[]>([]);
  const [smashedCount, setSmashedCount] = useState(0);
  const [shards, setShards] = useState<Array<{id: number, x: number, y: number}>>([]);

  useEffect(() => {
    // Initialize objects randomly on screen
    const initialObjects: SmashableObject[] = [
      { id: '1', emoji: '🍽️', name: 'Plate', x: 20, y: 30, size: 60, broken: false },
      { id: '2', emoji: '📱', name: 'Phone', x: 70, y: 20, size: 50, broken: false },
      { id: '3', emoji: '🧱', name: 'Brick', x: 40, y: 60, size: 70, broken: false },
      { id: '4', emoji: '🪟', name: 'Window', x: 15, y: 70, size: 80, broken: false },
      { id: '5', emoji: '📸', name: 'Frame', x: 75, y: 65, size: 55, broken: false },
      { id: '6', emoji: '⏰', name: 'Clock', x: 50, y: 25, size: 65, broken: false },
    ];
    setObjects(initialObjects);
  }, []);

  const smashObject = (objectId: string) => {
    setObjects(prev => prev.map(obj => {
      if (obj.id === objectId && !obj.broken) {
        // Create shards
        const newShards = Array.from({ length: 8 }, (_, i) => ({
          id: Date.now() + i,
          x: obj.x + Math.random() * 20 - 10,
          y: obj.y + Math.random() * 20 - 10
        }));
        setShards(prev => [...prev, ...newShards]);
        
        // Remove shards after animation
        setTimeout(() => {
          setShards(prev => prev.filter(s => !newShards.some(ns => ns.id === s.id)));
        }, 1000);

        setSmashedCount(prev => prev + 1);
        return { ...obj, broken: true };
      }
      return obj;
    }));
  };

  useEffect(() => {
    if (smashedCount >= 6) {
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  }, [smashedCount, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 via-slate-700 to-gray-900 text-white relative overflow-hidden">
      {/* Destruction Environment */}
      <div className="absolute inset-0">
        {/* Crack effects */}
        {smashedCount > 0 && (
          <div className="absolute inset-0">
            {Array.from({ length: smashedCount * 3 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-white/20 h-px"
                style={{
                  width: `${50 + Math.random() * 100}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>
        )}
        
        {/* Flying shards */}
        {shards.map(shard => (
          <div
            key={shard.id}
            className="absolute w-3 h-3 bg-white animate-ping"
            style={{
              left: `${shard.x}%`,
              top: `${shard.y}%`,
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>

        {/* Smashable Objects */}
        <div className="relative h-96 mb-8">
          {objects.map(obj => (
            <div
              key={obj.id}
              className={`absolute cursor-pointer transition-all duration-300 ${
                obj.broken 
                  ? 'opacity-30 scale-75 pointer-events-none' 
                  : 'hover:scale-110 active:scale-95'
              }`}
              style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
                fontSize: `${obj.size}px`,
              }}
              onClick={() => !obj.broken && smashObject(obj.id)}
            >
              <div className={`transform transition-transform ${obj.broken ? 'rotate-45' : ''}`}>
                {obj.emoji}
              </div>
              {obj.broken && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-red-500 text-4xl">💥</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress */}
        <Card className="bg-black/30 backdrop-blur-sm border-gray-400/30 p-6 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-slate-600 rounded-full flex items-center justify-center mx-auto">
              <Hammer className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold">
              {smashedCount === 0 ? 'Tap objects to smash them' :
               smashedCount < 6 ? `${smashedCount}/6 objects smashed` :
               'All destroyed! Feel better?'}
            </h2>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(smashedCount / 6) * 100}%` }}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SmashMode;
