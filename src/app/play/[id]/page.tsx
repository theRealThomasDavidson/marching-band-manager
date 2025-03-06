'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Level } from '@/models/Level';
import { BandMember } from '@/models/BandMember';
import * as PIXI from 'pixi.js';
import * as Tone from 'tone';

/**
 * Gameplay page - plays a marching band formation with animations and music
 */
export default function PlayLevel() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  
  // Animation refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const memberSpritesRef = useRef<Record<string, PIXI.Sprite>>({});
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Audio refs
  const tonejsInitialized = useRef<boolean>(false);
  const synthsRef = useRef<Record<string, Tone.PolySynth>>({});
  
  // Animation settings
  const animationDuration = 30; // seconds
  
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
        setPlaybackDuration(data.duration_seconds || animationDuration);
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
    
    // Cleanup animation frame on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [id]);

  // Initialize PIXI canvas
  useEffect(() => {
    if (!canvasRef.current || !level || appRef.current) return;

    // Create PIXI application
    const app = new PIXI.Application({
      backgroundColor: 0x4e7c38, // Green field color
      width: 800,
      height: 600,
      antialias: true,
    });
    
    // Add to DOM
    canvasRef.current.appendChild(app.view as unknown as Node);
    appRef.current = app;

    // Add field markings
    drawFieldMarkings(app);
    
    // Add band members
    if (level.bandMembers && level.bandMembers.length > 0) {
      level.bandMembers.forEach(member => {
        const sprite = createBandMemberSprite(member);
        app.stage.addChild(sprite);
        memberSpritesRef.current[member.id] = sprite;
      });
    }

    // Initialize Tone.js if not already
    if (!tonejsInitialized.current) {
      // Create synths for each band member if they have MIDI tracks
      if (level.bandMembers) {
        level.bandMembers.forEach(member => {
          if (member.midiTracks && member.midiTracks.length > 0) {
            // Create a synth for this band member
            const synth = new Tone.PolySynth(Tone.Synth).toDestination();
            synthsRef.current[member.id] = synth;
          }
        });
      }
      tonejsInitialized.current = true;
    }

    // Clean up on unmount
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
      
      // Dispose synths
      Object.values(synthsRef.current).forEach(synth => synth.dispose());
      synthsRef.current = {};
      
      memberSpritesRef.current = {};
    };
  }, [level]);

  // Draw field markings
  const drawFieldMarkings = (app: PIXI.Application) => {
    const field = new PIXI.Graphics();
    
    // Field outline
    field.lineStyle(3, 0xffffff);
    field.drawRect(10, 10, app.screen.width - 20, app.screen.height - 20);
    
    // Yard lines (horizontal)
    field.lineStyle(1, 0xffffff);
    const yardCount = 10;
    const yardSpacing = (app.screen.height - 40) / yardCount;
    
    for (let i = 1; i < yardCount; i++) {
      const y = 10 + i * yardSpacing;
      field.moveTo(10, y);
      field.lineTo(app.screen.width - 10, y);
    }
    
    // Add hash marks
    field.lineStyle(1, 0xffffff, 0.5);
    const hashCount = 20;
    const hashSpacing = (app.screen.width - 20) / hashCount;
    
    for (let i = 0; i <= hashCount; i++) {
      const x = 10 + i * hashSpacing;
      for (let j = 1; j < yardCount; j++) {
        const y = 10 + j * yardSpacing;
        field.moveTo(x - 5, y);
        field.lineTo(x + 5, y);
      }
    }
    
    app.stage.addChild(field);
  };
  
  // Create a band member sprite
  const createBandMemberSprite = (member: BandMember): PIXI.Sprite => {
    // Create circle sprite
    const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    sprite.tint = getInstrumentColor(member.instrumentType);
    sprite.width = sprite.height = member.radius * 20 || 30;
    sprite.anchor.set(0.5);
    
    // Position at start position
    sprite.position.set(member.start_x || 100, member.start_y || 100);
    
    // Add label with member name
    const style = new PIXI.TextStyle({
      fontSize: 10,
      fontWeight: 'bold',
      fill: 0xffffff,
      align: 'center'
    });
    const text = new PIXI.Text(member.name.substring(0, 3), style);
    text.anchor.set(0.5);
    sprite.addChild(text);
    
    return sprite;
  };
  
  // Start playback
  const startPlayback = async () => {
    if (!level || !appRef.current) return;
    
    try {
      // Initialize Tone.js
      await Tone.start();
      Tone.Transport.cancel(); // Clear any previous schedules
      
      // Set up music if available
      if (level.bandMembers) {
        level.bandMembers.forEach(member => {
          if (member.midiTracks && member.midiTracks.length > 0) {
            const synth = synthsRef.current[member.id];
            if (!synth) return;
            
            // For simplicity, just use the first track
            // Note: We would use track.track_data in a complete implementation
            // const track = member.midiTracks[0];
            
            // In a real implementation, you would parse track_data and schedule notes
            // This is a simplified version for demo purposes
            const notes = ['C4', 'E4', 'G4', 'C5'];
            const noteDuration = '8n';
            
            for (let i = 0; i < 8; i++) {
              Tone.Transport.schedule((time) => {
                synth.triggerAttackRelease(notes[i % notes.length], noteDuration, time);
              }, i * 0.5);
            }
          }
        });
      }
      
      // Start the transport
      Tone.Transport.start();
      
      // Start animation
      setIsPlaying(true);
      startTimeRef.current = Date.now();
      
      // Start animation loop
      animateFrame();
    } catch (err) {
      console.error('Error starting audio playback:', err);
      alert('Failed to start audio. Please try again.');
    }
  };
  
  // Stop playback
  const stopPlayback = () => {
    // Stop Tone.js transport
    Tone.Transport.stop();
    
    // Stop animation
    setIsPlaying(false);
    setPlaybackTime(0);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Reset sprites to starting positions
    if (level?.bandMembers) {
      level.bandMembers.forEach(member => {
        const sprite = memberSpritesRef.current[member.id];
        if (sprite) {
          sprite.position.set(member.start_x || 100, member.start_y || 100);
        }
      });
    }
  };
  
  // Animation loop
  const animateFrame = () => {
    if (!level || !isPlaying) return;
    
    const currentTime = (Date.now() - startTimeRef.current) / 1000;
    const progress = Math.min(currentTime / playbackDuration, 1);
    
    setPlaybackTime(currentTime);
    
    // Update position of each band member
    if (level.bandMembers) {
      level.bandMembers.forEach(member => {
        const sprite = memberSpritesRef.current[member.id];
        if (!sprite) return;
        
        const startX = member.start_x || 100;
        const startY = member.start_y || 100;
        const endX = member.end_x || 300;
        const endY = member.end_y || 300;
        
        // Linear interpolation between start and end positions
        const newX = startX + (endX - startX) * progress;
        const newY = startY + (endY - startY) * progress;
        
        // Update sprite position
        sprite.position.set(newX, newY);
      });
    }
    
    // End the animation if complete
    if (progress >= 1) {
      setIsPlaying(false);
      return;
    }
    
    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(animateFrame);
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      <h1 className="text-2xl font-bold mb-4">Playing: {level.name}</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <div className="flex justify-between">
          <div>
            <p><span className="font-medium">Song:</span> {level.song_title || 'Not set'}</p>
            <p><span className="font-medium">Tempo:</span> {level.tempo || 'Not set'} BPM</p>
            <p><span className="font-medium">Band Members:</span> {level.bandMembers?.length || 0}</p>
          </div>
          <div className="flex items-center">
            <button
              onClick={isPlaying ? stopPlayback : startPlayback}
              className={`px-6 py-2 rounded font-medium ${isPlaying
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isPlaying ? 'Stop' : 'Play'}
            </button>
          </div>
        </div>
        
        {/* Playback progress */}
        {isPlaying && (
          <div className="mt-3">
            <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full"
                style={{ width: `${(playbackTime / playbackDuration) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1 text-gray-600">
              <span>{formatTime(playbackTime)}</span>
              <span>{formatTime(playbackDuration)}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Canvas for field and band member visualization */}
      <div className="bg-gray-200 w-full h-[600px] rounded relative overflow-hidden" ref={canvasRef}>
        {/* PIXI.js canvas will be mounted here */}
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => router.push('/editor/level/' + id)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Edit This Level
        </button>
      </div>
    </div>
  );
} 