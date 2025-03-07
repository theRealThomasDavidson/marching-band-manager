import { LevelRepository } from '@/services/database/repositories/LevelRepository';
import { BandMember } from '@/models/BandMember';

/**
 * Service for band member operations
 */
export class BandMemberService {
  private static repository = new LevelRepository();

  /**
   * Get all band members
   * @returns All band members
   */
  static async getAllBandMembers(): Promise<BandMember[]> {
    const levels = await this.repository.getAll();
    return levels.reduce<BandMember[]>((acc, level) => {
      if (level.bandMembers) {
        return [...acc, ...level.bandMembers];
      }
      return acc;
    }, []);
  }

  /**
   * Get a band member by ID
   * @param id The band member ID
   * @returns The band member or null if not found
   */
  static async getBandMemberById(id: string): Promise<BandMember | null> {
    const levels = await this.repository.getAll();
    for (const level of levels) {
      if (level.bandMembers) {
        const member = level.bandMembers.find(m => m.id === id);
        if (member) return member;
      }
    }
    return null;
  }

  /**
   * Update a band member
   * @param id The band member ID
   * @param updates The band member updates
   * @returns The updated band member
   */
  static async updateBandMember(id: string, updates: Partial<BandMember>): Promise<BandMember | null> {
    return this.repository.updateBandMember(id, updates);
  }

  /**
   * Get band members by instrument type
   * @param instrument_type The instrument type
   * @returns Array of band members with the specified instrument type
   */
  static async getBandMembersByInstrumentType(instrument_type: 'brass' | 'woodwind' | 'percussion'): Promise<BandMember[]> {
    try {
      const allMembers = await this.getAllBandMembers();
      return allMembers.filter(member => member.instrument_type === instrument_type);
    } catch (error) {
      console.error(`Error fetching band members by instrument type ${instrument_type}:`, error);
      throw error;
    }
  }
} 