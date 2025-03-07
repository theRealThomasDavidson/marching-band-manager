export class MidiPlayer {
  private static audioContext: AudioContext | null = null;
  private static oscillators: OscillatorNode[] = [];
  private static gainNodes: GainNode[] = [];
  private static masterGain: GainNode | null = null;
  private static loopInterval: number | null = null;
  private static currentPatterns: Array<{
    notes: number[];
    lengths: number[];
    instrument: 'brass' | 'woodwind' | 'percussion';
    type: 'point' | 'counterpoint';
  }> = [];

  // Add volume control method
  static setMasterVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  private static async getAudioContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.5; // Reduce overall volume to prevent clipping
      this.masterGain.connect(this.audioContext.destination);
    }
    
    // Resume audio context if it's suspended (browsers often require user interaction)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    return this.audioContext;
  }

  private static getInstrumentWaveform(instrument: 'brass' | 'woodwind' | 'percussion'): OscillatorType {
    switch (instrument) {
      case 'brass':
        return 'sawtooth'; // Bright, brassy sound
      case 'woodwind':
        return 'sine'; // Smooth, mellow sound
      case 'percussion':
        return 'square'; // Sharp, percussive sound
      default:
        return 'sine';
    }
  }

  private static getInstrumentVolume(instrument: 'brass' | 'woodwind' | 'percussion'): number {
    switch (instrument) {
      case 'brass':
        return 0.2; // Brass is naturally loud
      case 'woodwind':
        return 0.25; // Woodwinds slightly louder for clarity
      case 'percussion':
        return 0.15; // Percussion a bit softer to not overpower
      default:
        return 0.2;
    }
  }

  private static midiNoteToFrequency(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  private static cleanup() {
    // Stop and disconnect all oscillators
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Ignore errors if oscillator is already stopped
      }
    });
    this.oscillators = [];

    // Disconnect all gain nodes
    this.gainNodes.forEach(gain => {
      try {
        gain.disconnect();
      } catch (e) {
        // Ignore errors if gain node is already disconnected
      }
    });
    this.gainNodes = [];

    // Clear loop interval if any
    if (this.loopInterval !== null) {
      window.clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
  }

  static stopAll() {
    this.cleanup();
  }

  static getCurrentPatterns() {
    return this.currentPatterns;
  }

  static clearPatterns() {
    this.currentPatterns = [];
  }

  private static async playPatternOnce(
    notes: number[],
    lengths: number[],
    instrument: 'brass' | 'woodwind' | 'percussion',
    tempo: number = 120,
    startTime: number = 0
  ) {
    console.log('playPatternOnce called with:', { notes, lengths, instrument, tempo, startTime });
    
    const ctx = await this.getAudioContext();
    console.log('Audio context state:', ctx.state);
    
    const waveform = this.getInstrumentWaveform(instrument);
    const volume = this.getInstrumentVolume(instrument);
    const ticksPerBeat = 480; // Standard MIDI ticks per beat
    const secondsPerTick = 60 / (tempo * ticksPerBeat);

    // Ensure startTime is not in the past
    const now = ctx.currentTime;
    console.log('Current audio context time:', now);
    startTime = Math.max(now, startTime);
    let currentTime = startTime;
    let maxEndTime = startTime;
    
    console.log('Starting note scheduling at time:', startTime);

    for (let i = 0; i < notes.length; i++) {
      const frequency = this.midiNoteToFrequency(notes[i]);
      const duration = Math.max(0.1, lengths[i] * secondsPerTick);
      
      console.log(`Scheduling note ${i}:`, {
        frequency,
        duration,
        noteTime: currentTime
      });

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = waveform;
      oscillator.frequency.value = frequency;
      
      // Ensure all scheduled times are in the future
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + duration - 0.01);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);
      
      oscillator.start(currentTime);
      oscillator.stop(currentTime + duration);
      
      this.oscillators.push(oscillator);
      this.gainNodes.push(gainNode);
      
      currentTime += duration;
      maxEndTime = Math.max(maxEndTime, currentTime);
    }

    return maxEndTime - startTime;
  }

  static async playPattern(
    notes: number[],
    lengths: number[],
    instrument: 'brass' | 'woodwind' | 'percussion',
    tempo: number = 120,
    startTime: number = 0,
    shouldLoop: boolean = false,
    type: 'point' | 'counterpoint' = 'point'
  ) {
    // Clean up any existing playback
    this.cleanup();
    
    const ctx = await this.getAudioContext();
    startTime = Math.max(ctx.currentTime, startTime || ctx.currentTime);
    
    // Add pattern to current patterns
    this.currentPatterns.push({ notes, lengths, instrument, type });
    
    const duration = await this.playPatternOnce(notes, lengths, instrument, tempo, startTime);
    
    if (shouldLoop) {
      // Set up looping
      const loopTime = duration * 1000; // Convert to milliseconds
      this.loopInterval = window.setInterval(async () => {
        const ctx = await this.getAudioContext();
        const nextStartTime = ctx.currentTime;
        await this.playPatternOnce(notes, lengths, instrument, tempo, nextStartTime);
      }, loopTime);
    }

    return duration;
  }

  static async playMultiplePatterns(patterns: Array<{
    notes: number[];
    lengths: number[];
    instrument: 'brass' | 'woodwind' | 'percussion';
    type?: 'point' | 'counterpoint';
  }>, shouldLoop: boolean = false, startTime: number = 0) {
    console.log('playMultiplePatterns called with:', {
      patternCount: patterns.length,
      shouldLoop,
      startTime
    });
    
    this.stopAll();
    this.clearPatterns();
    
    const ctx = await this.getAudioContext();
    console.log('Audio context after initialization:', {
      state: ctx.state,
      currentTime: ctx.currentTime,
      sampleRate: ctx.sampleRate
    });

    // First, calculate the duration of each pattern
    const patternDurations = await Promise.all(
      patterns.map(async pattern => {
        // Calculate base duration without actually playing
        let duration = 0;
        const ticksPerBeat = 480;
        const secondsPerTick = 60 / (120 * ticksPerBeat);
        
        for (let i = 0; i < pattern.lengths.length; i++) {
          duration += Math.max(0.1, pattern.lengths[i] * secondsPerTick);
        }
        
        console.log('Calculated pattern duration:', {
          instrument: pattern.instrument,
          duration,
          noteCount: pattern.notes.length
        });
        
        return { pattern, duration };
      })
    );

    // Store all patterns
    this.currentPatterns = patterns.map(p => ({
      ...p,
      type: p.type || 'point'
    }));

    // Find the shortest pattern duration for looping
    const shortestDuration = Math.min(...patternDurations.map(p => p.duration));
    console.log('Shortest pattern duration:', shortestDuration);

    // Calculate the actual start time using modulo
    const now = ctx.currentTime;
    const adjustedStartTime = now + (startTime % shortestDuration);
    console.log('Adjusted start time:', {
      now,
      startTime,
      adjustedStartTime
    });

    // Play all patterns with the adjusted start time
    console.log('Starting pattern playback...');
    patterns.forEach((pattern, index) => {
      console.log(`Playing pattern ${index}:`, {
        instrument: pattern.instrument,
        noteCount: pattern.notes.length,
        lengthCount: pattern.lengths.length
      });
      this.playPatternOnce(
        pattern.notes,
        pattern.lengths,
        pattern.instrument,
        120,
        adjustedStartTime
      );
    });

    if (shouldLoop) {
      console.log('Setting up loop with interval:', shortestDuration * 1000);
      // Set up looping based on shortest pattern
      const loopTime = shortestDuration * 1000; // Convert to milliseconds
      this.loopInterval = window.setInterval(async () => {
        const ctx = await this.getAudioContext();
        patterns.forEach(pattern => {
          this.playPatternOnce(
            pattern.notes,
            pattern.lengths,
            pattern.instrument,
            120,
            ctx.currentTime
          );
        });
      }, loopTime);
    }

    return shortestDuration;
  }
} 