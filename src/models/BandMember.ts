import { MIDITrack } from './MIDITrack';

/**
 * Represents a band member's state during gameplay
 */
export interface BandMemberState {
  member: BandMember;
  position: { x: number, y: number };
  moving: 1 | 0 | -1;  // 1 = moving forward, 0 = stopped, -1 = moving backward
}

/**
 * Represents a band member in the marching band
 */
export interface BandMember {
  id: string;
  level_id: string;
  name: string;
  instrument: string;
  instrument_type: string;
  instrumentType: string;
  radius: number;
  speed: number;
  created_at: string;
  updated_at: string;
  start_x: number;
  start_y: number;
  end_x: number;
  end_y: number;
  
  // MIDI data fields - required for music playback
  midi_track_notes: number[];
  midi_track_lengths: number[];
  midi_track_tempo: number;
  midi_track_duration: number;
  midi_track_instrument: number;
  
  // Current position during gameplay (not stored in DB)
  state?: BandMemberState;
  
  // Relations - not stored in the band_members table
  midiTracks?: MIDITrack[];
}

/**
 * Calculate the current position of a band member based on progress
 */
export function updateBandMemberState(member: BandMember, progress: number): BandMember {
  const newX = member.start_x + (member.end_x - member.start_x) * progress;
  const newY = member.start_y + (member.end_y - member.start_y) * progress;
  
  return {
    ...member,
    state: {
      member: member,
      position: { x: newX, y: newY },
      moving: progress < 1 ? 1 : 0
    }
  };
}

/**
 * Reset a band member's state to starting position
 */
export function resetBandMemberState(member: BandMember): BandMember {
  return {
    ...member,
    state: {
      member: member,
      position: { x: member.start_x, y: member.start_y },
      moving: 0
    }
  };
}
