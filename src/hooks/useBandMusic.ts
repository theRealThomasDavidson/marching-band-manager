import { useEffect, useRef } from 'react';
import { BandMember } from '@/models/BandMember';
import { AudioGenerator } from '@/services/MidiGenerator';

export function useBandMusic(members: BandMember[], isPlaying: boolean) {
  const audioGeneratorRef = useRef<AudioGenerator>();

  useEffect(() => {
    // Initialize audio generator
    audioGeneratorRef.current = new AudioGenerator();
    
    // Generate MIDI tracks for each member
    members.forEach(member => {
      const type = member.instrument_type as 'brass' | 'woodwind' | 'percussion';
      const track = audioGeneratorRef.current?.generateMidiTrack(type);
      if (track) {
        // Store track data in member for later use
        member.midi_track_notes = track.track_data.notes;
        member.midi_track_lengths = track.track_data.lengths;
        member.midi_track_tempo = track.track_data.tempo;
        member.midi_track_duration = track.track_data.duration;
        member.midi_track_instrument = track.instrument_number;
      }
    });

    return () => {
      // Cleanup if needed
    };
  }, [members]);

  useEffect(() => {
    if (!audioGeneratorRef.current || !isPlaying) return;

    // Play each member's sequence
    members.forEach(member => {
      if (member.midi_track_notes && member.midi_track_lengths) {
        AudioGenerator.downloadMidi(
          member.midi_track_notes,
          member.midi_track_lengths,
          `${member.name}_track.mid`
        );
      }
    });
  }, [isPlaying, members]);

  return {
    hasAudio: !!audioGeneratorRef.current
  };
} 