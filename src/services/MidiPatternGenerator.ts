import MidiWriter from 'midi-writer-js';

export class MidiPatternGenerator {
  static createMidiFromLists(notes: number[], lengths: number[]) {
    // Create a new MIDI track
    const track = new MidiWriter.Track();

    // Add notes to the track
    for (let i = 0; i < notes.length; i++) {
      const note = new MidiWriter.NoteEvent({
        pitch: [notes[i]],
        duration: `T${lengths[i]}`,
        velocity: 100
      });
      track.addEvent(note);
    }

    // Create a new MIDI writer with the track
    const writer = new MidiWriter.Writer(track);
    
    // Return both the binary data and a data URL for preview
    return {
      dataUrl: writer.dataUri(),
      buffer: writer.buildFile()
    };
  }

  // Helper method to convert note names to MIDI numbers
  static noteToMidi(noteName: string): number {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const note = noteName.slice(0, -1);
    const octave = parseInt(noteName.slice(-1));
    const semitone = notes.indexOf(note);
    
    if (semitone === -1) throw new Error('Invalid note name');
    return (octave + 1) * 12 + semitone;
  }

  // Helper method to create a download link
  static downloadMidi(notes: number[], lengths: number[], filename: string = 'pattern.mid') {
    const { dataUrl } = this.createMidiFromLists(notes, lengths);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  }
} 