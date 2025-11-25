
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, TrendingUp, Calendar } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

interface MoodEntry {
  id: string;
  mood: number;
  note: string | null;
  createdAt: string | Date;
}

const Mood = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [entries, setEntries] = useState<MoodEntry[]>([]);
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
      const response = await fetch('/api/mood', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Error fetching mood entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const moods = [
    { value: 1, emoji: '😢', label: 'Very Sad', color: 'rose' },
    { value: 2, emoji: '😔', label: 'Sad', color: 'rose' },
    { value: 3, emoji: '😐', label: 'Neutral', color: 'gray' },
    { value: 4, emoji: '🙂', label: 'Good', color: 'sage' },
    { value: 5, emoji: '😊', label: 'Very Good', color: 'sage' }
  ];

  const saveMoodEntry = async () => {
    if (selectedMood !== null && isAuthenticated) {
      try {
        setIsSaving(true);
        const response = await fetch('/api/mood', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            mood: selectedMood,
            note: note.trim() || null,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setEntries([data.entry, ...entries]);
          setSelectedMood(null);
          setNote('');
        } else {
          console.error('Error saving mood entry');
        }
      } catch (error) {
        console.error('Error saving mood entry:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const getAverageMood = () => {
    if (entries.length === 0) return 0;
    return entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length;
  };

  const getWeeklyEntries = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return entries.filter(entry => new Date(entry.createdAt) >= oneWeekAgo);
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

  return (
    <div className="min-h-screen bg-black text-white page-content p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <Link to="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-light tracking-tight">
              <span className="text-gradient-sage">Mood Tracking</span>
            </h1>
            <p className="text-gray-400 text-sm">Track your emotional journey</p>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Mood Stats */}
        {entries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="sage-card p-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-sage-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gradient-sage">Average Mood</h3>
                <p className="text-2xl font-light text-white">{getAverageMood().toFixed(1)}/5</p>
              </div>
            </Card>
            <Card className="calm-card p-6">
              <div className="text-center">
                <Calendar className="w-8 h-8 text-calm-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gradient-calm">This Week</h3>
                <p className="text-2xl font-light text-white">{getWeeklyEntries().length} entries</p>
              </div>
            </Card>
            <Card className="lavender-card p-6">
              <div className="text-center">
                <div className="text-3xl mb-3">
                  {entries.length > 0 ? moods.find(m => m.value === entries[0].mood)?.emoji : '😐'}
                </div>
                <h3 className="text-lg font-medium text-gradient-lavender">Latest Mood</h3>
                <p className="text-sm text-gray-400">
                  {entries.length > 0 ? formatDateTime(entries[0].createdAt) : 'No entries yet'}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Mood Logger */}
        <Card className="apple-card p-8 mb-8">
          <div className="space-y-6">
            <h2 className="text-xl font-light text-center text-gradient-white">How are you feeling today?</h2>
            
            {/* Mood Selection */}
            <div className="flex justify-center space-x-4">
              {moods.map((mood) => (
                <Button
                  key={mood.value}
                  variant={selectedMood === mood.value ? "default" : "outline"}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex flex-col items-center p-4 h-auto space-y-2 ${
                    selectedMood === mood.value 
                      ? `bg-gradient-to-b from-${mood.color}-500 to-${mood.color}-600 text-white` 
                      : 'border-white/20 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-xs">{mood.label}</span>
                </Button>
              ))}
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                What's on your mind? (optional)
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describe your feelings, what happened today, or anything else..."
                className="bg-transparent border-white/20 text-white placeholder-gray-500 resize-none"
                rows={3}
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={saveMoodEntry}
              disabled={selectedMood === null || isSaving}
              className="w-full immersive-button primary"
            >
              {isSaving ? 'Saving...' : 'Save Mood Entry'}
            </Button>
          </div>
        </Card>

        {/* Mood History */}
        {isLoading ? (
          <div className="text-center text-gray-400 py-8">Loading mood entries...</div>
        ) : entries.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-light text-gradient-sage">Mood History</h2>
            {entries.map((entry) => (
              <Card key={entry.id} className="apple-card p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">
                    {moods.find(m => m.value === entry.mood)?.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-white">
                        {moods.find(m => m.value === entry.mood)?.label}
                      </h3>
                      <span className="text-sm text-gray-400">
                        {formatDateTime(entry.createdAt)}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-gray-300 text-sm">{entry.note}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Mood;
