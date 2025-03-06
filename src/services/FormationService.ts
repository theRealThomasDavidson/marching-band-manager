import { FormationRepository } from './database/repositories/FormationRepository';
import { FormationPositionRepository } from './database/repositories/FormationPositionRepository';
import { Formation } from '@/models/Formation';
import { BandMember } from '@/models/BandMember';

/**
 * Service for formation operations
 */
export class FormationService {
  /**
   * Get all formations
   * @returns All formations
   */
  static async getAllFormations(): Promise<Formation[]> {
    return FormationRepository.getAll();
  }

  /**
   * Get a formation by ID
   * @param id The formation ID
   * @returns The formation or null if not found
   */
  static async getFormationById(id: string): Promise<Formation | null> {
    return FormationRepository.getById(id);
  }

  /**
   * Create a new formation
   * @param name The formation name
   * @param description The formation description
   * @returns The created formation
   */
  static async createFormation(name: string, description: string): Promise<Formation> {
    return FormationRepository.create({
      name,
      description
    });
  }

  /**
   * Update a formation
   * @param id The formation ID
   * @param updates The formation updates
   * @returns The updated formation
   */
  static async updateFormation(id: string, updates: Partial<Formation>): Promise<Formation> {
    return FormationRepository.update(id, updates);
  }

  /**
   * Delete a formation
   * @param id The formation ID
   * @returns True if deleted successfully
   */
  static async deleteFormation(id: string): Promise<boolean> {
    return FormationRepository.delete(id);
  }

  /**
   * Get all band members with positions for a formation
   * @param formationId The formation ID
   * @returns Array of band members with position data
   */
  static async getBandMembersInFormation(formationId: string): Promise<(BandMember & { position_x: number; position_y: number })[]> {
    return FormationPositionRepository.getBandMembersWithPositions(formationId);
  }

  /**
   * Set a band member's position in a formation
   * @param formationId The formation ID
   * @param bandMemberId The band member ID
   * @param positionX The X coordinate
   * @param positionY The Y coordinate
   * @returns Success status
   */
  static async setBandMemberPosition(
    formationId: string, 
    bandMemberId: string, 
    positionX: number, 
    positionY: number
  ): Promise<boolean> {
    try {
      await FormationPositionRepository.setPosition(formationId, bandMemberId, positionX, positionY);
      return true;
    } catch (error) {
      console.error('Error setting band member position:', error);
      return false;
    }
  }

  /**
   * Remove a band member from a formation
   * @param formationId The formation ID
   * @param bandMemberId The band member ID
   * @returns Success status
   */
  static async removeBandMemberFromFormation(formationId: string, bandMemberId: string): Promise<boolean> {
    return FormationPositionRepository.removeFromFormation(formationId, bandMemberId);
  }
} 