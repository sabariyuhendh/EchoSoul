import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Send, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  isOwn: boolean;
}

interface ChatRoomProps {
  sessionId: string;
  partnerId: string | null;
  onLeave: () => void;
  ws: WebSocket | null;
}

const ChatRoom = ({ sessionId, partnerId, onLeave, ws }: ChatRoomProps) => {
  const { user } = useAuth();
  const currentUserId = user?.id || '';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load chat history
    loadChatHistory();

    // Set up WebSocket message handler
    if (ws) {
      const handleMessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.addEventListener('message', handleMessage);
      return () => {
        ws.removeEventListener('message', handleMessage);
      };
    }
  }, [ws, sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const formattedMessages: ChatMessage[] = data.messages.map((msg: any) => ({
          id: msg.id,
          senderId: msg.senderId,
          content: msg.content,
          timestamp: new Date(msg.createdAt).getTime(),
          isOwn: msg.senderId === currentUserId,
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'message':
        setMessages(prev => [...prev, {
          id: `msg_${Date.now()}_${Math.random()}`,
          senderId: message.senderId,
          content: message.content || '',
          timestamp: message.timestamp || Date.now(),
          isOwn: message.senderId === currentUserId,
        }]);
        break;

      case 'typing':
        setPartnerTyping(true);
        break;

      case 'stop_typing':
        setPartnerTyping(false);
        break;

      case 'user_left':
      case 'session_ended':
        onLeave();
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

    const message = {
      type: 'message',
      sessionId,
      content: input.trim(),
    };

    ws.send(JSON.stringify(message));
    setInput('');
    stopTyping();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Send typing indicator
    if (!isTyping && ws && ws.readyState === WebSocket.OPEN) {
      setIsTyping(true);
      ws.send(JSON.stringify({ type: 'typing', sessionId }));
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const stopTyping = () => {
    if (isTyping && ws && ws.readyState === WebSocket.OPEN) {
      setIsTyping(false);
      ws.send(JSON.stringify({ type: 'stop_typing', sessionId }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-black text-white page-content flex flex-col py-6">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col px-4">
        {/* Chat Container with Border */}
        <div className="flex-1 flex flex-col border border-white/20 rounded-2xl overflow-hidden bg-black/40 backdrop-blur-sm">
          {/* Header */}
          <div className="border-b border-white/10 p-4 bg-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLeave}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Leave
                </Button>
                <div>
                  <h2 className="text-lg font-medium">Anonymous Chat</h2>
                  <p className="text-sm text-gray-400">
                    {partnerTyping ? 'Partner is typing...' : 'Connected'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLeave}
                className="text-red-400 hover:text-red-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                End Chat
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-lg mb-2">Start the conversation</p>
                  <p className="text-sm">Say hello to your chat partner!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <Card
                      className={`max-w-xs lg:max-w-md p-4 ${
                        message.isOwn
                          ? 'bg-calm-500/20 border-calm-500/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <p className="text-white text-sm leading-relaxed">{message.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatTime(message.timestamp)}
                      </p>
                    </Card>
                  </div>
                ))
              )}
              {partnerTyping && (
                <div className="flex justify-start">
                  <Card className="bg-white/5 border-white/10 p-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 p-4 bg-black/20">
            <div className="flex space-x-3">
              <Textarea
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-black/30 border border-white/20 text-white placeholder-gray-400 resize-none min-h-[60px] max-h-[120px] rounded-lg"
                rows={2}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || !ws || ws.readyState !== WebSocket.OPEN}
                className="immersive-button primary self-end rounded-lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;

