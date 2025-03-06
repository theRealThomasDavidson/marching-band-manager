import { BandMemberRepository } from './database/repositories/BandMemberRepository';
import { BandMember } from '@/models/BandMember';

/**
 * Service for band member operations
 */
export class BandMemberService {
  /**
   * Get all band members
   * @returns All band members
   */
  static async getAllBandMembers(): Promise<BandMember[]> {
    return BandMemberRepository.getAll();
  }

  /**
   * Get a band member by ID
   * @param id The band member ID
   * @returns The band member or null if not found
   */
  static async getBandMemberById(id: string): Promise<BandMember | null> {
    return BandMemberRepository.getById(id);
  }

  /**
   * Create a new band member
   * @param bandMemberData The band member data
   * @returns The created band member
   */
  static async createBandMember(bandMemberData: Omit<BandMember, 'id' | 'created_at' | 'updated_at'>): Promise<BandMember> {
    return BandMemberRepository.create(bandMemberData);
  }

  /**
   * Update a band member
   * @param id The band member ID
   * @param updates The band member updates
   * @returns The updated band member
   */
  static async updateBandMember(id: string, updates: Partial<BandMember>): Promise<BandMember> {
    return BandMemberRepository.update(id, updates);
  }

  /**
   * Delete a band member
   * @param id The band member ID
   * @returns True if deleted successfully
   */
  static async deleteBandMember(id: string): Promise<boolean> {
    return BandMemberRepository.delete(id);
  }

  /**
   * Get band members by instrument type
   * @param instrumentType The instrument type
   * @returns Band members with the specified instrument type
   */
  static async getBandMembersByInstrumentType(instrumentType: 'brass' | 'woodwind' | 'percussion'): Promise<BandMember[]> {
    try {
      const allMembers = await BandMemberRepository.getAll();
      return allMembers.filter(member => member.instrumentType === instrumentType);
    } catch (error) {
      console.error(`Error fetching band members by instrument type ${instrumentType}:`, error);
      throw error;
    }
  }
} 