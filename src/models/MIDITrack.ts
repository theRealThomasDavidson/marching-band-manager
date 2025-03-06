/**
 * Represents a MIDI track for a band member
 */
export interface MIDITrack {
  id: string;
  band_member_id: string;
  track_data: string;  // MIDI data as a JSON string
  track_number: number;
  instrument_number: number;
  created_at: string;
  updated_at: string;
} 