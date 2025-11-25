
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Heart } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

interface Letter {
  id: string;
  to: string;
  content: string;
  style: 'romantic' | 'angry' | 'sad' | 'grateful' | 'original';
  createdAt: string | Date;
}

const Letters = () => {
  const { user, isAuthenticated } = useAuth();
  const [to, setTo] = useState('');
  const [content, setContent] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<Letter['style']>('original');
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch letters on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchLetters();
    }
  }, [isAuthenticated, user]);

  const fetchLetters = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/letters', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setLetters(data.letters || []);
      }
    } catch (error) {
      console.error('Error fetching letters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = [
    { id: 'original', name: 'Original', color: 'calm' },
    { id: 'romantic', name: 'Romantic', color: 'rose' },
    { id: 'angry', name: 'Raw & Honest', color: 'amber' },
    { id: 'sad', name: 'Melancholic', color: 'lavender' },
    { id: 'grateful', name: 'Grateful', color: 'sage' }
  ];

  const saveLetter = async () => {
    if (to.trim() && content.trim() && isAuthenticated) {
      try {
        setIsSaving(true);
        const response = await fetch('/api/letters', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            to: to.trim(),
            content: content.trim(),
            style: selectedStyle,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setLetters([data.letter, ...letters]);
          setTo('');
          setContent('');
        } else {
          console.error('Error saving letter');
        }
      } catch (error) {
        console.error('Error saving letter:', error);
      } finally {
        setIsSaving(false);
      }
    }
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
        <div className="mb-8 pt-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-light tracking-tight">
              <span className="text-gradient-rose">Letters Live</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2">Write and express your deepest thoughts</p>
          </div>
          <Link to="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors justify-center">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Letter Composer */}
        <div className="bg-black/50 border border-white/10 rounded-2xl p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">To:</label>
              <Input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="The person you want to write to..."
                className="bg-black/30 border-white/20 text-white placeholder-gray-400 focus:border-white/40 focus:ring-1 focus:ring-white/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Your Letter:</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Dear [name], I've been wanting to tell you..."
                className="min-h-48 bg-black/30 border-white/20 text-white placeholder-gray-400 resize-none focus:border-white/40 focus:ring-1 focus:ring-white/20"
              />
            </div>

            {/* Style Options */}
            <div>
              <label className="block text-sm font-medium mb-4 text-white">Letter Style:</label>
              <div className="grid grid-cols-5 gap-3">
                {styles.map((style) => (
                  <Button
                    key={style.id}
                    variant="outline"
                    onClick={() => setSelectedStyle(style.id as Letter['style'])}
                    className={`text-sm py-3 font-medium transition-all duration-200 ${
                      selectedStyle === style.id 
                        ? 'bg-white !text-black hover:bg-gray-200 border-white font-semibold' 
                        : 'border-white/50 bg-black/30 text-white hover:bg-white/20 hover:border-white/70'
                    }`}
                  >
                    {style.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center">
              <Button
                onClick={saveLetter}
                disabled={!to.trim() || !content.trim() || isSaving}
                className="immersive-button primary w-full max-w-md py-3 px-6"
              >
                <Heart className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Letter'}
              </Button>
            </div>
          </div>
        </div>

        {/* Saved Letters */}
        {isLoading ? (
          <div className="text-center text-gray-400 py-8">Loading letters...</div>
        ) : letters.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-light text-white">Your Letters</h2>
            {letters.map((letter) => (
              <div key={letter.id} className="bg-black/50 border border-white/10 rounded-2xl p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-lg text-white">To: {letter.to}</h3>
                    <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300 border border-white/20">
                      {styles.find(s => s.id === letter.style)?.name}
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{letter.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDateTime(letter.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Letters;
