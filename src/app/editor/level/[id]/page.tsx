'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Level } from '@/models/Level';
import { BandMember } from '@/models/BandMember';
import * as PIXI from 'pixi.js';

/**
 * Level Editor page component
 */
export default function LevelEditor() {
  const { id } = useParams<{ id: string }>();
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'start' | 'end'>('start');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const memberSpritesRef = useRef<Record<string, { start: PIXI.Sprite, end: PIXI.Sprite }>>({});

  // Fetch level data
  useEffect(() => {
    const fetchLevel = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/levels/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch level: ${response.statusText}`);
        }
        
        const data = await response.json();
        setLevel(data);
      } catch (err) {
        console.error('Error fetching level:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLevel();
    }
  }, [id]);

  // Initialize PIXI canvas
  useEffect(() => {
    if (!canvasRef.current || !level || appRef.current) return;

    // Create PIXI application
    const app = new PIXI.Application({
      backgroundColor: 0xf0f0f0,
      width: 800,
      height: 600,
      antialias: true,
    });
    
    // Add to DOM
    canvasRef.current.appendChild(app.view as unknown as Node);
    appRef.current = app;

    // Add grid
    const grid = new PIXI.Graphics();
    grid.lineStyle(1, 0xcccccc, 0.5);
    
    // Vertical grid lines
    for (let x = 0; x <= app.screen.width; x += 50) {
      grid.moveTo(x, 0);
      grid.lineTo(x, app.screen.height);
    }
    
    // Horizontal grid lines
    for (let y = 0; y <= app.screen.height; y += 50) {
      grid.moveTo(0, y);
      grid.lineTo(app.screen.width, y);
    }
    
    app.stage.addChild(grid);

    // Clean up on unmount
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
      
      memberSpritesRef.current = {};
    };
  }, [level]);

  // Add band members to canvas
  useEffect(() => {
    if (!appRef.current || !level?.bandMembers?.length) return;
    
    const app = appRef.current;
    const sprites: Record<string, { start: PIXI.Sprite, end: PIXI.Sprite }> = {};
    
    // Clear existing sprites
    for (const key in memberSpritesRef.current) {
      const sprites = memberSpritesRef.current[key];
      app.stage.removeChild(sprites.start);
      app.stage.removeChild(sprites.end);
    }
    
    // Function to create a band member sprite
    const createMemberSprite = (member: BandMember, isStart: boolean): PIXI.Sprite => {
      // Create circle sprite
      const color = getInstrumentColor(member.instrument_type);
      const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
      sprite.tint = color;
      sprite.width = sprite.height = member.radius * 20 || 30;
      sprite.anchor.set(0.5);
      
      // Position sprite
      const x = isStart ? (member.start_x || 100) : (member.end_x || 300);
      const y = isStart ? (member.start_y || 100) : (member.end_y || 300);
      sprite.position.set(x, y);
      
      // Add interaction
      sprite.eventMode = 'static';
      sprite.cursor = 'pointer';
      
      sprite.on('pointerdown', () => {
        setSelectedMember(member.id);
        setEditMode(isStart ? 'start' : 'end');
      });
      
      // Change appearance when selected
      if (member.id === selectedMember) {
        const outline = new PIXI.Graphics();
        outline.lineStyle(2, 0x00ff00);
        outline.drawCircle(0, 0, (member.radius * 20) / 2 + 2);
        sprite.addChild(outline);
      }
      
      // Add label
      const style = new PIXI.TextStyle({
        fontSize: 12,
        fill: 0x000000
      });
      const text = new PIXI.Text(isStart ? 'S' : 'E', style);
      text.anchor.set(0.5);
      sprite.addChild(text);
      
      return sprite;
    };
    
    // Create sprites for each band member
    level.bandMembers.forEach(member => {
      const startSprite = createMemberSprite(member, true);
      const endSprite = createMemberSprite(member, false);
      
      // Draw line connecting start and end
      const line = new PIXI.Graphics();
      line.lineStyle(2, getInstrumentColor(member.instrument_type), 0.3);
      line.moveTo(member.start_x || 100, member.start_y || 100);
      line.lineTo(member.end_x || 300, member.end_y || 300);
      app.stage.addChild(line);
      
      // Add sprites to stage
      app.stage.addChild(startSprite);
      app.stage.addChild(endSprite);
      
      sprites[member.id] = { start: startSprite, end: endSprite };
    });
    
    memberSpritesRef.current = sprites;
    
    // Add click handler to canvas for positioning
    app.stage.eventMode = 'static';
    app.stage.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
      if (selectedMember) {
        const { x, y } = event.global;
        updateMemberPosition(selectedMember, x, y);
      }
    });
    
  }, [level, selectedMember, editMode]);

  // Update a band member's position
  const updateMemberPosition = async (memberId: string, x: number, y: number) => {
    if (!level?.bandMembers) return;
    
    // Find the member
    const memberIndex = level.bandMembers.findIndex(m => m.id === memberId);
    if (memberIndex === -1) return;
    
    const updatedMembers = [...level.bandMembers];
    const member = {...updatedMembers[memberIndex]};
    
    // Update position based on edit mode
    if (editMode === 'start') {
      member.start_x = x;
      member.start_y = y;
    } else {
      member.end_x = x;
      member.end_y = y;
    }
    
    updatedMembers[memberIndex] = member;
    
    // Update local state
    setLevel({
      ...level,
      bandMembers: updatedMembers
    });
    
    // Update on server
    try {
      const positionData = editMode === 'start' 
        ? { start_x: x, start_y: y }
        : { end_x: x, end_y: y };
        
      await fetch(`/api/band-members/${memberId}/position`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(positionData),
      });
    } catch (err) {
      console.error('Error updating position:', err);
      // Revert on error
      // You could add a toast or notification here
    }
  };

  // Get color based on instrument type
  const getInstrumentColor = (type: string): number => {
    switch (type) {
      case 'brass':
        return 0xf0c420; // Gold
      case 'woodwind':
        return 0x6ab04c; // Green
      case 'percussion':
        return 0xff6b6b; // Red
      default:
        return 0x7f8fa6; // Blue-gray
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading level data...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  if (!level) {
    return <div className="container mx-auto p-4">Level not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Level Editor: {level.name}</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Level Details</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><span className="font-medium">Name:</span> {level.name}</p>
          <p><span className="font-medium">Author:</span> {level.author}</p>
          <p><span className="font-medium">Song:</span> {level.song_title || 'Not set'}</p>
          <p><span className="font-medium">Tempo:</span> {level.tempo || 'Not set'} BPM</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Band Members ({level.bandMembers?.length || 0})</h2>
        <div className="flex gap-4 mb-4">
          <button 
            className={`px-3 py-1 rounded ${editMode === 'start' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setEditMode('start')}
          >
            Edit Start Positions
          </button>
          <button 
            className={`px-3 py-1 rounded ${editMode === 'end' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setEditMode('end')}
          >
            Edit End Positions
          </button>
        </div>
        
        {level.bandMembers && level.bandMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {level.bandMembers.map(member => (
              <div 
                key={member.id} 
                className={`bg-gray-100 p-4 rounded cursor-pointer ${selectedMember === member.id ? 'border-2 border-blue-500' : ''}`}
                onClick={() => setSelectedMember(member.id)}
              >
                <h3 className="font-medium">{member.name}</h3>
                <p>Instrument: {member.instrument}</p>
                <p>Type: {member.instrument_type}</p>
                <p>Start Position: ({member.start_x || 'N/A'}, {member.start_y || 'N/A'})</p>
                <p>End Position: ({member.end_x || 'N/A'}, {member.end_y || 'N/A'})</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-4">No band members added yet</p>
        )}
        
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Add Band Member
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Formation Editor</h2>
        <div className="bg-gray-200 w-full h-[600px] rounded relative overflow-hidden" ref={canvasRef}>
          {/* PIXI.js canvas will be mounted here */}
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {selectedMember ? (
            <p>Editing {editMode} position for selected band member. Click on the canvas to position.</p>
          ) : (
            <p>Select a band member to edit their position.</p>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Save Changes
        </button>
        <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
          Cancel
        </button>
      </div>
    </div>
  );
} 