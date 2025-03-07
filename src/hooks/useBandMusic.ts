import { useEffect, useRef } from 'react';
import { BandMember } from '@/models/BandMember';
import { AudioGenerator } from '@/services/MidiGenerator';

export function useBandMusic(members: BandMember[], isPlaying: boolean) {
  const audioGeneratorRef = useRef<AudioGenerator>();

  useEffect(() => {
    // Initialize audio generator
    const initAudio = async () => {
      audioGeneratorRef.current = new AudioGenerator();
      await audioGeneratorRef.current.initialize();
      
      // Create instruments for each member
      members.forEach(member => {
        audioGeneratorRef.current?.createInstrument(member.id, member.instrumentType);
      });
    };

    initAudio();

    return () => {
      audioGeneratorRef.current?.stopAll();
    };
  }, [members]);

  useEffect(() => {
    if (!audioGeneratorRef.current) return;

    if (isPlaying) {
      // Play each member's sequence
      members.forEach(member => {
        audioGeneratorRef.current?.playNote(member.id);
      });
    } else {
      audioGeneratorRef.current.stopAll();
    }
  }, [isPlaying, members]);

  return {
    hasAudio: !!audioGeneratorRef.current
  };
} 