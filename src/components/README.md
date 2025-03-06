# Components Directory

This directory contains all reusable React components for the marching band manager application.

## Structure

- `/game-container/` - Components for the game container
- `/player/` - Components for the game player

## Purpose

The components directory holds all shared React components that can be reused across different pages and features of the application. Each component should be modular, well-documented, and follow React best practices.

## Key Components

1. **Game Container** (`/game-container/`)
   - Main game wrapper component
   - Game state management
   - Rendering coordination
   - Event handling
   - Canvas management
   - Animation framework

2. **Player** (`/player/`)
   - Game playback controls
   - MIDI playback integration
   - Band member movement controls
   - Formation visualization
   - Performance feedback
   - Score display

## Component Guidelines

1. Each component should:
   - Be a single responsibility component (SRP)
   - Have proper TypeScript typing
   - Include necessary unit tests
   - Be properly documented
   - Use proper prop validation

2. State Management:
   - Use appropriate state management (local vs global)
   - Implement proper error boundaries
   - Handle loading states

3. Performance:
   - Implement proper memoization where needed
   - Use React.memo for expensive renders
   - Optimize re-renders
   - Handle cleanup in useEffect 