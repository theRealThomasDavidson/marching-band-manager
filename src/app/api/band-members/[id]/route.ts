import { NextRequest, NextResponse } from 'next/server';
import { LevelRepository } from '@/services/database/repositories/LevelRepository';
import { LevelService } from '@/services/LevelService';
import { BandMember } from '@/models/BandMember';

const repository = new LevelRepository();
const service = new LevelService(repository);

/**
 * Get a band member by ID
 * @route GET /api/band-members/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memberId = params.id;
    
    // Get all levels
    const levels = await service.getAllLevels();
    
    // Find the band member in any level
    let bandMember: BandMember | undefined;
    
    for (const level of levels) {
      if (level.bandMembers) {
        bandMember = level.bandMembers.find(member => member.id === memberId);
        if (bandMember) break;
      }
    }
    
    if (!bandMember) {
      return NextResponse.json(
        { error: 'Band member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(bandMember);
  } catch (error) {
    console.error(`Error fetching band member ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch band member' },
      { status: 500 }
    );
  }
}

/**
 * Update a band member
 * @route PUT /api/band-members/:id
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const memberId = params.id;
    
    // Create update object with only valid fields
    const updates: Partial<BandMember> = {};
    
    // Basic properties
    if (data.name !== undefined) updates.name = data.name;
    if (data.instrument !== undefined) updates.instrument = data.instrument;
    if (data.instrumentType !== undefined) updates.instrumentType = data.instrumentType;
    if (data.radius !== undefined) updates.radius = data.radius;
    if (data.speed !== undefined) updates.speed = data.speed;
    
    // Position properties
    if (data.start_x !== undefined) updates.start_x = data.start_x;
    if (data.start_y !== undefined) updates.start_y = data.start_y;
    if (data.end_x !== undefined) updates.end_x = data.end_x;
    if (data.end_y !== undefined) updates.end_y = data.end_y;
    if (data.movement_type !== undefined) updates.movement_type = data.movement_type;
    
    // Check if there are any updates to apply
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    // Update the band member
    const updatedMember = await repository.updateBandMember(memberId, updates);
    
    if (!updatedMember) {
      return NextResponse.json(
        { error: 'Band member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error(`Error updating band member ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update band member' },
      { status: 500 }
    );
  }
}

/**
 * Delete a band member
 * @route DELETE /api/band-members/:id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memberId = params.id;
    
    // Find which level the band member belongs to
    const levels = await service.getAllLevels();
    
    let levelId: string | undefined;
    let bandMember: BandMember | undefined;
    
    for (const level of levels) {
      if (level.bandMembers) {
        bandMember = level.bandMembers.find(member => member.id === memberId);
        if (bandMember) {
          levelId = level.id;
          break;
        }
      }
    }
    
    if (!levelId || !bandMember) {
      return NextResponse.json(
        { error: 'Band member not found' },
        { status: 404 }
      );
    }
    
    // Get current band members for this level
    const level = await service.getLevelById(levelId);
    if (!level || !level.bandMembers) {
      return NextResponse.json(
        { error: 'Unable to fetch level data' },
        { status: 500 }
      );
    }
    
    // Filter out the band member to delete
    const updatedBandMembers = level.bandMembers.filter(member => member.id !== memberId);
    
    // Update the level with the new band members list
    await service.updateLevel(levelId, { bandMembers: updatedBandMembers });
    
    return NextResponse.json(
      { message: 'Band member deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting band member ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete band member' },
      { status: 500 }
    );
  }
} 