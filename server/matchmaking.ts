// ES-MM (EchoSoul Matchmaking) Algorithm Implementation
// Based on Reactive Bucketing + Time-Weighted Pairing

interface QueuedUser {
  userId: string;
  joinedAt: number; // timestamp
  priority: number; // calculated priority score
  bucket: number; // bucket index
}

interface MatchResult {
  user1: string;
  user2: string;
  sessionId: string;
}

class EchoSoulMatchmaker {
  // Reactive Bucketing System
  // Bucket 0: 0-1s wait
  // Bucket 1: 1-3s wait
  // Bucket 2: 3-6s wait
  // Bucket 3: 6+ sec wait
  private buckets: Map<number, QueuedUser[]> = new Map();
  private userMap: Map<string, QueuedUser> = new Map(); // Quick lookup
  private matchingWindow: number = 50; // 50ms micro matching window
  private lastMatchTime: number = 0;
  private matchInterval: NodeJS.Timeout | null = null;
  private rebalanceInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Initialize buckets
    for (let i = 0; i < 4; i++) {
      this.buckets.set(i, []);
    }

    // Start micro matching window processor
    this.startMatchingProcessor();
    
    // Start priority rebalancing
    this.startRebalancing();
  }

  /**
   * Add user to matchmaking queue
   */
  addUser(userId: string): void {
    // Remove if already in queue
    this.removeUser(userId);

    const now = Date.now();
    const user: QueuedUser = {
      userId,
      joinedAt: now,
      priority: this.calculatePriority(0, now),
      bucket: 0
    };

    this.buckets.get(0)!.push(user);
    this.userMap.set(userId, user);
    
    const status = this.getQueueStatus();
    console.log('[Matchmaking] User added to queue:', userId, 'Total in queue:', status.total);
    
    // Try to find immediate match if queue has 2+ users
    if (status.total >= 2) {
      const match = this.findMatch();
      if (match) {
        console.log('[Matchmaking] Immediate match found:', match);
        this.lastMatchTime = now;
        this.onMatchFound(match);
      }
    }
  }

  /**
   * Remove user from queue
   */
  removeUser(userId: string): boolean {
    const user = this.userMap.get(userId);
    if (!user) return false;

    const bucket = this.buckets.get(user.bucket);
    if (bucket) {
      const index = bucket.findIndex(u => u.userId === userId);
      if (index !== -1) {
        bucket.splice(index, 1);
      }
    }
    this.userMap.delete(userId);
    return true;
  }

  /**
   * Check if user is in queue
   */
  isInQueue(userId: string): boolean {
    return this.userMap.has(userId);
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { total: number; byBucket: number[] } {
    const byBucket = [0, 1, 2, 3].map(i => this.buckets.get(i)!.length);
    return {
      total: byBucket.reduce((a, b) => a + b, 0),
      byBucket
    };
  }

  /**
   * Calculate priority score using Time-Weighted Pairing
   * priority = wait_time * R (where R = randomness factor)
   */
  private calculatePriority(waitTime: number, currentTime: number): number {
    const R = 0.8 + Math.random() * 0.4; // Randomness factor between 0.8-1.2
    return waitTime * R;
  }

  /**
   * Determine which bucket a user should be in based on wait time
   */
  private getBucketForWaitTime(waitTime: number): number {
    if (waitTime < 1000) return 0; // 0-1s
    if (waitTime < 3000) return 1; // 1-3s
    if (waitTime < 6000) return 2; // 3-6s
    return 3; // 6+ sec
  }

  /**
   * Find best match using ES-MM algorithm
   * Always tries longest waiting bucket first, then picks highest priority users
   */
  private findMatch(): MatchResult | null {
    const now = Date.now();
    
    // Try buckets from longest wait (3) to shortest (0)
    for (let bucketIndex = 3; bucketIndex >= 0; bucketIndex--) {
      const bucket = this.buckets.get(bucketIndex);
      if (!bucket || bucket.length < 2) continue;

      // Update priorities for users in this bucket
      bucket.forEach(user => {
        const waitTime = now - user.joinedAt;
        user.priority = this.calculatePriority(waitTime, now);
      });

      // Sort by priority (highest first)
      bucket.sort((a, b) => b.priority - a.priority);

      // Pick top 2 users
      if (bucket.length >= 2) {
        const user1 = bucket.shift()!;
        const user2 = bucket.shift()!;

        // Remove from queue
        this.userMap.delete(user1.userId);
        this.userMap.delete(user2.userId);

        // Generate session ID
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return {
          user1: user1.userId,
          user2: user2.userId,
          sessionId
        };
      }
    }

    return null;
  }

  /**
   * Micro Matching Windows - Process matches in batches
   */
  private startMatchingProcessor(): void {
    this.matchInterval = setInterval(() => {
      const now = Date.now();
      const status = this.getQueueStatus();
      
      // Log queue status periodically
      if (status.total > 0) {
        console.log('[Matchmaking] Queue status:', status);
      }
      
      // Only process if enough time has passed (micro window)
      if (now - this.lastMatchTime < this.matchingWindow) {
        return;
      }

      const match = this.findMatch();
      if (match) {
        console.log('[Matchmaking] Found match:', match);
        this.lastMatchTime = now;
        // Emit match event (will be handled by WebSocket server)
        this.onMatchFound(match);
      }
    }, this.matchingWindow);
  }

  /**
   * Priority Rebalancing - Move users between buckets and boost priorities
   */
  private startRebalancing(): void {
    this.rebalanceInterval = setInterval(() => {
      const now = Date.now();

      // Rebalance all users
      for (let bucketIndex = 0; bucketIndex < 4; bucketIndex++) {
        const bucket = this.buckets.get(bucketIndex);
        if (!bucket) continue;

        const usersToMove: QueuedUser[] = [];

        bucket.forEach(user => {
          const waitTime = now - user.joinedAt;
          const newBucket = this.getBucketForWaitTime(waitTime);
          
          // Update priority (boost for longer waits)
          user.priority = this.calculatePriority(waitTime, now) * (1 + waitTime / 10000);

          // Move to appropriate bucket if needed
          if (newBucket !== bucketIndex) {
            usersToMove.push(user);
          }
        });

        // Move users to new buckets
        usersToMove.forEach(user => {
          const index = bucket.findIndex(u => u.userId === user.userId);
          if (index !== -1) {
            bucket.splice(index, 1);
            user.bucket = this.getBucketForWaitTime(now - user.joinedAt);
            this.buckets.get(user.bucket)!.push(user);
          }
        });
      }
    }, 2000); // Rebalance every 2 seconds
  }

  /**
   * Callback for when a match is found
   * This will be set by the WebSocket server
   */
  private onMatchFoundCallback: ((match: MatchResult) => void) | null = null;

  setOnMatchFound(callback: (match: MatchResult) => void): void {
    this.onMatchFoundCallback = callback;
  }

  private onMatchFound(match: MatchResult): void {
    console.log('[Matchmaking] Match found:', match);
    if (this.onMatchFoundCallback) {
      this.onMatchFoundCallback(match);
    }
  }

  /**
   * Cleanup - stop intervals
   */
  destroy(): void {
    if (this.matchInterval) {
      clearInterval(this.matchInterval);
    }
    if (this.rebalanceInterval) {
      clearInterval(this.rebalanceInterval);
    }
  }
}

// Singleton instance
export const matchmaker = new EchoSoulMatchmaker();

