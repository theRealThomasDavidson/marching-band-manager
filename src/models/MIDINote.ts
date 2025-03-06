/**
 * Represents a single note in a MIDI track
 */
export interface MIDINote {
  pitch: number;
  startTime: number;
  endTime: number;
  velocity: number;
} 