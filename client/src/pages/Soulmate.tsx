
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Heart, Bot } from 'lucide-react';
import { Link } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const Soulmate = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hey there 💕 I'm Lyra, and I'm here for you. How are you feeling today? I'm here to listen without any judgment.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentMood, setCurrentMood] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: async ({ message, conversationHistory, mood }: { 
      message: string; 
      conversationHistory: Message[]; 
      mood?: string;
    }) => {
      return apiRequest('/api/lyra/chat', {
        method: 'POST',
        body: JSON.stringify({ 
          message, 
          conversationHistory: conversationHistory.slice(-10), // Keep last 10 messages for context
          currentMood: mood 
        }),
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Only scroll to bottom when new messages are added, not on initial load
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatMutation.mutateAsync({
        message: currentInput,
        conversationHistory: messages,
        mood: currentMood
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback response on error
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now, but I'm still here for you. Can you tell me more about how you're feeling?",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen bg-black text-white page-content flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pt-8 border-b border-white/10">
          <Link to="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-light tracking-tight">
              <span className="text-gradient-rose">Lyra</span>
            </h1>
            <p className="text-gray-400 text-sm">Your emotional support companion</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">Online</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 chat-messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!message.isUser && (
                  <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                )}
                {message.isUser && (
                  <div className="w-8 h-8 bg-gradient-to-br from-calm-500 to-sage-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-gradient-to-r from-calm-500 to-sage-500 text-white'
                      : 'bg-white/10 text-white backdrop-blur-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.isUser ? 'text-white/70' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-end space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Mood Selection */}
        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-sm text-gray-400 mb-3">How are you feeling right now?</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { mood: 'happy', emoji: '😊', color: 'from-green-400 to-emerald-400' },
              { mood: 'sad', emoji: '😢', color: 'from-blue-400 to-cyan-400' },
              { mood: 'anxious', emoji: '😰', color: 'from-yellow-400 to-amber-400' },
              { mood: 'angry', emoji: '😠', color: 'from-red-400 to-orange-400' },
              { mood: 'confused', emoji: '😕', color: 'from-purple-400 to-violet-400' },
              { mood: 'excited', emoji: '🤩', color: 'from-pink-400 to-rose-400' },
              { mood: 'calm', emoji: '😌', color: 'from-indigo-400 to-blue-400' },
              { mood: 'overwhelmed', emoji: '😵', color: 'from-gray-400 to-slate-400' }
            ].map(({ mood, emoji, color }) => (
              <Button
                key={mood}
                variant={currentMood === mood ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentMood(mood)}
                className={`text-xs ${currentMood === mood 
                  ? `bg-gradient-to-r ${color} text-white border-0` 
                  : 'border-white/20 text-gray-300 hover:text-white'
                }`}
              >
                {emoji} {mood}
              </Button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-white/10">
          <div className="flex space-x-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your heart..."
              className="flex-1 bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm"
              disabled={isTyping || chatMutation.isPending}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping || chatMutation.isPending}
              className="immersive-button primary px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {currentMood ? `Feeling ${currentMood} - ` : ''}Your AI companion is here to listen and support you 💕
          </p>
        </div>
      </div>
    </div>
  );
};

export default Soulmate;
