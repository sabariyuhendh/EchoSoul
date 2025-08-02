
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Sparkles, Heart } from 'lucide-react';
import { Link } from 'wouter';

interface Letter {
  id: string;
  to: string;
  content: string;
  style: 'romantic' | 'angry' | 'sad' | 'grateful' | 'original';
  createdAt: Date;
}

const Letters = () => {
  const [to, setTo] = useState('');
  const [content, setContent] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<Letter['style']>('original');
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isStyled, setIsStyled] = useState(false);

  const styles = [
    { id: 'original', name: 'Original', color: 'calm' },
    { id: 'romantic', name: 'Romantic', color: 'rose' },
    { id: 'angry', name: 'Raw & Honest', color: 'amber' },
    { id: 'sad', name: 'Melancholic', color: 'lavender' },
    { id: 'grateful', name: 'Grateful', color: 'sage' }
  ];

  const saveLetter = () => {
    if (to.trim() && content.trim()) {
      const newLetter: Letter = {
        id: Date.now().toString(),
        to: to.trim(),
        content: content.trim(),
        style: selectedStyle,
        createdAt: new Date()
      };
      setLetters([newLetter, ...letters]);
      setTo('');
      setContent('');
      setIsStyled(false);
    }
  };

  const stylizeContent = () => {
    // Simulate AI stylization
    setIsStyled(true);
    // In real implementation, this would call Gemini AI
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
            <h1 className="text-3xl font-light tracking-tight text-white">Letters You'll Never Send</h1>
            <p className="text-gray-400 mt-2">Write and express your deepest thoughts</p>
          </div>
          <div className="w-24"></div>
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
                    variant={selectedStyle === style.id ? "default" : "outline"}
                    onClick={() => setSelectedStyle(style.id as Letter['style'])}
                    className={`text-sm py-3 font-medium transition-all duration-200 ${selectedStyle === style.id ? 
                      'bg-white text-black hover:bg-gray-100 border-white shadow-lg' : 
                      'border-white/30 bg-black/20 text-white hover:bg-white/10 hover:border-white/50'}`}
                  >
                    {style.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <Button
                onClick={stylizeContent}
                disabled={!content.trim() || selectedStyle === 'original'}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium flex-1 py-3 px-6 border-none shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Stylize with AI
              </Button>
              <Button
                onClick={saveLetter}
                disabled={!to.trim() || !content.trim()}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium flex-1 py-3 px-6 border-none shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Heart className="w-4 h-4 mr-2" />
                Save Letter
              </Button>
            </div>
          </div>
        </div>

        {/* Saved Letters */}
        {letters.length > 0 && (
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
                  <p className="text-xs text-gray-500">
                    {letter.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Letters;
