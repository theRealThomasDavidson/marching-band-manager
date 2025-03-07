import { NextRequest, NextResponse } from 'next/server';
import { LevelRepository } from '@/services/database/repositories/LevelRepository';
import { LevelService } from '@/services/LevelService';
import { BandMember } from '@/models/BandMember';
import { AudioGenerator } from '@/services/MidiGenerator';

const repository = new LevelRepository();
const service = new LevelService(repository);

/**
 * Get all band members
 * @route GET /api/band-members
 */
export async function GET(request: NextRequest) {
  try {
    // Optional query parameter for filtering by level
    const { searchParams } = new URL(request.url);
    const levelId = searchParams.get('level_id');
    
    if (levelId) {
      // Get band members for a specific level
      const level = await service.getLevelById(levelId);
      if (!level) {
        return NextResponse.json(
          { error: 'Level not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(level.bandMembers || []);
    } else {
      // Get all band members from all levels
      const levels = await service.getAllLevels();
      // Flatten all band members from all levels
      const allBandMembers = levels.reduce<BandMember[]>((acc, level) => {
        if (level.bandMembers) {
          return [...acc, ...level.bandMembers];
        }
        return acc;
      }, []);
      
      return NextResponse.json(allBandMembers);
    }
  } catch (error) {
    console.error('Error fetching band members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch band members' },
      { status: 500 }
    );
  }
}

/**
 * Create a new band member
 * @route POST /api/band-members
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.level_id) {
      return NextResponse.json(
        { error: 'Level ID is required' },
        { status: 400 }
      );
    }
    
    if (!data.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    if (!data.instrument) {
      return NextResponse.json(
        { error: 'Instrument is required' },
        { status: 400 }
      );
    }
    
    if (!data.instrument_type) {
      return NextResponse.json(
        { error: 'Instrument type is required' },
        { status: 400 }
      );
    }
    
    // Create MIDI track for the band member
    const audioGenerator = new AudioGenerator();
    const midiTrack = audioGenerator.generateMidiTrack(data.instrument_type);

    // Add MIDI track to the data
    const bandMemberData = {
      name: data.name,
      instrument: data.instrument,
      instrument_type: data.instrument_type,
      radius: data.radius || 1,
      speed: data.speed || 1,
      start_x: data.start_x,
      start_y: data.start_y,
      end_x: data.end_x,
      end_y: data.end_y,
      midi_track_notes: midiTrack.track_data.notes,
      midi_track_lengths: midiTrack.track_data.lengths,
      midi_track_tempo: 120,
      midi_track_instrument: midiTrack.instrument_number,
      midi_track_duration: midiTrack.duration
    };
    
    // Add band member to level
    const updatedLevel = await service.addBandMemberToLevel(data.level_id, bandMemberData);
    
    if (!updatedLevel) {
      return NextResponse.json(
        { error: 'Level not found' },
        { status: 404 }
      );
    }
    
    // Return the newly created band member
    const newBandMember = updatedLevel.bandMembers?.slice(-1)[0];
    
    return NextResponse.json(newBandMember, { status: 201 });
  } catch (error) {
    console.error('Error creating band member:', error);
    return NextResponse.json(
      { error: 'Failed to create band member' },
      { status: 500 }
    );
  }
} 