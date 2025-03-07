# Web Workers

This directory contains web workers used for handling computationally intensive tasks in the background.

## Workers

- `midi-worker.js` - MIDI file generation and processing
- `audio-worker.js` - Audio synthesis and playback

## Usage

Each worker is designed to handle specific tasks without blocking the main thread:

1. **MIDI Worker** (`midi-worker.js`)
   - Generates MIDI files from pattern data
   - Processes MIDI file imports
   - Handles MIDI file exports

2. **Audio Worker** (`audio-worker.js`)
   - Synthesizes audio from MIDI data
   - Handles real-time audio playback
   - Manages audio buffer processing

## Implementation

Workers communicate with the main thread using the standard Web Worker API:

```javascript
// Main thread
const worker = new Worker('/workers/midi-worker.js');
worker.postMessage({ type: 'generate', data: patternData });
worker.onmessage = (e) => {
  const { midiFile } = e.data;
  // Handle the generated MIDI file
};

// Worker thread
self.onmessage = (e) => {
  const { type, data } = e.data;
  switch (type) {
    case 'generate':
      const midiFile = generateMidiFile(data);
      self.postMessage({ midiFile });
      break;
  }
};
```

## Error Handling

Workers include robust error handling to manage:
- Invalid input data
- Resource limitations
- Processing failures

Errors are communicated back to the main thread with appropriate error codes and messages. 