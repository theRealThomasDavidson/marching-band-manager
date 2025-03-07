import React, { useState } from 'react';
import { MidiPatternGenerator } from '@/services/MidiPatternGenerator';
import { MidiPlayer } from '@/services/MidiPlayer';

interface GeneratedPattern {
  instrument: string;
  notes: number[];
  lengths: number[];
  type?: 'point' | 'counterpoint';
}

const BandPatternGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPatterns, setGeneratedPatterns] = useState<GeneratedPattern[]>([]);

  const handleGenerateForInstrument = async (instrument: 'brass' | 'woodwind' | 'percussion') => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/midi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instrument }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate pattern');
      }

      const { notes, lengths, type } = await response.json();
      MidiPatternGenerator.downloadMidi(notes, lengths, `${instrument}_pattern.mid`);
      setGeneratedPatterns(prev => [...prev, { instrument, notes, lengths, type }]);
    } catch (err) {
      console.error('Error generating pattern:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate pattern');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFullBand = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/midi');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate patterns');
      }

      const patterns = await response.json();
      setGeneratedPatterns(patterns.map((p: any) => ({
        instrument: p.instrument,
        ...p.pattern
      })));

      // Download each pattern
      patterns.forEach((p: any) => {
        MidiPatternGenerator.downloadMidi(
          p.pattern.notes,
          p.pattern.lengths,
          `${p.instrument}_pattern.mid`
        );
      });
    } catch (err) {
      console.error('Error generating patterns:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate patterns');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPattern = async (pattern: GeneratedPattern) => {
    try {
      MidiPlayer.stopAll();
      setIsPlaying(pattern.instrument);
      await MidiPlayer.playPattern(
        pattern.notes,
        pattern.lengths,
        pattern.instrument as 'brass' | 'woodwind' | 'percussion',
        120,
        0,
        isLooping,
        pattern.type || 'point'
      );
      
      if (!isLooping) {
        setIsPlaying(null);
      }
    } catch (err) {
      console.error('Error playing pattern:', err);
      setError('Failed to play pattern');
      setIsPlaying(null);
    }
  };

  const handlePlayAll = async () => {
    try {
      MidiPlayer.stopAll();
      setIsPlaying('all');
      
      await MidiPlayer.playMultiplePatterns(
        generatedPatterns.map(pattern => ({
          notes: pattern.notes,
          lengths: pattern.lengths,
          instrument: pattern.instrument as 'brass' | 'woodwind' | 'percussion',
          type: pattern.type
        })),
        isLooping
      );
      
      if (!isLooping) {
        setIsPlaying(null);
      }
    } catch (err) {
      console.error('Error playing patterns:', err);
      setError('Failed to play patterns');
      setIsPlaying(null);
    }
  };

  const handleStop = () => {
    MidiPlayer.stopAll();
    setIsPlaying(null);
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900">Band Pattern Generator</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handleGenerateForInstrument('brass')}
          disabled={isGenerating}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Generate Brass Pattern
        </button>
        
        <button
          onClick={() => handleGenerateForInstrument('woodwind')}
          disabled={isGenerating}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Generate Woodwind Pattern
        </button>
        
        <button
          onClick={() => handleGenerateForInstrument('percussion')}
          disabled={isGenerating}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Generate Percussion Pattern
        </button>
      </div>

      <button
        onClick={handleGenerateFullBand}
        disabled={isGenerating}
        className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        Generate Full Band Pattern
      </button>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}

      {generatedPatterns.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700">Generated Patterns:</h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isLooping}
                  onChange={(e) => setIsLooping(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-500"
                />
                <span className="text-sm text-gray-600">Loop Playback</span>
              </label>
              <div className="space-x-2">
                <button
                  onClick={handlePlayAll}
                  disabled={isPlaying !== null && !isLooping}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isPlaying === 'all' ? 'Playing...' : 'Play All'}
                </button>
                <button
                  onClick={handleStop}
                  disabled={isPlaying === null}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Stop
                </button>
              </div>
            </div>
          </div>
          
          {generatedPatterns.map((pattern, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="font-medium text-gray-900 capitalize">{pattern.instrument}</h4>
                  {pattern.type && (
                    <span className={`text-xs ${
                      pattern.type === 'point' ? 'text-blue-600' : 'text-purple-600'
                    }`}>
                      {pattern.type}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handlePlayPattern(pattern)}
                  disabled={isPlaying !== null && !isLooping}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isPlaying === pattern.instrument ? 'Playing...' : 'Play'}
                </button>
              </div>
              <div className="text-sm text-gray-600">
                <p>Notes: [{pattern.notes.join(', ')}]</p>
                <p>Lengths: [{pattern.lengths.join(', ')}]</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BandPatternGenerator; 