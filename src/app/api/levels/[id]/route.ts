import { NextResponse } from 'next/server';
import { LevelRepository } from '@/services/database/repositories/LevelRepository';

const levelRepository = new LevelRepository();

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET handler to retrieve a level by ID
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const level = await levelRepository.getById(params.id);
    
    if (!level) {
      return NextResponse.json(
        { error: 'Level not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(level, { status: 200 });
  } catch (error) {
    console.error(`Error fetching level ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch level' },
      { status: 500 }
    );
  }
}

/**
 * PUT handler to update a level by ID
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    
    // Create update object
    const updates = {
      name: body.name,
      description: body.description,
      difficulty: body.difficulty,
      song_title: body.song_title,
      tempo: body.tempo,
      bandMembers: body.bandMembers,
      formations: body.formations
    };
    
    // Remove undefined values
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined) {
        delete updates[key as keyof typeof updates];
      }
    });
    
    const updatedLevel = await levelRepository.update(params.id, updates);
    
    if (!updatedLevel) {
      return NextResponse.json(
        { error: 'Level not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedLevel, { status: 200 });
  } catch (error) {
    console.error(`Error updating level ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update level' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler to remove a level by ID
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const success = await levelRepository.delete(params.id);
    
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
    console.error(`Error deleting level ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete level' },
      { status: 500 }
    );
  }
} 