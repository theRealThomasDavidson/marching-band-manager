import { LevelRepository } from '@/services/database/repositories/LevelRepository';
import { Level } from '@/models/Level';
import { BandMember } from '@/models/BandMember';

/**
 * Service for handling level-related business logic
 */
export class LevelService {
  constructor(private repository: LevelRepository) {}

  /**
   * Get all levels with their associated data
   * @returns Array of levels with band members
   */
  async getAllLevels(): Promise<Level[]> {
    try {
      return await this.repository.getAll();
    } catch (error) {
      console.error('Error in LevelService.getAllLevels:', error);
      throw error;
    }
  }

  /**
   * Get a level by its ID
   * @param id Level ID
   * @returns Level with associated data or null if not found
   */
  async getLevelById(id: string): Promise<Level | null> {
    try {
      return await this.repository.getById(id);
    } catch (error) {
      console.error(`Error in LevelService.getLevelById(${id}):`, error);
      throw error;
    }
  }

  /**
   * Create a new level with optional band members
   * @param levelData Data for creating a new level
   * @returns Created level with all associated data
   */
  async createLevel(levelData: {
    name: string;
    description?: string;
    difficulty?: number;
    song_title?: string;
    tempo?: number;
    bandMembers?: Omit<BandMember, 'id' | 'level_id' | 'created_at' | 'updated_at'>[];
  }): Promise<Level> {
    try {
      return await this.repository.create(levelData);
    } catch (error) {
      console.error('Error in LevelService.createLevel:', error);
      throw error;
    }
  }

  /**
   * Update an existing level
   * @param id Level ID
   * @param updates Updates to apply to the level
   * @returns Updated level or null if not found
   */
  async updateLevel(id: string, updates: {
    name?: string;
    description?: string;
    difficulty?: number;
    song_title?: string;
    tempo?: number;
    bandMembers?: BandMember[];
  }): Promise<Level | null> {
    try {
      return await this.repository.update(id, updates);
    } catch (error) {
      console.error(`Error in LevelService.updateLevel(${id}):`, error);
      throw error;
    }
  }

  /**
   * Delete a level and all its associated data
   * @param id Level ID
   * @returns True if deleted successfully, false if not found
   */
  async deleteLevel(id: string): Promise<boolean> {
    try {
      return await this.repository.delete(id);
    } catch (error) {
      console.error(`Error in LevelService.deleteLevel(${id}):`, error);
      throw error;
    }
  }

  /**
   * Add a band member to a level
   * @param levelId Level ID
   * @param bandMemberData Band member data
   * @returns Updated level with the new band member
   */
  async addBandMemberToLevel(
    levelId: string,
    bandMemberData: Omit<BandMember, 'id' | 'level_id' | 'created_at' | 'updated_at'>
  ): Promise<Level | null> {
    try {
      // Get the level
      const level = await this.repository.getById(levelId);
      if (!level) return null;

      // Create band member
      await this.repository.createBandMember(levelId, bandMemberData);

      // Return updated level
      return await this.repository.getById(levelId);
    } catch (error) {
      console.error(`Error in LevelService.addBandMemberToLevel(${levelId}):`, error);
      throw error;
    }
  }

  /**
   * Update a band member's position
   * @param bandMemberId Band member ID
   * @param positionData Position data to update
   * @returns The updated band member or null if not found
   */
  async updateBandMemberPosition(
    bandMemberId: string,
    positionData: {
      start_x?: number;
      start_y?: number;
      end_x?: number;
      end_y?: number;
      movement_type?: 'linear' | 'curved' | 'bezier';
    }
  ): Promise<BandMember | null> {
    try {
      // Make sure only valid fields are updated
      const updates: Record<string, unknown> = {};
      if (positionData.start_x !== undefined) updates.start_x = positionData.start_x;
      if (positionData.start_y !== undefined) updates.start_y = positionData.start_y;
      if (positionData.end_x !== undefined) updates.end_x = positionData.end_x;
      if (positionData.end_y !== undefined) updates.end_y = positionData.end_y;
      if (positionData.movement_type !== undefined) updates.movement_type = positionData.movement_type;

      // No updates to make
      if (Object.keys(updates).length === 0) return null;

      // Update the band member
      return await this.repository.updateBandMember(bandMemberId, updates);
    } catch (error) {
      console.error(`Error in LevelService.updateBandMemberPosition(${bandMemberId}):`, error);
      throw error;
    }
  }
} 