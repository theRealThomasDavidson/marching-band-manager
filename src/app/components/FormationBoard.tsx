import { useEffect, useRef, useState } from 'react';
import { BandMember, BandMemberState } from '@/models/BandMember';

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
  // This state is only used to trigger re-renders for UI updates
  const [uiUpdateTrigger, setUiUpdateTrigger] = useState(0);

  const togglePlay = () => {
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    
    // When pressing play, ensure all non-finished members start moving
    if (newIsPlaying) {
      const currentState = gameStateRef.current;
      
      currentState.bandStates.forEach(state => {
        const member = state.member;
        const progress = Math.sqrt(
          Math.pow(state.position.x - member.start_x, 2) + 
          Math.pow(state.position.y - member.start_y, 2)
        ) / Math.sqrt(
          Math.pow(member.end_x - member.start_x, 2) + 
          Math.pow(member.end_y - member.start_y, 2)
        );
        
      });
      
      // Trigger UI update
      setUiUpdateTrigger(prev => prev + 1);
    }
  };

  const resetGame = () => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

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
    clickYards.x = clickYards.x * 1.182654;
    clickYards.y = clickYards.y * 1.182654;

    let clickedMember = false;
    const currentState = gameStateRef.current;
    
    currentState.bandStates.forEach(state => {
      console.log(`${state.member.name}: ${state.moving}`);
      const memberPos = state.position;
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
        // Toggle between moving (1) and stopped (0)
        state.moving = state.moving === 1 ? 0 : 1;
        console.log(`${state.member.name}: Toggling movement state from ${state.moving === 0 ? 1 : 0} to ${state.moving}`);
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
      if (member.instrumentType === 'brass') {
        color = COLORS.brass;
      } else if (member.instrumentType === 'woodwind') {
        color = COLORS.woodwind;
      } else if (member.instrumentType === 'percussion') {
        color = COLORS.percussion;
      }

      // Draw member circle
      ctx.beginPath();
      ctx.arc(pixelPos.x, pixelPos.y, member.radius * 10, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw member name
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(member.name, pixelPos.x, pixelPos.y + member.radius * 10 + 15);

      // Draw stop indicator when member is stopped
      if (state.moving === 0) {
        // Draw red octagon (stop sign) behind the member
        const stopRadius = member.radius * 4;
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
        
        // Modify states in place instead of creating new ones
        currentState.bandStates.forEach(state => {
          const member = state.member;
          
          // Debug log for movement state and current position
          console.log(`${member.name}: Movement Check:`, {
            moving: state.moving,
            speed: state.member.speed * state.moving
          });

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
            console.log(`${member.name}: Reached destination`);
            state.moving = 0;
            state.position.x = member.end_x;
            state.position.y = member.end_y;
          }

          console.log(`${member.name}: Movement Update:`, {
            moveAmount,
            position: state.position,
            moving: state.moving
          });
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <button
            onClick={togglePlay}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {isPlaying ? 'Pause' : (averageProgress >= 1 ? 'Replay' : 'Play')}
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