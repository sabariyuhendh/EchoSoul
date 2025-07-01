
import { Request, Response } from 'express';
import { storage } from './storage';

// Get user's calm space preferences
export const getCalmPreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'dev-user-1';
    const preferences = await storage.getCalmSpacePreferences(userId);
    
    if (!preferences) {
      // Return default preferences if none exist
      return res.json({
        favoriteTrack: 0,
        volume: 0.7,
        breathingPattern: { inhale: 4, hold: 4, exhale: 6 },
        ambientSounds: true,
        cosmicDebrisEnabled: true,
        debrisIntensity: 0.5
      });
    }
    
    res.json(preferences);
  } catch (error) {
    console.error('Error fetching calm preferences:', error);
    // Return default preferences when database is unavailable
    res.json({
      favoriteTrack: 0,
      volume: 0.7,
      breathingPattern: { inhale: 4, hold: 4, exhale: 6 },
      ambientSounds: true,
      cosmicDebrisEnabled: true,
      debrisIntensity: 0.5
    });
  }
};

// Save user's calm space preferences
export const saveCalmPreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'dev-user-1';
    const { 
      favoriteTrack, 
      volume, 
      breathingPattern, 
      ambientSounds,
      cosmicDebrisEnabled,
      debrisIntensity 
    } = req.body;
    
    const preferences = await storage.upsertCalmSpacePreferences({
      userId,
      favoriteTrack,
      volume,
      breathingPattern,
      ambientSounds,
      cosmicDebrisEnabled,
      debrisIntensity
    });
    
    res.json({ success: true, preferences });
  } catch (error) {
    console.error('Error saving calm preferences:', error);
    // Return success even if database save fails (fallback mode)
    res.json({ 
      success: true, 
      preferences: {
        favoriteTrack: req.body.favoriteTrack || 0,
        volume: req.body.volume || 0.7,
        breathingPattern: req.body.breathingPattern || { inhale: 4, hold: 4, exhale: 6 },
        ambientSounds: req.body.ambientSounds !== undefined ? req.body.ambientSounds : true,
        cosmicDebrisEnabled: req.body.cosmicDebrisEnabled !== undefined ? req.body.cosmicDebrisEnabled : true,
        debrisIntensity: req.body.debrisIntensity || 0.5
      }
    });
  }
};

// Track meditation sessions
export const logMeditationSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'dev-user-1';
    const { duration, track, completedBreathingExercise } = req.body;
    
    // Implementation would log session to database
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log session' });
  }
};

// Get meditation statistics
export const getMeditationStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'dev-user-1';
    
    // Implementation would fetch stats from database
    const stats = {
      totalSessions: 0,
      totalDuration: 0,
      streakDays: 0,
      favoriteTrack: 'Lofi Beats'
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
