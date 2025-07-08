import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, ChevronLeft, ChevronRight, Save, Lightbulb, Target, Heart, Users, Sparkles, BookOpen } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

const REFLECTION_QUESTIONS = [
  // Self-Awareness (6 questions)
  { category: "Self-Awareness", icon: Brain, question: "What are three core values that guide your decisions, and how do you see them reflected in your daily life?" },
  { category: "Self-Awareness", icon: Brain, question: "Describe a moment when you felt most authentic to yourself. What were you doing, and what made it feel so genuine?" },
  { category: "Self-Awareness", icon: Brain, question: "What patterns do you notice in your emotional responses? When do you feel most at peace versus most stressed?" },
  { category: "Self-Awareness", icon: Brain, question: "If you could have a conversation with your younger self, what would you want them to know about who you've become?" },
  { category: "Self-Awareness", icon: Brain, question: "What aspects of your personality do you cherish most, and which ones would you like to understand better?" },
  { category: "Self-Awareness", icon: Brain, question: "How do you typically handle uncertainty, and what does this tell you about your relationship with control?" },
  
  // Relationships (6 questions)
  { category: "Relationships", icon: Heart, question: "What qualities do you value most in your closest relationships, and how do you cultivate these in others?" },
  { category: "Relationships", icon: Heart, question: "Think of someone who has deeply impacted your life. What did they teach you about love, friendship, or human connection?" },
  { category: "Relationships", icon: Heart, question: "How do you show care and affection? What makes you feel most loved and appreciated by others?" },
  { category: "Relationships", icon: Heart, question: "What boundaries are important to you in relationships, and how do you communicate them with kindness?" },
  { category: "Relationships", icon: Heart, question: "Describe a time when you had to forgive someone or ask for forgiveness. What did you learn from that experience?" },
  { category: "Relationships", icon: Heart, question: "How do you balance being supportive to others while maintaining your own emotional well-being?" },
  
  // Growth & Purpose (6 questions)
  { category: "Growth & Purpose", icon: Target, question: "What does personal growth mean to you, and how do you know when you're evolving in a positive direction?" },
  { category: "Growth & Purpose", icon: Target, question: "What activities or experiences make you feel most alive and purposeful?" },
  { category: "Growth & Purpose", icon: Target, question: "If you could contribute one meaningful thing to the world, what would it be and why?" },
  { category: "Growth & Purpose", icon: Target, question: "What challenges have shaped you the most, and how have they contributed to your strength and wisdom?" },
  { category: "Growth & Purpose", icon: Target, question: "What legacy do you want to leave, and what small steps can you take toward that vision?" },
  { category: "Growth & Purpose", icon: Target, question: "How do you define success for yourself, independent of external expectations?" },
  
  // Joy & Gratitude (6 questions)
  { category: "Joy & Gratitude", icon: Sparkles, question: "What simple pleasures bring you the most joy, and how can you make more space for them in your life?" },
  { category: "Joy & Gratitude", icon: Sparkles, question: "Describe a recent moment of pure happiness. What were the circumstances, and what made it special?" },
  { category: "Joy & Gratitude", icon: Sparkles, question: "What are you most grateful for right now, and how has this gratitude influenced your perspective?" },
  { category: "Joy & Gratitude", icon: Sparkles, question: "When do you feel most creative and inspired? How can you nurture these moments?" },
  { category: "Joy & Gratitude", icon: Sparkles, question: "What traditions, rituals, or practices bring you comfort and connection to something larger than yourself?" },
  { category: "Joy & Gratitude", icon: Sparkles, question: "How do you celebrate your wins, both big and small? What makes a celebration meaningful to you?" },
  
  // Challenges & Resilience (6 questions)
  { category: "Challenges & Resilience", icon: Users, question: "What coping strategies have served you well during difficult times, and which ones would you like to develop further?" },
  { category: "Challenges & Resilience", icon: Users, question: "Describe a time when you overcame something you initially thought was impossible. What did you discover about yourself?" },
  { category: "Challenges & Resilience", icon: Users, question: "How do you typically respond to failure or setbacks? What would you tell a friend going through the same situation?" },
  { category: "Challenges & Resilience", icon: Users, question: "What fears hold you back most, and what small step could you take to face one of them?" },
  { category: "Challenges & Resilience", icon: Users, question: "How do you maintain hope and perspective during challenging periods in your life?" },
  { category: "Challenges & Resilience", icon: Users, question: "What would you do if you knew you couldn't fail? What does this reveal about your deepest aspirations?" },
  
  // Dreams & Future (5 questions)
  { category: "Dreams & Future", icon: BookOpen, question: "What dreams have you carried with you since childhood, and how have they evolved over time?" },
  { category: "Dreams & Future", icon: BookOpen, question: "If you could design your ideal day five years from now, what would it look like?" },
  { category: "Dreams & Future", icon: BookOpen, question: "What aspects of your future self are you most excited to discover and develop?" },
  { category: "Dreams & Future", icon: BookOpen, question: "How do you balance planning for the future with staying present in the moment?" },
  { category: "Dreams & Future", icon: BookOpen, question: "What wisdom would you want to pass on to future generations about living a meaningful life?" }
];

const ReflectionRoom = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [mounted, setMounted] = useState(false);

  const currentQuestion = REFLECTION_QUESTIONS[currentIndex];
  const IconComponent = currentQuestion.icon;
  const progress = ((currentIndex + 1) / REFLECTION_QUESTIONS.length) * 100;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentAnswer(answers[currentIndex] || '');
  }, [currentIndex, answers]);

  const { data: existingReflections = [] } = useQuery({
    queryKey: ['/api/reflections'],
    enabled: mounted,
  });

  const saveReflectionMutation = useMutation({
    mutationFn: async (reflectionData: {
      questionIndex: number;
      question: string;
      answer: string;
      category: string;
    }) => {
      const response = await fetch('/api/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reflectionData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save reflection');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reflection saved",
        description: "Your thoughts have been safely stored.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reflections'] });
    },
    onError: () => {
      toast({
        title: "Error saving reflection",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (currentAnswer.trim()) {
      setAnswers(prev => ({ ...prev, [currentIndex]: currentAnswer }));
      
      saveReflectionMutation.mutate({
        questionIndex: currentIndex,
        question: currentQuestion.question,
        answer: currentAnswer,
        category: currentQuestion.category,
      });
    }
  };

  const handleNext = () => {
    if (currentAnswer.trim()) {
      handleSave();
    }
    if (currentIndex < REFLECTION_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Self-Awareness': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Relationships': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'Growth & Purpose': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Joy & Gratitude': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Challenges & Resilience': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Dreams & Future': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCompletedCount = () => {
    return Object.keys(answers).length;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 page-content">
      <div className="relative min-h-screen">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_70%)]" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
              }}
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full blur-sm" />
            </div>
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30">
                <Brain className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold text-white">
                Reflection Room
              </h1>
            </div>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Journey through deep questions designed to unlock insights about yourself, your relationships, and your path forward.
            </p>
          </div>

          {/* Progress section */}
          <div className="mb-8">
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge className={getCategoryColor(currentQuestion.category)}>
                      {currentQuestion.category}
                    </Badge>
                    <span className="text-gray-400">
                      Question {currentIndex + 1} of {REFLECTION_QUESTIONS.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Lightbulb className="w-4 h-4" />
                    <span>{getCompletedCount()} completed</span>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Question section */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <IconComponent className="w-6 h-6 text-blue-400" />
                  <span className="text-gray-200">Deep Reflection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  {currentQuestion.question}
                </p>
                
                <Textarea
                  placeholder="Take your time to reflect deeply... there's no rush, no judgment, just space for your authentic thoughts."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="min-h-[200px] bg-gray-900/50 border-gray-600/50 text-gray-200 placeholder-gray-500 resize-none"
                />
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 bg-gray-800/50 border-gray-700/50 text-gray-200 hover:bg-gray-700/50"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={!currentAnswer.trim() || saveReflectionMutation.isPending}
                  className="flex items-center gap-2 bg-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-600/30"
                >
                  <Save className="w-4 h-4" />
                  {saveReflectionMutation.isPending ? 'Saving...' : 'Save'}
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={currentIndex === REFLECTION_QUESTIONS.length - 1}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Completion message */}
          {getCompletedCount() === REFLECTION_QUESTIONS.length && (
            <Card className="mt-8 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border-emerald-500/30">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 bg-emerald-500/20 rounded-full">
                    <Sparkles className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Journey Complete!
                  </h3>
                </div>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  You've completed all reflection questions. Your insights have been safely stored and are part of your personal growth journey. Take time to revisit these reflections as you continue to evolve.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReflectionRoom;