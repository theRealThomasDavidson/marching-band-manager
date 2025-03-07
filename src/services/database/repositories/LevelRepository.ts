import supabase, { supabaseAdmin } from '@/services/database/supabase';
import { Level } from '@/models/Level';
import { BandMember } from '@/models/BandMember';

/**
 * Repository for managing Levels and Band Members using direct table operations
 */
export class LevelRepository {
  constructor() {
    // Debug logging
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Has service key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Test connection
    this.testConnection();
  }

  private async testConnection() {
    try {
      const { data, error } = await supabaseAdmin
        .from('_prisma_migrations')
        .select('*')
        .limit(1);
      
      console.log('Connection test result:', { data, error });
      
      // Also try a raw query to get version
      const { data: versionData, error: versionError } = await supabaseAdmin
        .rpc('version');
      
      console.log('Postgres version:', { versionData, versionError });
    } catch (err) {
      console.error('Connection test failed:', err);
    }
  }

  /**
   * Get all levels with their band members
   */
  async getAll(): Promise<Level[]> {
    try {
      const { data: levels, error } = await supabase
        .from('levels')
        .select(`
          *,
          band_members (
            id,
            level_id,
            name,
            instrument,
            instrument_type,
            start_x,
            start_y,
            end_x,
            end_y,
            radius,
            speed,
            midi_track_notes,
            midi_track_lengths,
            midi_track_tempo,
            midi_track_instrument,
            midi_track_duration,
            created_at,
            updated_at
          )
        `)
        .order('name');

      if (error) throw error;
      return levels;
    } catch (error) {
      console.error('Error fetching levels:', error);
      throw error;
    }
  }

  /**
   * Get level by ID with all its band members
   */
  async getById(id: string): Promise<Level | null> {
    try {
      const { data: level, error } = await supabase
        .from('levels')
        .select(`
          *,
          band_members (
            id,
            level_id,
            name,
            instrument,
            instrument_type,
            start_x,
            start_y,
            end_x,
            end_y,
            radius,
            speed,
            midi_track_notes,
            midi_track_lengths,
            midi_track_tempo,
            midi_track_instrument,
            midi_track_duration,
            created_at,
            updated_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return level;
    } catch (error) {
      console.error(`Error fetching level ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new level with band members using direct table operations
   */
  async create(level: {
    name: string;
    description?: string;
    author?: string;
    music_theme?: string;
    song_title?: string;
    tempo?: number;
    bandMembers?: {
      name: string;
      instrument: string;
      instrument_type: string;
      start_x: number;
      start_y: number;
      end_x: number;
      end_y: number;
      radius?: number;
      speed?: number;
      midi_track_notes: number[];
      midi_track_lengths: number[];
      midi_track_tempo: number;
      midi_track_instrument: number;
      midi_track_duration: number;
    }[];
  }): Promise<Level> {
    try {
      console.log('Starting level creation...');
      
      // Create the level first
      console.log('Creating level with data:', {
        name: level.name,
        author: level.author,
        music_theme: level.music_theme,
        song_title: level.song_title,
        tempo: level.tempo
      });

      const { data: createdLevel, error: levelError } = await supabaseAdmin
        .from('levels')
        .insert({
          name: level.name,
          author: level.author || null,
          music_theme: level.music_theme || null,
          song_title: level.song_title || null,
          tempo: level.tempo || null,
          plays: 0
        })
        .select()
        .single();

      if (levelError) {
        console.error('Level creation error:', levelError);
        throw levelError;
      }
      
      console.log('Level created:', createdLevel);

      // If there are band members, create them
      if (level.bandMembers && level.bandMembers.length > 0) {
        const bandMembersWithLevelId = level.bandMembers.map(member => ({
          level_id: createdLevel.id,
          name: member.name,
          instrument: member.instrument,
          instrument_type: member.instrument_type,
          start_x: member.start_x,
          start_y: member.start_y,
          end_x: member.end_x,
          end_y: member.end_y,
          radius: member.radius || 1,
          speed: member.speed || 1,
          midi_track_notes: member.midi_track_notes,
          midi_track_lengths: member.midi_track_lengths,
          midi_track_tempo: member.midi_track_tempo,
          midi_track_instrument: member.midi_track_instrument,
          midi_track_duration: member.midi_track_duration
        }));

        const { error: bandMembersError } = await supabaseAdmin
          .from('band_members')
          .insert(bandMembersWithLevelId);

        if (bandMembersError) throw bandMembersError;
      }

      // Fetch the complete level with all its data
      const completeLevel = await this.getById(createdLevel.id);
      if (!completeLevel) throw new Error('Failed to fetch created level');

      return completeLevel;
    } catch (error) {
      console.error('Detailed error in create:', error);
      throw error;
    }
  }

  /**
   * Update a level by ID
   */
  async update(id: string, updates: Partial<Level>): Promise<Level | null> {
    try {
      const { data: updatedLevel, error } = await supabaseAdmin
        .from('levels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedLevel;
    } catch (error) {
      console.error(`Error updating level ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a level by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('levels')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting level ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update a band member by ID
   */
  async updateBandMember(id: string, updates: Partial<BandMember>): Promise<BandMember | null> {
    try {
      const { data: updatedMember, error } = await supabaseAdmin
        .from('band_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedMember;
    } catch (error) {
      console.error(`Error updating band member ${id}:`, error);
      throw error;
    }
  }
} 