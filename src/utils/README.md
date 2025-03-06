# Utils Directory

This directory contains miscellaneous utility functions and modules.

## Structure

- `/audio/` - Audio writing and playing utilities
- Other utility modules as needed

## Purpose

The utils directory provides utility functions and helper modules that are used across the application. It focuses on reusable, pure functions that handle common tasks and calculations.

## Key Components

1. **Audio Utilities** (`/audio/`)
   - Audio file handling
   - MIDI file processing
   - Sound synthesis
   - Audio format conversion
   - Playback controls

2. **Common Utilities**
   - Math functions
   - Data transformations
   - Validation helpers
   - Type guards
   - Format converters

## Utility Guidelines

1. Function Design:
   - Keep functions pure
   - Use proper typing
   - Handle edge cases
   - Document parameters

2. Performance:
   - Optimize algorithms
   - Minimize dependencies
   - Cache results when appropriate
   - Handle memory efficiently

3. Testing:
   - Include unit tests
   - Test edge cases
   - Verify performance
   - Document test cases

## Best Practices

1. Code Organization:
   - Group related utilities
   - Use descriptive names
   - Maintain single responsibility
   - Document complex logic

2. Error Handling:
   - Use proper error types
   - Validate inputs
   - Handle edge cases
   - Provide meaningful messages

3. Documentation:
   - Include JSDoc comments
   - Provide examples
   - Document parameters
   - Note side effects

## Example Usage

```typescript
// Audio utility example
export const convertMIDIToAudio = async (
  midiData: Uint8Array,
  options: {
    format: 'mp3' | 'wav';
    sampleRate: number;
  }
): Promise<ArrayBuffer> => {
  try {
    // Implementation
    return audioBuffer;
  } catch (error) {
    throw new Error(`MIDI conversion failed: ${error.message}`);
  }
};

// Math utility example
export const calculateFormationSpacing = (
  memberCount: number,
  areaWidth: number,
  areaHeight: number
): { x: number; y: number }[] => {
  // Implementation
  return positions;
};
``` 