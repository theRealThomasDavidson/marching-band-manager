import { NextRequest, NextResponse } from 'next/server';
import { LevelRepository } from '@/services/database/repositories/LevelRepository';
import { LevelService } from '@/services/LevelService';

const repository = new LevelRepository();
const service = new LevelService(repository);

/**
 * Update a band member's position
 * @route PUT /api/band-members/:id/position
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const memberId = params.id;
    
    // Validate required fields
    if (!memberId) {
      return NextResponse.json(
        { error: 'Band member ID is required' },
        { status: 400 }
      );
    }
    
    // Check if we're updating start or end position or both
    const positionData: {
      start_x?: number;
      start_y?: number;
      end_x?: number;
      end_y?: number;
      movement_type?: 'linear' | 'curved' | 'bezier';
    } = {};
    
    // Validate and add start position if provided
    if (data.start_x !== undefined && data.start_y !== undefined) {
      if (typeof data.start_x !== 'number' || typeof data.start_y !== 'number') {
        return NextResponse.json(
          { error: 'Start position coordinates must be numbers' },
          { status: 400 }
        );
      }
      positionData.start_x = data.start_x;
      positionData.start_y = data.start_y;
    }
    
    // Validate and add end position if provided
    if (data.end_x !== undefined && data.end_y !== undefined) {
      if (typeof data.end_x !== 'number' || typeof data.end_y !== 'number') {
        return NextResponse.json(
          { error: 'End position coordinates must be numbers' },
          { status: 400 }
        );
      }
      positionData.end_x = data.end_x;
      positionData.end_y = data.end_y;
    }
    
    // Validate and add movement type if provided
    if (data.movement_type !== undefined) {
      const validTypes = ['linear', 'curved', 'bezier'];
      if (!validTypes.includes(data.movement_type)) {
        return NextResponse.json(
          { error: 'Movement type must be one of: linear, curved, bezier' },
          { status: 400 }
        );
      }
      positionData.movement_type = data.movement_type as 'linear' | 'curved' | 'bezier';
    }
    
    // Check if we have any positions to update
    if (Object.keys(positionData).length === 0) {
      return NextResponse.json(
        { error: 'At least one position coordinate must be provided' },
        { status: 400 }
      );
    }
    
    // Update the position
    const updatedMember = await service.updateBandMemberPosition(memberId, positionData);
    
    if (!updatedMember) {
      return NextResponse.json(
        { error: 'Band member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error updating band member position:', error);
    return NextResponse.json(
      { error: 'Failed to update band member position' },
      { status: 500 }
    );
  }
} 