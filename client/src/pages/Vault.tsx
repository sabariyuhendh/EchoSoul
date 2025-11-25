import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Clock, Save, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface VaultEntry {
  id: string;
  content: string;
  duration: number;
  createdAt: string | Date;
}

const Vault = () => {
  const { user, isAuthenticated } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(480); // 8 minutes in seconds
  const [content, setContent] = useState('');
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch entries on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchEntries();
    }
  }, [isAuthenticated, user]);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/vault', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Error fetching vault entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const formatDateTime = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const startSession = () => {
    setIsActive(true);
    setTimeLeft(480);
    setContent('');
  };

  const saveEntry = async () => {
    if (content.trim() && isAuthenticated) {
      try {
        setIsSaving(true);
        const duration = 480 - timeLeft; // Time spent in seconds
        const response = await fetch('/api/vault', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            content: content.trim(),
            duration: duration,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setEntries([data.entry, ...entries]);
          setContent('');
          setIsActive(false);
          setTimeLeft(480);
        } else {
          console.error('Error saving vault entry');
        }
      } catch (error) {
        console.error('Error saving vault entry:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const deleteEntry = (index: number) => {
    // Note: Delete functionality would require a DELETE API endpoint
    // For now, we'll just remove from local state
    setEntries(entries.filter((_, i) => i !== index));
  };

  const progress = ((480 - timeLeft) / 480) * 100;

  return (
    <div className="min-h-screen bg-black text-white page-content p-6">
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
                className="immersive-button primary px-8 py-3"
              >
                <Clock className="w-5 h-5 mr-2" />
                Start 8-Minute Session
              </Button>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-400">Session in progress... Let it all out.</p>
                <Button 
                  onClick={saveEntry}
                  disabled={isSaving || !content.trim()}
                  className="immersive-button secondary px-6 py-2"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save & End'}
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
        {isLoading ? (
          <div className="text-center text-gray-400 py-8">Loading entries...</div>
        ) : entries.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-light text-gradient-sage">Previous Sessions</h2>
            {entries.map((entry, index) => (
              <Card key={entry.id} className="apple-card p-6 group">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-300 line-clamp-3">{entry.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDateTime(entry.createdAt)} • Duration: {Math.floor(entry.duration / 60)}m {entry.duration % 60}s
                    </p>
                  </div>
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
        ) : null}
      </div>
    </div>
  );
};

export default Vault;
