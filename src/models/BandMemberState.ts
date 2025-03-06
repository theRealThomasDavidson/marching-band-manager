import { BandMember } from './BandMember';

/**
 * Represents the state of a band member during a game level
 */
export interface BandMemberState {
  member: BandMember;
  position: { x: number, y: number };
  direction: { x: number, y: number } | null; // null means not moving
  isMoving: boolean;
  isColliding: boolean;
} 