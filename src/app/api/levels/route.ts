import { NextResponse } from 'next/server';
import { LevelRepository } from '@/services/database/repositories/LevelRepository';
import { BandMember } from '@/models/BandMember';
import { Formation } from '@/models/Formation';

// Basic environment check
console.log('API Route Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_RUNTIME:', process.env.NEXT_RUNTIME);
console.log('Has Supabase URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('URL Value:', process.env.NEXT_PUBLIC_SUPABASE_URL);

const levelRepository = new LevelRepository();

/**
 * GET handler to retrieve all levels
 */
export async function GET() {
  try {
    const levels = await levelRepository.getAll();
    return NextResponse.json(levels, { status: 200 });
  } catch (error) {
    console.error('Error fetching levels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch levels' },
      { status: 500 }
    );
  }
}

/**
 * POST handler to create a new level
 */
export async function POST(request: Request) {
  try {
    console.log('Starting level creation...');
    const levelData = await request.json();
    console.log('Received level data:', JSON.stringify(levelData, null, 2));
    
    // Validate required fields
    const requiredFields = ['name', 'author'];
    const missingFields = requiredFields.filter(field => !levelData[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          missingFields,
          message: `Please provide the following required fields: ${missingFields.join(', ')}`
        },
        { status: 400 }
      );
    }

    console.log('Creating level with repository...');
    const level = await levelRepository.create(levelData);
    console.log('Level created successfully:', level);
    
    return NextResponse.json(level);
  } catch (error) {
    console.error('Detailed error creating level:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create level',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * PUT handler to update an existing level
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Validate ID is present
    if (!body.id) {
      return NextResponse.json(
        { error: 'Level ID is required' },
        { status: 400 }
      );
    }
    
    // Create update object with typed interface
    const updates: {
      name?: string;
      description?: string;
      difficulty?: number;
      song_title?: string;
      tempo?: number;
      bandMembers?: BandMember[];
      formations?: Formation[];
      [key: string]: string | number | BandMember[] | Formation[] | undefined;
    } = {
      name: body.name,
      description: body.description,
      difficulty: body.difficulty,
      song_title: body.song_title,
      tempo: body.tempo,
      bandMembers: body.bandMembers,
      formations: body.formations
    };
    
    // Remove undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });
    
    const updatedLevel = await levelRepository.update(body.id, updates);
    
    if (!updatedLevel) {
      return NextResponse.json(
        { error: 'Level not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedLevel, { status: 200 });
  } catch (error) {
    console.error('Error updating level:', error);
    return NextResponse.json(
      { error: 'Failed to update level' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler to remove a level
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Level ID is required' },
        { status: 400 }
      );
    }
    
    const success = await levelRepository.delete(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Level not found or could not be deleted' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Level deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting level:', error);
    return NextResponse.json(
      { error: 'Failed to delete level' },
      { status: 500 }
    );
  }
} 