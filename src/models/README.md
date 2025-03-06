# Models Directory

This directory contains the data models (MVC-Model) for the marching band manager application.

## Structure

- `level.ts` - Level model definition
- `state.ts` - Game state models
- `BandMember.ts` - Band member model
- `BandMemberState.ts` - Band member state during gameplay
- `midi-track.ts` - MIDI track model
- `midi-note.ts` - MIDI note model

## Purpose

The models directory defines the core data structures and types used throughout the application. These models represent the business logic layer and ensure type safety across the application.

## Key Models

1. **Level** (`level.ts`)
   ```typescript
   interface Level {
     id: string;
     name: string;
     author: string;
     musicTheme: string;
     createdAt: Date;
     updatedAt: Date;
     plays: number;
     band: BandMember[];
   }
   ```

2. **Band Member** (`BandMember.ts`)
   ```typescript
   interface BandMember {
     id: string;
     instrumentType: 'brass' | 'woodwind' | 'percussion';
     startPosition: { x: number, y: number };
     targetPosition: { x: number, y: number };
     midiTrack: MIDITrack;
     radius: number;
     speed: number;
   }
   ```

3. **MIDI Track** (`midi-track.ts`)
   ```typescript
   interface MIDITrack {
     notes: MIDINote[];
     tempo: number;
     instrument: number;
     duration: number;
   }
   ```

4. **MIDI Note** (`midi-note.ts`)
   ```typescript
   interface MIDINote {
     pitch: number;
     startTime: number;
     endTime: number;
     velocity: number;
   }
   ```

## Model Guidelines

1. Type Safety:
   - Use TypeScript interfaces/types
   - Define strict type constraints
   - Include proper documentation

2. Validation:
   - Include validation rules
   - Define data constraints
   - Handle edge cases

3. Relations:
   - Define clear model relationships
   - Include proper foreign key references
   - Handle circular dependencies 