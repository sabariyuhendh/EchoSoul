// WebSocket server for real-time chat matchmaking
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { matchmaker, type MatchResult } from './matchmaking';
import { storage } from './storage';
import { nanoid } from 'nanoid';
import { getSessionStore } from './auth-new';
import session from 'express-session';

interface ChatClient {
  ws: WebSocket;
  userId: string;
  sessionId: string | null;
  partnerId: string | null;
}

interface ChatMessage {
  type: 'message' | 'typing' | 'stop_typing' | 'user_joined' | 'user_left' | 'match_found' | 'session_ended';
  sessionId?: string;
  senderId?: string;
  content?: string;
  timestamp?: number;
  data?: any;
}

class ChatWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, ChatClient> = new Map(); // userId -> client
  private sessions: Map<string, Set<string>> = new Map(); // sessionId -> Set of userIds
  private typingUsers: Map<string, Set<string>> = new Map(); // sessionId -> Set of typing userIds

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });

    this.setupWebSocket();
    this.setupMatchmaker();
  }

  private setupWebSocket(): void {
    this.wss.on('connection', async (ws: WebSocket, req) => {
      console.log('[WebSocket] New connection attempt');
      
      // Extract session cookie and authenticate
      const cookies = req.headers.cookie || '';
      console.log('[WebSocket] Cookies:', cookies ? 'Present' : 'Missing');
      
      const sessionId = this.extractSessionId(cookies);
      console.log('[WebSocket] Extracted session ID:', sessionId ? 'Found' : 'Not found');
      
      if (!sessionId) {
        console.log('[WebSocket] No session ID, closing connection');
        ws.close(1008, 'Authentication required');
        return;
      }

      // Get user from session
      const userId = await this.getUserIdFromSession(sessionId);
      console.log('[WebSocket] User ID from session:', userId || 'Not found');
      
      if (!userId) {
        console.log('[WebSocket] Invalid session, closing connection');
        ws.close(1008, 'Invalid session');
        return;
      }

      const client: ChatClient = {
        ws,
        userId,
        sessionId: null,
        partnerId: null
      };

      this.clients.set(userId, client);
      console.log('[WebSocket] Client connected:', userId, 'Total clients:', this.clients.size);

      ws.on('message', (data: Buffer) => {
        try {
          const message: ChatMessage = JSON.parse(data.toString());
          this.handleMessage(client, message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(client);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnect(client);
      });

      // Send connection confirmation
      this.sendToClient(client, {
        type: 'user_joined',
        data: { userId, connected: true }
      });
    });
  }

  private setupMatchmaker(): void {
    matchmaker.setOnMatchFound((match: MatchResult) => {
      this.handleMatch(match);
    });
  }

  private handleMessage(client: ChatClient, message: ChatMessage): void {
    switch (message.type) {
      case 'message':
        if (client.sessionId && message.content) {
          this.handleChatMessage(client, message);
        }
        break;

      case 'typing':
        if (client.sessionId) {
          this.handleTyping(client, true);
        }
        break;

      case 'stop_typing':
        if (client.sessionId) {
          this.handleTyping(client, false);
        }
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private handleChatMessage(client: ChatClient, message: ChatMessage): void {
    if (!client.sessionId || !client.partnerId) return;

    const chatMessage = {
      id: nanoid(),
      sessionId: client.sessionId,
      senderId: client.userId,
      content: message.content!,
      timestamp: Date.now()
    };

    // Save to database
    storage.createChatMessage({
      sessionId: client.sessionId,
      senderId: client.userId,
      content: message.content!
    }).catch(err => console.error('Error saving message:', err));

    // Send to partner
    const partner = this.clients.get(client.partnerId);
    if (partner && partner.ws.readyState === WebSocket.OPEN) {
      this.sendToClient(partner, {
        type: 'message',
        sessionId: client.sessionId,
        senderId: client.userId,
        content: message.content,
        timestamp: chatMessage.timestamp
      });
    }

    // Echo back to sender (confirmation)
    this.sendToClient(client, {
      type: 'message',
      sessionId: client.sessionId,
      senderId: client.userId,
      content: message.content,
      timestamp: chatMessage.timestamp
    });
  }

  private handleTyping(client: ChatClient, isTyping: boolean): void {
    if (!client.sessionId || !client.partnerId) return;

    const session = this.typingUsers.get(client.sessionId) || new Set();
    
    if (isTyping) {
      session.add(client.userId);
    } else {
      session.delete(client.userId);
    }
    
    this.typingUsers.set(client.sessionId, session);

    // Notify partner
    const partner = this.clients.get(client.partnerId);
    if (partner && partner.ws.readyState === WebSocket.OPEN) {
      this.sendToClient(partner, {
        type: isTyping ? 'typing' : 'stop_typing',
        sessionId: client.sessionId,
        senderId: client.userId
      });
    }
  }

  private handleMatch(match: MatchResult): void {
    const client1 = this.clients.get(match.user1);
    const client2 = this.clients.get(match.user2);

    if (!client1 || !client2) {
      // One or both users disconnected, remove from queue
      if (client1) matchmaker.removeUser(match.user1);
      if (client2) matchmaker.removeUser(match.user2);
      return;
    }

    // Create chat session in database
    storage.createChatSession({
      userId1: match.user1,
      userId2: match.user2,
      status: 'active'
    }).then(session => {
      // Set up session for both clients
      client1.sessionId = session.id;
      client1.partnerId = match.user2;
      client2.sessionId = session.id;
      client2.partnerId = match.user1;

      // Add to sessions map
      this.sessions.set(session.id, new Set([match.user1, match.user2]));

      // Notify both users
      this.sendToClient(client1, {
        type: 'match_found',
        sessionId: session.id,
        data: {
          partnerId: match.user2,
          sessionId: session.id
        }
      });

      this.sendToClient(client2, {
        type: 'match_found',
        sessionId: session.id,
        data: {
          partnerId: match.user1,
          sessionId: session.id
        }
      });
    }).catch(err => {
      console.error('Error creating chat session:', err);
      // Remove from queue on error
      matchmaker.removeUser(match.user1);
      matchmaker.removeUser(match.user2);
    });
  }

  private handleDisconnect(client: ChatClient): void {
    // Remove from matchmaking queue
    matchmaker.removeUser(client.userId);

    // If in a session, notify partner and end session
    if (client.sessionId && client.partnerId) {
      const partner = this.clients.get(client.partnerId);
      if (partner) {
        this.sendToClient(partner, {
          type: 'user_left',
          sessionId: client.sessionId
        });
        
        // End session
        this.endSession(client.sessionId);
      }
    }

    // Clean up
    this.clients.delete(client.userId);
  }

  private endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Update session status in database
    storage.endChatSession(sessionId).catch(err => 
      console.error('Error ending session:', err)
    );

    // Clean up clients
    session.forEach(userId => {
      const client = this.clients.get(userId);
      if (client) {
        client.sessionId = null;
        client.partnerId = null;
      }
    });

    this.sessions.delete(sessionId);
    this.typingUsers.delete(sessionId);
  }

  public joinQueue(userId: string): boolean {
    const client = this.clients.get(userId);
    if (!client) {
      console.log('[Matchmaking] User not connected via WebSocket:', userId);
      return false; // User not connected via WebSocket
    }

    console.log('[Matchmaking] Adding user to queue:', userId);
    matchmaker.addUser(userId);
    const status = matchmaker.getQueueStatus();
    console.log('[Matchmaking] Queue status after join:', status);
    return true;
  }

  public leaveQueue(userId: string): boolean {
    matchmaker.removeUser(userId);
    return true;
  }

  public endSessionForUser(userId: string): void {
    const client = this.clients.get(userId);
    if (client && client.sessionId) {
      this.endSession(client.sessionId);
      
      // Notify partner
      if (client.partnerId) {
        const partner = this.clients.get(client.partnerId);
        if (partner) {
          this.sendToClient(partner, {
            type: 'session_ended',
            sessionId: client.sessionId
          });
        }
      }
    }
  }

  private sendToClient(client: ChatClient, message: ChatMessage): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  private extractSessionId(cookies: string): string | null {
    if (!cookies) {
      console.log('[WebSocket] No cookies found');
      return null;
    }
    
    // Try both cookie name formats
    let match = cookies.match(/echosoul\.sid=([^;]+)/);
    if (!match) {
      match = cookies.match(/connect\.sid=([^;]+)/);
    }
    
    if (match) {
      const sessionId = decodeURIComponent(match[1]);
      console.log('[WebSocket] Extracted session ID:', sessionId.substring(0, 20) + '...');
      return sessionId;
    }
    
    console.log('[WebSocket] No session cookie found. Available cookies:', cookies.split(';').map(c => c.trim().split('=')[0]));
    return null;
  }

  private async getUserIdFromSession(sessionId: string): Promise<string | null> {
    try {
      const sessionStore = getSessionStore();
      if (!sessionStore) {
        console.warn('[WebSocket] Session store not available');
        return null;
      }

      return new Promise((resolve) => {
        // Express-session signs the session ID, but the store uses the unsigned version
        // The signed format is: s:<unsigned_id>.<signature>
        // We need to extract the unsigned part
        let unsignedId = sessionId;
        
        // Remove 's:' prefix if present
        if (unsignedId.startsWith('s:')) {
          unsignedId = unsignedId.substring(2);
        }
        
        // Remove signature (everything after the last dot)
        const parts = unsignedId.split('.');
        unsignedId = parts[0];
        
        console.log('[WebSocket] Looking up session with ID:', unsignedId.substring(0, 20) + '...');
        
        sessionStore.get(unsignedId, (err: any, sessionData: any) => {
          if (err) {
            console.error('[WebSocket] Session store error:', err);
            resolve(null);
            return;
          }
          
          if (!sessionData) {
            console.log('[WebSocket] No session found in store');
            resolve(null);
            return;
          }
          
          // Parse the session data (it's stored as JSON in the sess column)
          let session: any;
          try {
            session = typeof sessionData === 'string' ? JSON.parse(sessionData) : sessionData;
            // If it's a sess object from connect-pg-simple, extract the actual session
            if (session.sess) {
              session = typeof session.sess === 'string' ? JSON.parse(session.sess) : session.sess;
            }
          } catch (parseError) {
            console.error('[WebSocket] Error parsing session data:', parseError);
            resolve(null);
            return;
          }
          
          if (!session || !session.user) {
            console.log('[WebSocket] Session found but no user in session data');
            console.log('[WebSocket] Session keys:', Object.keys(session || {}));
            resolve(null);
            return;
          }
          
          console.log('[WebSocket] Found user in session:', session.user.id);
          resolve(session.user.id);
        });
      });
    } catch (error) {
      console.error('[WebSocket] Error getting user from session:', error);
      return null;
    }
  }

  public getQueueStatus() {
    return matchmaker.getQueueStatus();
  }

  public isUserConnected(userId: string): boolean {
    return this.clients.has(userId);
  }
}

let chatServer: ChatWebSocketServer | null = null;

export function setupWebSocket(server: Server): ChatWebSocketServer {
  if (!chatServer) {
    chatServer = new ChatWebSocketServer(server);
  }
  return chatServer;
}

export function getChatServer(): ChatWebSocketServer | null {
  return chatServer;
}

