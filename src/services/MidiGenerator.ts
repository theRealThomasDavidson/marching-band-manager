import MidiWriter from 'midi-writer-js';

export class AudioGenerator {
  generateMidiTrack(instrumentType: 'brass' | 'woodwind' | 'percussion') {
    const track = new MidiWriter.Track();
    
    // Set 4/4 time signature (numerator, denominator, clocks per tick, notes per quarter)
    track.setTimeSignature(4, 4, 24, 8);
    
    // Add some default notes based on instrument type
    const notes = instrumentType === 'percussion' 
      ? [35, 38, 42, 46] // Basic drum pattern
      : [60, 64, 67, 72]; // Basic melody in C major
      
    const durations = ['4', '4', '4', '4']; // Quarter notes
    
    notes.forEach((note, index) => {
      track.addEvent(new MidiWriter.NoteEvent({
        pitch: [note],
        duration: durations[index],
        velocity: 100
      }));
    });
    
    const write = new MidiWriter.Writer(track);
    
    return {
      instrument_number: instrumentType === 'percussion' ? 115 : 
                        instrumentType === 'brass' ? 56 : 73,
      duration: 4,
      track_data: {
        notes,
        lengths: [480, 480, 480, 480], // Each note is 1 beat (480 ticks)
        tempo: 120,
        duration: 4
      },
      track_number: 0
    };
  }

  static downloadMidi(notes: number[], lengths: number[], filename: string) {
    const track = new MidiWriter.Track();
    track.setTimeSignature(4, 4, 24, 8);
    
    notes.forEach((note, index) => {
      const duration = Math.round(lengths[index] / 480); // Convert MIDI ticks to beats
      track.addEvent(new MidiWriter.NoteEvent({
        pitch: [note],
        duration: `${duration}`,
        velocity: 100
      }));
    });
    
    const write = new MidiWriter.Writer(track);
    const blob = new Blob([write.buildFile()], { type: 'audio/midi' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
} 