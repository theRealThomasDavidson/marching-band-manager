import { useEffect, useRef, useState } from 'react';
import { BandMember, BandMemberState } from '@/models/BandMember';
import { MidiPlayer } from '@/services/MidiPlayer';

interface FormationBoardProps {
  members: BandMember[];
  width: number;
  height: number;
}

// Add utility functions for coordinate conversion
const FIELD_WIDTH = 100; // yards
const FIELD_HEIGHT = 54; // yards

// Add modulo function for proper number wrapping
declare global {
  interface Number {
    mod(n: number): number;
  }
}

Number.prototype.mod = function(n: number): number {
  "use strict";
  return ((this as number % n) + n) % n;
};

function yardsToPixels(yards: { x: number, y: number }, canvasWidth: number, canvasHeight: number) {
  return {
    x: (yards.x / FIELD_WIDTH) * canvasWidth,
    y: (yards.y / FIELD_HEIGHT) * canvasHeight
  };
}

function pixelsToYards(pixels: { x: number, y: number }, canvasWidth: number, canvasHeight: number) {
  return {
    x: (pixels.x / canvasWidth) * FIELD_WIDTH,
    y: (pixels.y / canvasHeight) * FIELD_HEIGHT
  };
}

const COLORS = {
  brass: '#FFD700',      // Gold
  woodwind: '#90EE90',   // Light green
  percussion: '#FF69B4'  // Hot pink
};

interface GameState {
  bandStates: BandMemberState[];
  time: number;
}

export default function FormationBoard({ members, width, height }: FormationBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const consolidatedPatternsRef = useRef<{
    notes: number[];
    lengths: number[];
    instrument: 'brass' | 'woodwind' | 'percussion';
    type: 'point';
  }[]>([]);
  const gameStateRef = useRef<GameState>({
    bandStates: members.map(member => ({
      member,
      position: { x: member.start_x, y: member.start_y },
      moving: 1 as 0 | 1 | -1
    })),
    time: 0
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDebugGrid, setShowDebugGrid] = useState(false);
  const [uiUpdateTrigger, setUiUpdateTrigger] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  // Helper function to map instrument types
  const mapInstrumentType = (instrumentType: string): 'brass' | 'woodwind' | 'percussion' => {
    // Map specific instruments to their categories
    const instrumentMap: Record<string, 'brass' | 'woodwind' | 'percussion'> = {
      'tuba': 'brass',
      'trumpet': 'brass',
      'trombone': 'brass',
      'french horn': 'brass',
      'flute': 'woodwind',
      'clarinet': 'woodwind',
      'saxophone': 'woodwind',
      'oboe': 'woodwind',
      'snare': 'percussion',
      'bass drum': 'percussion',
      'cymbals': 'percussion'
    };
    return instrumentMap[instrumentType.toLowerCase()] || 'brass'; // Default to brass if unknown
  };

  // Update the consolidation effect
  useEffect(() => {
    console.log('Starting pattern consolidation...');
    console.log('Raw members data:', JSON.stringify(members, null, 2));
    
    consolidatedPatternsRef.current = members
      .filter(member => {
        const hasNotes = Array.isArray(member.midi_track_notes) && member.midi_track_notes.length > 0;
        const hasLengths = Array.isArray(member.midi_track_lengths) && member.midi_track_lengths.length > 0;
        console.log(`Member ${member.name} validation:`, {
          hasNotes,
          hasLengths,
          noteCount: member.midi_track_notes?.length,
          lengthCount: member.midi_track_lengths?.length,
          notes: member.midi_track_notes,
          lengths: member.midi_track_lengths,
          tempo: member.midi_track_tempo,
          instrument: member.midi_track_instrument,
          instrument_type: member.instrument_type,
          instrumentType: member.instrumentType
        });
        return hasNotes && hasLengths;
      })
      .map(member => {
        // Try all possible instrument type fields
        const instrumentType = member.instrument_type || member.instrumentType || member.instrument;
        const mappedInstrument = mapInstrumentType(instrumentType);
        const pattern = {
          notes: member.midi_track_notes!,
          lengths: member.midi_track_lengths!,
          instrument: mappedInstrument,
          type: 'point' as const
        };
        console.log(`Created pattern for ${member.name}:`, {
          ...pattern,
          noteCount: pattern.notes.length,
          lengthCount: pattern.lengths.length,
          originalInstrument: instrumentType,
          mappedInstrument,
          tempo: member.midi_track_tempo,
          midiInstrument: member.midi_track_instrument
        });
        return pattern;
      });

    console.log('Final consolidated patterns:', {
      count: consolidatedPatternsRef.current.length,
      patterns: JSON.stringify(consolidatedPatternsRef.current, null, 2)
    });
  }, [members]);

  // Update toggleMusic with more logging
  const toggleMusic = () => {
    console.log('Music toggle pressed. Current state:', {
      isMusicPlaying,
      patternsAvailable: consolidatedPatternsRef.current.length,
      currentTime: gameStateRef.current.time,
      patterns: JSON.stringify(consolidatedPatternsRef.current, null, 2)
    });

    if (isMusicPlaying) {
      console.log('Stopping music playback');
      MidiPlayer.stopAll();
      setIsMusicPlaying(false);
    } else {
      console.log('Attempting to start music playback');
      if (consolidatedPatternsRef.current.length > 0) {
        console.log('Starting playback with patterns:', {
          count: consolidatedPatternsRef.current.length,
          patterns: consolidatedPatternsRef.current.map(p => ({
            instrument: p.instrument,
            noteCount: p.notes.length,
            lengthCount: p.lengths.length,
            notes: p.notes,
            lengths: p.lengths
          }))
        });
        const currentTime = gameStateRef.current.time;
        console.log('Using current game time:', currentTime);
        
        try {
          MidiPlayer.playMultiplePatterns(consolidatedPatternsRef.current, true, currentTime);
          console.log('Successfully started playback');
          setIsMusicPlaying(true);
        } catch (error) {
          console.error('Error starting playback:', error);
        }
      } else {
        console.warn('No patterns available to play');
      }
    }
  };

  // Update cleanup to stop music
  useEffect(() => {
    return () => {
      MidiPlayer.stopAll();
    };
  }, []);

  // Update togglePlay to handle music
  const togglePlay = () => {
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    
    // Start/stop music with the game
    if (newIsPlaying && !isMusicPlaying) {
      if (consolidatedPatternsRef.current.length > 0) {
        MidiPlayer.playMultiplePatterns(consolidatedPatternsRef.current, true, gameStateRef.current.time);
        setIsMusicPlaying(true);
      }
    } else if (!newIsPlaying && isMusicPlaying) {
      MidiPlayer.stopAll();
      setIsMusicPlaying(false);
    }
    
    // Trigger UI update
    setUiUpdateTrigger(prev => prev + 1);
  };

  // Update resetGame to stop music
  const resetGame = () => {
    setIsPlaying(false);
    setIsVictory(false);
    setIsMusicPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Stop any playing music
    MidiPlayer.stopAll();

    gameStateRef.current = {
      bandStates: members.map(member => ({
        member,
        position: { x: member.start_x, y: member.start_y },
        moving: 1 as 0 | 1 | -1
      })),
      time: 0
    };
    
    // Trigger UI update
    setUiUpdateTrigger(prev => prev + 1);
    
    // Force an immediate frame render
    renderFrame();
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const rawPixels = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    // Convert click to yard coordinates
    let clickYards = pixelsToYards(rawPixels, width, height);
    clickYards.x = clickYards.x * 0.6798866855524079;
    clickYards.y = clickYards.y * 0.6763285024154589;
    console.log('Click position (yards):', clickYards);
    let clickedMember = false;
    const currentState = gameStateRef.current;
    
    currentState.bandStates.forEach(state => {
        const memberPos = state.position;
      console.log(`${state.member.name} position:`, memberPos);
      
        const scaledMemberPos = {
          x: memberPos.x,
          y: memberPos.y 
        };
        const clickRadius = state.member.radius;

        const distance = Math.sqrt(
          Math.pow(clickYards.x - scaledMemberPos.x, 2) + 
          Math.pow(clickYards.y - scaledMemberPos.y, 2)
        );

        if (distance <= clickRadius) {
          clickedMember = true;
        state.moving = state.moving === 1 ? 0 : 1;
        console.log(`Clicked ${state.member.name} - New state:`, {
          position: memberPos,
          moving: state.moving
        });
      }
    });

    if (clickedMember) {
      // Trigger UI update
      setUiUpdateTrigger(prev => prev + 1);
      // Force immediate render to show the change
      renderFrame();
    }
  };

  // Separate rendering function to avoid duplication
  const renderFrame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const currentState = gameStateRef.current;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(0, 0, width, height);

    // Draw victory overlay if victory achieved
    if (isVictory) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.2)'; // Semi-transparent gold
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Formation Complete!', width / 2, height / 2);
    }

    // Draw yard lines
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    for (let yard = 0; yard <= FIELD_WIDTH; yard += 5) {
      const linePos = yardsToPixels({ x: yard, y: 0 }, width, height);
      ctx.beginPath();
      ctx.moveTo(linePos.x, 0);
      ctx.lineTo(linePos.x, height);
      ctx.stroke();

      if (yard % 10 === 0 && yard !== 0 && yard !== FIELD_WIDTH) {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(yard.toString(), linePos.x, 20);
        ctx.restore();
      }
    }

    // Draw band members using yardsToPixels
    currentState.bandStates.forEach(state => {
      const pixelPos = yardsToPixels(state.position, width, height);
      const member = state.member;

      // Color mapping
      let color = '#FFFFFF';
      const mappedInstrument = mapInstrumentType(member.instrument_type || member.instrument);
      if (mappedInstrument === 'brass') {
        color = COLORS.brass;
      } else if (mappedInstrument === 'woodwind') {
        color = COLORS.woodwind;
      } else if (mappedInstrument === 'percussion') {
        color = COLORS.percussion;
      }

      // Draw member circle
      ctx.beginPath();
      const scaledRadius = (member.radius / FIELD_WIDTH) * width;
      ctx.arc(pixelPos.x, pixelPos.y, scaledRadius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw member name
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(member.name, pixelPos.x, pixelPos.y + scaledRadius + 15);

      // Draw stop indicator when member is stopped
      if (state.moving === 0) {
        // Draw red octagon (stop sign) behind the member
        const stopRadius = scaledRadius * .4;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI / 4) + Math.PI / 8;
          const x = pixelPos.x + stopRadius * Math.cos(angle);
          const y = pixelPos.y + stopRadius * Math.sin(angle);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';  // Semi-transparent red
        ctx.fill();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw legend
    const legendY = height - 30;
    Object.entries(COLORS).forEach(([type, color], index) => {
      const legendX = 10 + index * 120;
      ctx.beginPath();
      ctx.arc(legendX, legendY, 8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = 'black';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(type.charAt(0).toUpperCase() + type.slice(1), legendX + 15, legendY + 5);
    });

    // Draw debug grid if enabled
    if (showDebugGrid) {
      drawDebugGrid(ctx);
    }
  };

  const drawDebugGrid = (ctx: CanvasRenderingContext2D) => {
    // Draw debug grid every yard
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 0.5;

    // Vertical lines (every yard)
    for (let x = 0; x <= FIELD_WIDTH; x++) {
      const pos = yardsToPixels({ x, y: 0 }, width, height);
      ctx.beginPath();
      ctx.moveTo(pos.x, 0);
      ctx.lineTo(pos.x, height);
      ctx.stroke();
    }

    // Horizontal lines (every yard)
    for (let y = 0; y <= FIELD_HEIGHT; y++) {
      const pos = yardsToPixels({ x: 0, y }, width, height);
      ctx.beginPath();
      ctx.moveTo(0, pos.y);
      ctx.lineTo(width, pos.y);
      ctx.stroke();

      // Add y-coordinate labels on both sides
      if (y % 5 === 0) {
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(y.toString(), 5, pos.y);
        ctx.textAlign = 'right';
        ctx.fillText(y.toString(), width - 5, pos.y);
      }
    }
  };

  useEffect(() => {
    let lastTime = 0;

    const animate = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Update positions if playing
      if (isPlaying) {
        const currentState = gameStateRef.current;
        
        // Check if all members have stopped
        const allStopped = currentState.bandStates.every(state => state.moving === 0);
        if (allStopped) {
          console.log("All band members have stopped!");
          setIsPlaying(false);
          // Check if they're all at their destinations
          const allAtDestination = currentState.bandStates.every(state => 
            Math.abs(state.position.x - state.member.end_x) < 0.01 && 
            Math.abs(state.position.y - state.member.end_y) < 0.01
          );
          if (allAtDestination) {
            console.log("Formation complete! All members at their destinations.");
            setIsVictory(true);
          } else {
            console.log("Formation incomplete - some members stopped before reaching destination.");
          }
        }

        currentState.bandStates.forEach(state => {
          const member = state.member;
          
          // Calculate direction vector
          const dx = member.end_x - member.start_x;
          const dy = member.end_y - member.start_y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Normalize direction vector
          const dirX = dx / distance;
          const dirY = dy / distance;
          
          // Calculate new position using moving state as multiplier
          const moveAmount = member.speed * state.moving * deltaTime;
          
          // Update position directly
          state.position.x += dirX * moveAmount;
          state.position.y += dirY * moveAmount;

          // Check if we've reached or passed the destination
          const newDx = member.end_x - state.position.x;
          const newDy = member.end_y - state.position.y;
          
          // If we've passed the end point, clamp to it
          if ((dx * newDx) <= 0 && (dy * newDy) <= 0) {
            state.moving = 0;
            state.position.x = member.end_x;
            state.position.y = member.end_y;
          }
        });

        // Check for collisions
        let hasCollisions = false;
        for (let i = 0; i < currentState.bandStates.length; i++) {
          const state1 = currentState.bandStates[i];
          
          for (let j = i + 1; j < currentState.bandStates.length; j++) {
            const state2 = currentState.bandStates[j];

            // Calculate distance between members
            const dx = state1.position.x - state2.position.x;
            const dy = state1.position.y - state2.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Check if distance is less than sum of radii
            const sumOfRadii = (state1.member.radius + state2.member.radius);
            if (distance < sumOfRadii) {
              console.log(`Collision detected between ${state1.member.name} and ${state2.member.name}!`);
              console.log(`Distance: ${distance}, Required: ${sumOfRadii}`);
              hasCollisions = true;
              break;
            }
          }
          if (hasCollisions) break;
        }

        if (hasCollisions) {
          console.log("Formation halted due to collision!");
          setIsPlaying(false);
        }

        // Update time
        currentState.time += deltaTime;

        // Trigger UI update occasionally (e.g., every 100ms)
        if (Math.floor(currentState.time * 10) !== Math.floor((currentState.time + deltaTime) * 10)) {
          setUiUpdateTrigger(prev => prev + 1);
        }
      }

      renderFrame();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [members, width, height, isPlaying, showDebugGrid]);

  // Calculate average progress from current ref state
  const averageProgress = gameStateRef.current.bandStates.reduce((sum, state) => {
    const member = state.member;
    const totalDistance = Math.sqrt(
      Math.pow(member.end_x - member.start_x, 2) + 
      Math.pow(member.end_y - member.start_y, 2)
    );
    const currentDistance = Math.sqrt(
      Math.pow(state.position.x - member.start_x, 2) + 
      Math.pow(state.position.y - member.start_y, 2)
    );
    return sum + (currentDistance / totalDistance);
  }, 0) / gameStateRef.current.bandStates.length;

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    MidiPlayer.setMasterVolume(newVolume);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <button
            onClick={togglePlay}
            className={`px-4 py-2 ${isVictory ? 'bg-yellow-500' : 'bg-blue-500'} text-white rounded-md hover:${isVictory ? 'bg-yellow-600' : 'bg-blue-600'}`}
          >
            {isPlaying ? 'Pause' : (isVictory ? 'Watch Again' : 'Play')}
          </button>
          <button
            onClick={toggleMusic}
            className={`px-4 py-2 ${isMusicPlaying ? 'bg-red-500' : 'bg-green-500'} text-white rounded-md hover:${isMusicPlaying ? 'bg-red-600' : 'bg-green-600'}`}
            disabled={consolidatedPatternsRef.current.length === 0}
          >
            {isMusicPlaying ? 'Stop Music' : 'Play Music'}
          </button>
          <button
            onClick={resetGame}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            onClick={() => setShowDebugGrid(!showDebugGrid)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            {showDebugGrid ? 'Hide Grid' : 'Show Grid'}
          </button>
          <div className="inline-flex items-center space-x-2">
            <span className="text-sm text-gray-600">Volume:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-gray-600">
            Progress: {Math.round(averageProgress * 100)}%
          </div>
          <div className="text-gray-600">
            Time: {gameStateRef.current.time.toFixed(1)}s
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleCanvasClick}
        className="w-full h-full border border-gray-300 rounded-lg cursor-pointer"
      />
    </div>
  );
} 