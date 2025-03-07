import OpenAI from 'openai';
import { MidiPatternGenerator } from '@/services/MidiPatternGenerator';

export class MusicPatternGenerator {
  private openai: OpenAI;
  private readonly G_MAJOR_SCALE = [67, 69, 71, 72, 74, 76, 78, 79]; // G4 to G5

  constructor(openai: OpenAI) {
    this.openai = openai;
  }

  private validateNote(note: number): number {
    // Find the closest note in G major scale
    return this.G_MAJOR_SCALE.reduce((prev, curr) => 
      Math.abs(curr - note) < Math.abs(prev - note) ? curr : prev
    );
  }

  async generateInstrumentPattern(instrument: string, additionalContext: string = '') {
    const basePrompt = `Generate a musical pattern for a ${instrument} in a marching band. 
The pattern should be in G major scale (G4 to G5: ${this.G_MAJOR_SCALE.join(', ')}).
Return only a JSON object with two arrays:
1. 'notes': MIDI note numbers from the G major scale
2. 'lengths': corresponding note lengths in MIDI ticks (480 ticks = 1 beat)

${additionalContext}

Requirements:
- Use only notes from the G major scale
- Create a rhythmically interesting pattern
- Keep the total duration between 2-4 beats
- Make it suitable for marching band performance`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a music composer specializing in marching band arrangements."
          },
          {
            role: "user",
            content: basePrompt
          }
        ],
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      const pattern = JSON.parse(response);
      
      // Validate and adjust notes to ensure they're in G major
      const validatedNotes = pattern.notes.map((note: number) => this.validateNote(note));

      return {
        notes: validatedNotes,
        lengths: pattern.lengths
      };
    } catch (error) {
      console.error('Error generating music pattern:', error);
      throw error;
    }
  }

  async generateAndDownload(instrument: 'brass' | 'woodwind' | 'percussion') {
    const pattern = await this.generateInstrumentPattern(instrument);
    MidiPatternGenerator.downloadMidi(pattern.notes, pattern.lengths, `${instrument}_pattern.mid`);
    return pattern;
  }

  async generateFullBandPattern() {
    const instruments: ('brass' | 'woodwind' | 'percussion')[] = ['brass', 'woodwind', 'percussion'];
    const patterns = await Promise.all(
      instruments.map(async (instrument) => ({
        instrument,
        pattern: await this.generateInstrumentPattern(instrument)
      }))
    );
    
    return patterns;
  }
} 