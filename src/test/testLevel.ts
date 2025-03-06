import { LevelService } from '@/services/LevelService';
import { LevelRepository } from '@/services/database/repositories/LevelRepository';
import { BandMember } from '@/models/BandMember';

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
        name: "Trumpet 1",
        instrument: "Trumpet",
        instrumentType: "brass" as const,
        radius: 1,
        speed: 1,
        start_x: 0,
        start_y: 0,
        end_x: 5,
        end_y: 5
      },
      {
        name: "Clarinet 1",
        instrument: "Clarinet",
        instrumentType: "woodwind" as const,
        radius: 1,
        speed: 1,
        start_x: 2,
        start_y: 0,
        end_x: 7,
        end_y: 5
      },
      {
        name: "Snare Drum",
        instrument: "Snare",
        instrumentType: "percussion" as const,
        radius: 1,
        speed: 1,
        start_x: 1,
        start_y: 0,
        end_x: 6,
        end_y: 5
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