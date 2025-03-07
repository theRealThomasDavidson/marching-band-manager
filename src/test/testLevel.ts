import { LevelService } from '@/services/LevelService';
import { LevelRepository } from '@/services/database/repositories/LevelRepository';

async function createTestLevel() {
  const levelRepository = new LevelRepository();
  const levelService = new LevelService(levelRepository);

  const testLevel = {
    name: "Test March Formation",
    description: "A test level for practicing basic formations",
    difficulty: 1,
    song_title: "When the Saints Go Marching In",
    tempo: 120,
    bandMembers: [
      {
        name: 'Trumpet Player 1',
        instrument: 'trumpet',
        instrument_type: "brass" as const,
        radius: 1,
        speed: 1,
        start_x: 10,
        start_y: 10,
        end_x: 20,
        end_y: 20,
        midi_track_notes: [60, 64, 67, 72],
        midi_track_lengths: [480, 480, 480, 480],
        midi_track_tempo: 120,
        midi_track_instrument: 56,
        midi_track_duration: 4
      },
      {
        name: 'Flute Player 1',
        instrument: 'flute',
        instrument_type: "woodwind" as const,
        radius: 1,
        speed: 1,
        start_x: 30,
        start_y: 30,
        end_x: 40,
        end_y: 40,
        midi_track_notes: [72, 76, 79, 84],
        midi_track_lengths: [480, 480, 480, 480],
        midi_track_tempo: 120,
        midi_track_instrument: 73,
        midi_track_duration: 4
      },
      {
        name: 'Drummer 1',
        instrument: 'snare',
        instrument_type: "percussion" as const,
        radius: 1,
        speed: 1,
        start_x: 50,
        start_y: 50,
        end_x: 60,
        end_y: 60,
        midi_track_notes: [35, 38, 42, 46],
        midi_track_lengths: [480, 480, 480, 480],
        midi_track_tempo: 120,
        midi_track_instrument: 115,
        midi_track_duration: 4
      }
    ]
  };

  try {
    const createdLevel = await levelService.createLevel(testLevel);
    console.log('Test level created successfully:', createdLevel);
    return createdLevel;
  } catch (error) {
    console.error('Error creating test level:', error);
    throw error;
  }
}

export { createTestLevel }; 