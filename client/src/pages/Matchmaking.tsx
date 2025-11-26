import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Users, MessageCircle, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import ChatRoom from '@/components/ChatRoom';

type MatchmakingStatus = 'idle' | 'searching' | 'matched' | 'chatting';

const Matchmaking = () => {
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<MatchmakingStatus>('idle');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [queueStatus, setQueueStatus] = useState({ total: 0, byBucket: [0, 0, 0, 0], isConnected: false, userId: '' });
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Connect to WebSocket with credentials
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use window.location.host to get the actual hostname (not 0.0.0.0)
    const host = window.location.hostname === '0.0.0.0' ? 'localhost' : window.location.hostname;
    const port = window.location.port || '5000';
    const wsUrl = `${protocol}//${host}:${port}/ws`;
    console.log('[Client] Connecting to WebSocket:', wsUrl);
    const websocket = new WebSocket(wsUrl);
    
    // Note: Cookies are automatically sent with WebSocket connections in browsers

    websocket.onopen = () => {
      console.log('[Client] WebSocket connected');
      reconnectAttempts.current = 0;
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('[Client] WebSocket message received:', message);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('[Client] Error parsing WebSocket message:', error);
      }
    };

    websocket.onerror = (error) => {
      console.error('[Client] WebSocket error:', error);
      console.error('[Client] WebSocket readyState:', websocket.readyState);
    };

    websocket.onclose = (event) => {
      console.log('[Client] WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
      setWs(null);
      
      // Attempt to reconnect if not intentionally closed
      if (status === 'searching' || status === 'chatting') {
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          setTimeout(() => {
            // Reconnect logic handled by useEffect
          }, 2000 * reconnectAttempts.current);
        }
      }
    };

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [isAuthenticated, user]);

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'match_found':
        setStatus('matched');
        setSessionId(message.sessionId);
        setPartnerId(message.data.partnerId);
        setTimeout(() => {
          setStatus('chatting');
        }, 1000);
        break;

      case 'user_left':
      case 'session_ended':
        setStatus('idle');
        setSessionId(null);
        setPartnerId(null);
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const startSearching = async () => {
    console.log('[Client] Start searching. WebSocket state:', ws?.readyState);
    
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('[Client] WebSocket not ready. State:', ws?.readyState);
      alert('Not connected. Please wait a moment and try again.');
      return;
    }

    try {
      console.log('[Client] Joining matchmaking queue...');
      const response = await fetch('/api/matchmaking/join', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();
      console.log('[Client] Join queue response:', response.status, data);

      if (response.ok) {
        setStatus('searching');
        // Poll queue status
        pollQueueStatus();
      } else {
        console.error('[Client] Failed to join queue:', data);
        alert(`Failed to join queue: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[Client] Error joining queue:', error);
      alert('Failed to join queue');
    }
  };

  const stopSearching = async () => {
    try {
      await fetch('/api/matchmaking/leave', {
        method: 'POST',
        credentials: 'include',
      });
      setStatus('idle');
    } catch (error) {
      console.error('Error leaving queue:', error);
    }
  };

  const pollQueueStatus = () => {
    const interval = setInterval(async () => {
      if (status !== 'searching') {
        clearInterval(interval);
        return;
      }

      try {
        const response = await fetch('/api/matchmaking/status', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setQueueStatus(data);
        }
      } catch (error) {
        console.error('Error fetching queue status:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  const leaveChat = async () => {
    if (sessionId) {
      try {
        await fetch(`/api/chat/sessions/${sessionId}/end`, {
          method: 'POST',
          credentials: 'include',
        });
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }
    setStatus('idle');
    setSessionId(null);
    setPartnerId(null);
  };

  // If chatting, show chat room
  if (status === 'chatting' && sessionId) {
    return (
      <ChatRoom
        sessionId={sessionId}
        partnerId={partnerId}
        onLeave={leaveChat}
        ws={ws}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white page-content p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-light tracking-tight">
              <span className="text-gradient-calm">Chat with Souls</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2">Connect with someone who understands</p>
          </div>
          <Link to="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors justify-center">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Main Content */}
        {status === 'idle' && (
          <Card className="calm-card p-8 text-center">
            <Users className="w-16 h-16 text-calm-400 mx-auto mb-6" />
            <h2 className="text-2xl font-light mb-4">Ready to Connect?</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Press the button below to find someone to chat with. Your conversation will be anonymous and safe.
            </p>
            <Button
              onClick={startSearching}
              disabled={!ws || ws.readyState !== WebSocket.OPEN}
              className="immersive-button primary px-8 py-3"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Find a Chat Partner
            </Button>
            {(!ws || ws.readyState !== WebSocket.OPEN) && (
              <p className="text-sm text-gray-500 mt-4">Connecting...</p>
            )}
          </Card>
        )}

        {status === 'searching' && (
          <Card className="sage-card p-8 text-center">
            <Loader2 className="w-16 h-16 text-sage-400 mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-light mb-4">Searching for a Partner...</h2>
            <p className="text-gray-400 mb-4">
              We're finding someone perfect for you to chat with.
            </p>
            <div className="space-y-2 mb-6">
              <p className="text-sm text-gray-500">
                People in queue: {queueStatus.total}
              </p>
              <p className="text-xs text-gray-600">
                WebSocket: {ws && ws.readyState === WebSocket.OPEN ? '✅ Connected' : '❌ Disconnected'}
              </p>
              <p className="text-xs text-gray-600">
                Status: {queueStatus.isConnected ? '✅ In Queue' : '❌ Not in Queue'}
              </p>
            </div>
            <Button
              onClick={stopSearching}
              className="immersive-button secondary"
            >
              Cancel Search
            </Button>
          </Card>
        )}

        {status === 'matched' && (
          <Card className="rose-card p-8 text-center">
            <div className="text-6xl mb-6">✨</div>
            <h2 className="text-2xl font-light mb-4">Match Found!</h2>
            <p className="text-gray-400">
              Connecting you to your chat partner...
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Matchmaking;

