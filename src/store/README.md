# Store Directory

This directory contains the state management implementation using Redux Toolkit.

## Structure

- `/slices/` - Redux Toolkit slices
- `index.ts` - Store configuration and setup

## Purpose

The store directory manages the global application state using Redux Toolkit. It provides a centralized location for state management and handles complex state interactions across the application.

## Key Components

1. **Store Configuration** (`index.ts`)
   - Redux store setup
   - Middleware configuration
   - DevTools setup
   - Type definitions

2. **Slices** (`/slices/`)
   - Game state slice
   - User state slice
   - Level state slice
   - Audio state slice
   - UI state slice

## State Management Guidelines

1. Slice Structure:
   - Follow Redux Toolkit patterns
   - Implement proper typing
   - Use proper action naming
   - Maintain immutability

2. Performance:
   - Optimize selectors
   - Implement proper memoization
   - Handle state updates efficiently
   - Monitor store size

3. Testing:
   - Test reducers
   - Test selectors
   - Test async actions
   - Test middleware

## Usage Example

```typescript
// Slice definition
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
  isPlaying: boolean;
  score: number;
  currentLevel: string;
}

const gameSlice = createSlice({
  name: 'game',
  initialState: {
    isPlaying: false,
    score: 0,
    currentLevel: null
  } as GameState,
  reducers: {
    setPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    updateScore: (state, action: PayloadAction<number>) => {
      state.score = action.payload;
    }
  }
});

// Store usage
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';

const GameComponent = () => {
  const dispatch = useDispatch();
  const score = useSelector((state: RootState) => state.game.score);
  
  // Use dispatch and state as needed
};
``` 