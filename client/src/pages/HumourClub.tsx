import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import { ArrowLeft, Shuffle, Sparkles, Heart, Vote, Play, Volume2, VolumeX } from 'lucide-react';

interface Meme {
  text: string;
  image: string;
  category: string;
}

interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: number[];
  isActive: boolean;
}

interface GameResult {
  score: number;
  level: number;
  gameType: string;
}

const HumourClub = () => {
  const [currentJoke, setCurrentJoke] = useState('');
  const [currentMeme, setCurrentMeme] = useState<Meme | null>(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dancingGifs, setDancingGifs] = useState<string[]>([]);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Predefined dancing GIF emojis/animations
  const danceEmojis = ['💃', '🕺', '🎭', '🎪', '🎊', '🎉', '✨', '⭐', '🌟', '💫'];
  
  // Predefined sound effects (using Web Audio API for basic sounds)
  const playSound = (type: 'pop' | 'cheer' | 'whoosh' | 'ding') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    
    try {
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        console.warn('Web Audio API not supported');
        return;
      }
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      let frequency = 440;
      let duration = 0.2;
      
      switch (type) {
        case 'pop':
          frequency = 800;
          duration = 0.1;
          break;
        case 'cheer':
          frequency = 600;
          duration = 0.3;
          break;
        case 'whoosh':
          frequency = 300;
          duration = 0.4;
          break;
        case 'ding':
          frequency = 1000;
          duration = 0.2;
          break;
      }
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  };

  // Trigger confetti animation
  const triggerConfetti = () => {
    setConfettiActive(true);
    playSound('cheer');
    setTimeout(() => setConfettiActive(false), 3000);
  };

  // Get AI joke
  const jokeeMutation = useMutation({
    mutationFn: async (category: string = 'general') => {
      return apiRequest('/api/humour/joke', {
        method: 'POST',
        body: JSON.stringify({ category }),
      });
    },
    onSuccess: (data) => {
      setCurrentJoke(data.joke);
      playSound('ding');
      triggerConfetti();
    },
    onError: () => {
      toast({
        title: "Oops!",
        description: "Couldn't fetch a joke right now. Try again!",
        variant: "destructive",
      });
    },
  });

  // Get random meme
  const { data: memeData, refetch: shuffleMeme } = useQuery({
    queryKey: ['/api/humour/meme'],
    enabled: false,
  });

  useEffect(() => {
    if ((memeData as any)?.meme) {
      setCurrentMeme((memeData as any).meme);
      playSound('pop');
    }
  }, [memeData]);

  // Get active polls
  const { data: pollsData } = useQuery({
    queryKey: ['/api/humour/polls'],
  });

  // Vote in poll
  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionIndex }: { pollId: string; optionIndex: number }) => {
      return apiRequest(`/api/humour/polls/${pollId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ optionIndex }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/humour/polls'] });
      playSound('ding');
      toast({
        title: "Vote recorded!",
        description: "Thanks for participating!",
      });
    },
  });

  // Create new poll
  const createPollMutation = useMutation({
    mutationFn: async (pollData: { question: string; options: string[] }) => {
      return apiRequest('/api/humour/polls', {
        method: 'POST',
        body: JSON.stringify({ 
          question: pollData.question, 
          options: pollData.options,
          votes: new Array(pollData.options.length).fill(0)
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/humour/polls'] });
      setPollQuestion('');
      setPollOptions(['', '']);
      toast({
        title: "Poll created!",
        description: "Your poll is now live for everyone to vote!",
      });
    },
  });

  // Simple bubble pop game
  const startBubbleGame = () => {
    setGameActive(true);
    setGameScore(0);
    playSound('whoosh');
    
    // Simple game logic - increment score on clicks
    const gameInterval = setInterval(() => {
      setGameScore(prev => prev + 1);
    }, 1000);
    
    setTimeout(() => {
      clearInterval(gameInterval);
      setGameActive(false);
      triggerConfetti();
      toast({
        title: "Game Over!",
        description: `You scored ${gameScore + 10} points! 🎉`,
      });
    }, 10000); // 10 second game
  };

  // Trigger dancing GIFs
  const triggerDanceParty = () => {
    const newGifs = Array.from({ length: 8 }, () => 
      danceEmojis[Math.floor(Math.random() * danceEmojis.length)]
    );
    setDancingGifs(newGifs);
    playSound('cheer');
    
    setTimeout(() => setDancingGifs([]), 5000);
  };

  // Add poll option
  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    }
  };

  // Remove poll option
  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white page-content relative">
      {/* Cosmic background elements - matching site style */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-amber-500 to-rose-500 rounded-full blur-3xl opacity-20 animate-breathe"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-lavender-500 to-calm-500 rounded-full blur-3xl opacity-20 animate-breathe" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-sage-500 to-amber-500 rounded-full blur-3xl opacity-10 animate-breathe" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Floating cosmic particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 20}s`
            }}
          />
        ))}
      </div>

      {/* Confetti overlay */}
      {confettiActive && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {['🎉', '🎊', '✨', '⭐', '🌟', '💫', '🎈', '🎁'][Math.floor(Math.random() * 8)]}
            </div>
          ))}
        </div>
      )}

      {/* Dancing GIFs overlay */}
      {dancingGifs.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {dancingGifs.map((gif, i) => (
            <div
              key={i}
              className="absolute animate-bounce text-6xl"
              style={{
                left: `${(i * 12) + 10}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            >
              {gif}
            </div>
          ))}
        </div>
      )}

      <div className="relative z-20 max-w-6xl mx-auto px-6 py-8 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link to="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-4">
              <span className="text-gradient-amber text-glow-amber">Humour Club</span>
            </h1>
            <p className="text-gray-400 font-light">Your joyful sanctuary for laughter and light</p>
          </div>
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="ghost"
            size="sm"
            className="apple-button text-gray-400 hover:text-white hover:bg-white/10"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Joke Bot */}
          <Card className="apple-card p-8 animate-slideUp" style={{animationDelay: '0.1s'}}>
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center animate-breathe">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-medium tracking-tight">AI Joke Bot</h3>
              </div>
              
              {currentJoke && (
                <div className="apple-card-subtle p-6 min-h-[120px] flex items-center">
                  <p className="text-lg text-center w-full italic text-white/90 font-light">"{currentJoke}"</p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => jokeeMutation.mutate('general')}
                  disabled={jokeeMutation.isPending}
                  className="flex-1 apple-button bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium border-0 amber-shadow"
                >
                  {jokeeMutation.isPending ? "Crafting..." : "Tell me a joke!"}
                </Button>
                <Button
                  onClick={() => jokeeMutation.mutate('dad')}
                  disabled={jokeeMutation.isPending}
                  variant="outline"
                  className="apple-button border-amber-400/30 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400/50"
                >
                  Dad Jokes
                </Button>
              </div>
            </div>
          </Card>

          {/* Meme Generator */}
          <Card className="apple-card p-8 animate-slideUp" style={{animationDelay: '0.2s'}}>
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl flex items-center justify-center animate-breathe" style={{animationDelay: '0.5s'}}>
                  <span className="text-white text-xl">😂</span>
                </div>
                <h3 className="text-xl font-medium tracking-tight">Meme Generator</h3>
              </div>
              
              {currentMeme && (
                <div className="apple-card-subtle p-6 text-center space-y-4">
                  <div className="text-6xl animate-float">{currentMeme.image}</div>
                  <p className="text-lg font-light text-white/90">{currentMeme.text}</p>
                  <span className="inline-block px-4 py-2 apple-card-subtle rounded-full text-sm text-rose-400">
                    #{currentMeme.category}
                  </span>
                </div>
              )}
              
              <Button
                onClick={() => shuffleMeme()}
                className="w-full apple-button bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-medium border-0 rose-shadow"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Shuffle Meme
              </Button>
            </div>
          </Card>

          {/* Mini Games */}
          <Card className="apple-card p-8 animate-slideUp" style={{animationDelay: '0.3s'}}>
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-calm-500 to-lavender-600 rounded-2xl flex items-center justify-center animate-breathe" style={{animationDelay: '1s'}}>
                  <Play className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-medium tracking-tight">Quick Games</h3>
              </div>
              
              <div className="space-y-4">
                {gameActive ? (
                  <div className="apple-card-subtle p-6 text-center">
                    <div className="text-2xl font-bold mb-3">🎯 Bubble Pop!</div>
                    <div className="text-xl mb-3 text-gradient-calm">Score: {gameScore}</div>
                    <div className="text-sm text-gray-400 mb-4">Keep clicking bubbles!</div>
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setGameScore(prev => prev + 1);
                            playSound('pop');
                          }}
                          className="w-16 h-16 bg-gradient-to-br from-calm-400 to-lavender-500 rounded-2xl shadow-lg transform hover:scale-110 transition-all animate-float apple-button"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        >
                          💫
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <Button
                      onClick={startBubbleGame}
                      className="w-full apple-button bg-gradient-to-r from-calm-500 to-lavender-600 hover:from-calm-600 hover:to-lavender-700 text-white font-medium border-0 calm-shadow"
                    >
                      🎯 Bubble Pop Game (10s)
                    </Button>
                    <Button
                      onClick={() => {
                        triggerConfetti();
                        toast({
                          title: "Memory Challenge!",
                          description: "Remember this sequence: 🌟⭐✨💫🌟",
                        });
                      }}
                      className="w-full immersive-button secondary"
                    >
                      🧠 Memory Challenge
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Dance Party */}
          <Card className="apple-card p-8 animate-slideUp" style={{animationDelay: '0.4s'}}>
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-sage-400 to-sage-600 rounded-2xl flex items-center justify-center animate-breathe" style={{animationDelay: '1.5s'}}>
                  <span className="text-white text-xl">💃</span>
                </div>
                <h3 className="text-xl font-medium tracking-tight">Dance Party</h3>
              </div>
              
              <div className="apple-card-subtle p-6 text-center">
                <p className="text-gray-400 mb-4 font-light">Need an instant mood boost?</p>
                <Button
                  onClick={triggerDanceParty}
                  className="w-full apple-button bg-gradient-to-r from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 text-white font-medium text-lg py-6 transform hover:scale-105 transition-all border-0 sage-shadow"
                >
                  🎉 START DANCE PARTY! 🎉
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Community Polls Section */}
        <div className="mt-12 animate-fadeIn" style={{animationDelay: '0.5s'}}>
          <h2 className="text-3xl font-light text-center mb-10">
            <span className="text-gradient-lavender text-glow-lavender">Community Fun Polls</span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Polls */}
            <div className="space-y-6">
              <h3 className="text-xl font-medium text-lavender-400">Vote Now!</h3>
              {(pollsData as any)?.polls?.map((poll: Poll) => (
                <Card key={poll.id} className="apple-card p-6 animate-slideUp">
                  <h4 className="font-medium mb-4 text-lg">{poll.question}</h4>
                  <div className="space-y-2">
                    {poll.options.map((option: string, index: number) => {
                      const totalVotes = poll.votes.reduce((sum, count) => sum + count, 0);
                      const percentage = totalVotes > 0 ? (poll.votes[index] / totalVotes) * 100 : 0;
                      
                      return (
                        <div key={index} className="space-y-1">
                          <Button
                            onClick={() => voteMutation.mutate({ pollId: poll.id, optionIndex: index })}
                            variant="outline"
                            className="w-full text-left justify-start border-white/20 hover:bg-white/10"
                            disabled={voteMutation.isPending}
                          >
                            <Vote className="w-4 h-4 mr-2" />
                            {option}
                          </Button>
                          <div className="flex items-center space-x-2 text-sm text-gray-300">
                            <div className="flex-1 bg-white/10 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span>{poll.votes[index]} votes ({percentage.toFixed(0)}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>

            {/* Create Poll */}
            <Card className="apple-card p-8 animate-slideUp" style={{animationDelay: '0.6s'}}>
              <h3 className="text-xl font-medium mb-6 text-lavender-400">Create a Fun Poll</h3>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="question" className="text-gray-400 mb-2">Question</Label>
                  <Input
                    id="question"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="What's the funniest animal?"
                    className="apple-input"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-gray-400">Options</Label>
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex space-x-3">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...pollOptions];
                          newOptions[index] = e.target.value;
                          setPollOptions(newOptions);
                        }}
                        placeholder={`Option ${index + 1}`}
                        className="apple-input"
                      />
                      {pollOptions.length > 2 && (
                        <Button
                          onClick={() => removePollOption(index)}
                          variant="outline"
                          size="sm"
                          className="apple-button border-rose-400/30 text-rose-400 hover:bg-rose-400/10 hover:border-rose-400/50"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={addPollOption}
                    variant="outline"
                    size="sm"
                    className="apple-button border-lavender-400/30 text-lavender-400 hover:bg-lavender-400/10 hover:border-lavender-400/50"
                    disabled={pollOptions.length >= 6}
                  >
                    + Add Option
                  </Button>
                  <Button
                    onClick={() => createPollMutation.mutate({ question: pollQuestion, options: pollOptions.filter(o => o.trim()) })}
                    disabled={!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2 || createPollMutation.isPending}
                    className="flex-1 apple-button bg-gradient-to-r from-lavender-500 to-lavender-600 hover:from-lavender-600 hover:to-lavender-700 text-white font-medium border-0 lavender-shadow"
                  >
                    {createPollMutation.isPending ? "Creating..." : "Create Poll"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HumourClub;