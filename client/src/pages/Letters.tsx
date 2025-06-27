
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-light tracking-tight">
              <span className="text-gradient-rose">Letters You'll Never Send</span>
            </h1>
            <p className="text-gray-400 text-sm">Express what you can't say</p>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Letter Composer */}
        <Card className="rose-card p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">To:</label>
              <Input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="The person you want to write to..."
                className="bg-transparent border-white/20 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Your Letter:</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Dear [name], I've been wanting to tell you..."
                className="min-h-48 bg-transparent border-white/20 text-white placeholder-gray-500 resize-none"
              />
            </div>

            {/* Style Options */}
            <div>
              <label className="block text-sm font-medium mb-4 text-gray-300">Letter Style:</label>
              <div className="grid grid-cols-5 gap-3">
                {styles.map((style) => (
                  <Button
                    key={style.id}
                    variant={selectedStyle === style.id ? "default" : "outline"}
                    onClick={() => setSelectedStyle(style.id as Letter['style'])}
                    className={`text-xs py-2 ${selectedStyle === style.id ? 
                      `bg-gradient-to-r from-${style.color}-500 to-${style.color}-600` : 
                      'border-white/20 text-gray-300 hover:bg-white/10'}`}
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
                className="apple-button bg-gradient-to-r from-lavender-500 to-rose-500 text-white flex-1"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Stylize with AI
              </Button>
              <Button
                onClick={saveLetter}
                disabled={!to.trim() || !content.trim()}
                className="apple-button bg-gradient-to-r from-sage-500 to-calm-500 text-white flex-1"
              >
                <Heart className="w-4 h-4 mr-2" />
                Save Letter
              </Button>
            </div>
          </div>
        </Card>

        {/* Saved Letters */}
        {letters.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-light text-gradient-rose">Your Letters</h2>
            {letters.map((letter) => (
              <Card key={letter.id} className="apple-card p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-lg text-gradient-white">To: {letter.to}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full bg-${styles.find(s => s.id === letter.style)?.color}-500/20 text-${styles.find(s => s.id === letter.style)?.color}-300`}>
                      {styles.find(s => s.id === letter.style)?.name}
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{letter.content}</p>
                  <p className="text-xs text-gray-500">
                    {letter.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Letters;
