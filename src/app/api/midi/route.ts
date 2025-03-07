import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { MusicPatternGenerator } from '@/services/MusicPatternGenerator';
import { MidiPlayer } from '@/services/MidiPlayer';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const G_MAJOR_SCALE = [67, 69, 71, 72, 74, 76, 78, 79]; // G4 to G5

async function generatePattern(instrument: 'brass' | 'woodwind' | 'percussion') {
  const prompt = `Generate a musical pattern for a ${instrument} instrument in G major scale.
The pattern should be formatted exactly like this:
notes = [list of MIDI note numbers]
lengths = [list of note lengths in MIDI ticks]

Requirements:
- Use only these MIDI notes for G major scale: ${G_MAJOR_SCALE.join(', ')}
- For brass/woodwind: Create a melodic line that's characteristic of marching bands
- For percussion: Create a rhythmic pattern using note 60 (middle C) for the main hits
- Use lengths between 120 and 960 ticks
- Generate 8-16 notes
- Make it sound ${instrument === 'brass' ? 'bold and powerful' : 
                  instrument === 'woodwind' ? 'flowing and melodic' : 
                  'steady and rhythmic'}

Return ONLY the notes and lengths arrays, no other text.`;

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-3.5-turbo",
  });

  const response = completion.choices[0].message.content;
  if (!response) throw new Error('No response from OpenAI');

  // Parse the response
  const notesMatch = response.match(/notes\s*=\s*\[([\d,\s]+)\]/);
  const lengthsMatch = response.match(/lengths\s*=\s*\[([\d,\s]+)\]/);

  if (!notesMatch || !lengthsMatch) {
    throw new Error('Invalid response format from OpenAI');
  }

  const notes = notesMatch[1].split(',').map(n => parseInt(n.trim()));
  const lengths = lengthsMatch[1].split(',').map(n => parseInt(n.trim()));

  // Validate the notes are in G major scale
  if (instrument !== 'percussion' && !notes.every(note => 
    G_MAJOR_SCALE.includes(note) || 
    G_MAJOR_SCALE.includes(note + 12) || 
    G_MAJOR_SCALE.includes(note - 12)
  )) {
    throw new Error('Generated notes are not in G major scale');
  }

  return { notes, lengths };
}

export async function POST(req: Request) {
  try {
    console.log('API Key present:', !!process.env.OPENAI_API_KEY); // Debug line
    const { instrument } = await req.json();
    console.log('Received instrument:', instrument); // Debug line

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const generator = new MusicPatternGenerator(openai);
    
    // Get existing patterns to inform the new generation
    const existingPatterns = MidiPlayer.getCurrentPatterns();
    let relationshipType: 'point' | 'counterpoint' = 'point';
    let additionalPrompt = '';

    if (existingPatterns.length > 0) {
      relationshipType = existingPatterns[existingPatterns.length - 1].type === 'point' ? 'counterpoint' : 'point';
      additionalPrompt = `Create a ${relationshipType} pattern that complements these existing patterns:\n`;
      existingPatterns.forEach((pattern, index) => {
        additionalPrompt += `Pattern ${index + 1} (${pattern.instrument}): Notes ${pattern.notes.join(', ')}\n`;
      });
      additionalPrompt += `\nMaintain similar timing and rhythm to the existing patterns.`;
    }

    const pattern = await generator.generateInstrumentPattern(instrument, additionalPrompt);
    return NextResponse.json({ ...pattern, type: relationshipType });
  } catch (error) {
    console.error('Detailed error:', error); // Enhanced error logging
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate MIDI pattern' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const instruments: ('brass' | 'woodwind' | 'percussion')[] = ['brass', 'woodwind', 'percussion'];
    const patterns = await Promise.all(
      instruments.map(async (instrument) => ({
        instrument,
        pattern: await generatePattern(instrument)
      }))
    );
    
    return NextResponse.json(patterns);
  } catch (error) {
    console.error('Error generating patterns:', error);
    return NextResponse.json(
      { error: 'Failed to generate patterns' },
      { status: 500 }
    );
  }
} 