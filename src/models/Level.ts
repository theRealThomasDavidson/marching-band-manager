import { BandMember } from './BandMember';

/**
 * Represents a game level in the marching band manager
 */
export interface Level {
  id: string;
  name: string;
  author: string;
  music_theme?: string;
  song_title?: string;
  tempo?: number;
  duration_seconds?: number;
  plays: number;
  created_at: string;
  updated_at: string;
  
  // Relations - not stored in the levels table
  bandMembers?: BandMember[];
} 