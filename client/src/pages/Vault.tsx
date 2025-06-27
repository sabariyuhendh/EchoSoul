import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Clock, Save, Trash2 } from 'lucide-react';

const Vault = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(480); // 8 minutes in seconds
  const [content, setContent] = useState('');
  const [entries, setEntries] = useState<string[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = () => {
    setIsActive(true);
    setTimeLeft(480);
    setContent('');
  };

  const saveEntry = () => {
    if (content.trim()) {
      setEntries([content, ...entries]);
      setContent('');
      setIsActive(false);
      setTimeLeft(480);
    }
  };

  const deleteEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const progress = ((480 - timeLeft) / 480) * 100;

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-24">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-light tracking-tight">
            <span className="text-gradient-calm">Vault</span>
          </h1>
          <p className="text-gray-400 text-sm">8-minute emotional release sessions</p>
        </div>

        {/* Timer Card */}
        <Card className="calm-card p-8 mb-8">
          <div className="text-center mb-6">
            <div className="text-6xl font-light mb-4 text-gradient-calm">
              {formatTime(timeLeft)}
            </div>
            <Progress value={progress} className="w-full h-2 mb-4" />
            {!isActive ? (
              <Button 
                onClick={startSession}
                className="apple-button bg-gradient-to-r from-calm-500 to-sage-500 text-white px-8 py-3"
              >
                <Clock className="w-5 h-5 mr-2" />
                Start 8-Minute Session
              </Button>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-400">Session in progress... Let it all out.</p>
                <Button 
                  onClick={saveEntry}
                  className="apple-button bg-gradient-to-r from-sage-500 to-lavender-500 text-white px-6 py-2"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save & End
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Writing Area */}
        {isActive && (
          <Card className="calm-card p-6 mb-8">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write everything you're feeling... no judgment, no limits."
              className="min-h-64 bg-transparent border-none text-lg resize-none focus:ring-0 text-white placeholder-gray-500"
            />
          </Card>
        )}

        {/* Previous Entries */}
        {entries.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-light text-gradient-sage">Previous Sessions</h2>
            {entries.map((entry, index) => (
              <Card key={index} className="apple-card p-6 group">
                <div className="flex justify-between items-start">
                  <p className="text-gray-300 flex-1 line-clamp-3">{entry}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEntry(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vault;
