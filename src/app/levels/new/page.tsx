'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AudioGenerator } from '@/services/MidiGenerator';
import { MidiPlayer } from '@/services/MidiPlayer';

interface MidiTrackData {
  notes: number[];
  lengths: number[];
  tempo: number;
  duration: number;
  type?: 'point' | 'counterpoint';
}

interface BandMember {
  name: string;
  instrument: string;
  instrumentType: 'brass' | 'woodwind' | 'percussion' | 'trumpet' | 'trombone' | 'saxophone' | 'flute' | 'clarinet' | 'tuba' | 'color_guard';
  start_x: number;
  start_y: number;
  end_x: number;
  end_y: number;
  radius?: number;
  speed?: number;
  customMidiTrack?: {
    tempo: number;
    instrument_number: number;
    duration: number;
    track_data: MidiTrackData;
    track_number: number;
  };
}

const INSTRUMENT_CATEGORIES = {
  brass: ['trumpet', 'trombone', 'tuba'],
  woodwind: ['saxophone', 'flute', 'clarinet'],
  percussion: ['percussion'],
  other: ['color_guard']
} as const;

const INSTRUMENT_TO_CATEGORY: { [key: string]: 'brass' | 'woodwind' | 'percussion' } = {
  trumpet: 'brass',
  trombone: 'brass',
  tuba: 'brass',
  saxophone: 'woodwind',
  flute: 'woodwind',
  clarinet: 'woodwind',
  percussion: 'percussion',
  color_guard: 'percussion' // Default to percussion for color guard
};

export default function NewLevelPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    author: '',
    music_theme: '',
    song_title: '',
    tempo: 120,
    duration_seconds: 10
  });
  const [bandMembers, setBandMembers] = useState<BandMember[]>([]);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['tempo', 'duration_seconds', 'plays'].includes(name) 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleAddBandMember = async () => {
    setIsGeneratingMusic(true);
    try {
      const newMember: BandMember = {
        name: `Member ${bandMembers.length + 1}`,
        instrument: '',
        instrumentType: 'brass',
        start_x: 0,
        start_y: 0,
        end_x: 100,
        end_y: 100,
        radius: 3,
        speed: 5
      };

      setBandMembers(prev => [...prev, newMember]);
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const handleBandMemberChange = (index: number, field: keyof BandMember, value: string | number) => {
    setBandMembers(prev => prev.map((member, i) => 
      i === index ? { 
        ...member, 
        [field]: field === 'instrumentType' ? value as BandMember['instrumentType'] : value 
      } : member
    ));
  };

  const handleRemoveBandMember = (index: number) => {
    setBandMembers(prev => prev.filter((_, i) => i !== index));
  };

  const getInstrumentsForType = (type: string) => {
    return INSTRUMENT_CATEGORIES[type as keyof typeof INSTRUMENT_CATEGORIES] || [];
  };

  const handleGenerateMusicForMember = async (index: number) => {
    setIsGeneratingMusic(true);
    try {
      const member = bandMembers[index];
      const category = INSTRUMENT_TO_CATEGORY[member.instrument];
      
      const response = await fetch('/api/midi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          instrument: category,
          existingPatterns: bandMembers
            .filter((m, i) => i !== index && m.customMidiTrack)
            .map(m => ({
              instrument: INSTRUMENT_TO_CATEGORY[m.instrument],
              notes: m.customMidiTrack!.track_data.notes,
              lengths: m.customMidiTrack!.track_data.lengths
            }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate music pattern');
      }

      const { notes, lengths, type } = await response.json();

      setBandMembers(prev => prev.map((m, i) => {
        if (i !== index) return m;
        
        const updatedMember: BandMember = {
          ...m,
          customMidiTrack: {
            tempo: formData.tempo,
            instrument_number: member.instrument === 'trumpet' ? 56 :
                          member.instrument === 'trombone' ? 57 :
                          member.instrument === 'tuba' ? 58 :
                          member.instrument === 'saxophone' ? 65 :
                          member.instrument === 'flute' ? 73 :
                          member.instrument === 'clarinet' ? 71 :
                          115,
            duration: notes[notes.length - 1]?.endTime || 4,
            track_data: {
              notes,
              lengths,
              tempo: formData.tempo,
              duration: notes[notes.length - 1]?.endTime || 4,
              type
            },
            track_number: 0
          }
        };
        return updatedMember;
      }));
    } catch (err) {
      console.error('Error generating music:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate music');
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const handlePreviewMusic = async (member: BandMember) => {
    try {
      // Stop any existing playback first
      handleStopPreview();

      if (!member.customMidiTrack?.track_data) {
        setError('No music pattern to preview');
        return;
      }

      const { notes, lengths } = member.customMidiTrack.track_data;
      
      // Play the pattern with a small delay to ensure clean playback
      await MidiPlayer.playPattern(
        notes,
        lengths,
        INSTRUMENT_TO_CATEGORY[member.instrument],
        formData.tempo,
        0 // Let the MidiPlayer handle timing
      );
    } catch (err) {
      console.error('Error previewing music:', err);
      setError(err instanceof Error ? err.message : 'Failed to preview music');
    }
  };

  const handleStopPreview = () => {
    MidiPlayer.stopAll();
  };

  const handlePlayAllTogether = async () => {
    try {
      handleStopPreview();

      const patternsToPlay = bandMembers
        .filter(member => member.customMidiTrack?.track_data)
        .map(member => ({
          notes: member.customMidiTrack!.track_data.notes,
          lengths: member.customMidiTrack!.track_data.lengths,
          instrument: INSTRUMENT_TO_CATEGORY[member.instrument],
          type: member.customMidiTrack!.track_data.type
        }));

      if (patternsToPlay.length === 0) {
        setError('No music patterns to play');
        return;
      }

      await MidiPlayer.playMultiplePatterns(patternsToPlay, true);
    } catch (err) {
      console.error('Error playing patterns:', err);
      setError(err instanceof Error ? err.message : 'Failed to play patterns');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Generate MIDI tracks for each band member
      const audioGenerator = new AudioGenerator();
      const bandMembersWithMidi = bandMembers.map(member => {
        // Use custom MIDI track if available, otherwise generate one
        const midiTrack = member.customMidiTrack || (() => {
          const category = INSTRUMENT_TO_CATEGORY[member.instrument];
          const generatedMidiTrack = audioGenerator.generateMidiTrack(category);
          return {
            tempo: formData.tempo,
            instrument_number: member.instrument === 'trumpet' ? 56 :
                          member.instrument === 'trombone' ? 57 :
                          member.instrument === 'tuba' ? 58 :
                          member.instrument === 'saxophone' ? 65 :
                          member.instrument === 'flute' ? 73 :
                          member.instrument === 'clarinet' ? 71 :
                          115,
            duration: generatedMidiTrack.track_data.duration,
            track_data: generatedMidiTrack.track_data,
            track_number: 0
          };
        })();
        
        // Format the band member data to match the new schema structure
        return {
          name: member.name,
          instrument: member.instrument,
          instrument_type: member.instrument,
          start_x: member.start_x,
          start_y: member.start_y,
          end_x: member.end_x,
          end_y: member.end_y,
          radius: member.radius || 1,
          speed: member.speed || 1,
          midi_track_notes: midiTrack.track_data.notes,
          midi_track_lengths: midiTrack.track_data.lengths,
          midi_track_tempo: midiTrack.tempo,
          midi_track_instrument: midiTrack.instrument_number,
          midi_track_duration: midiTrack.duration
        };
      });

      const response = await fetch('/api/levels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          bandMembers: bandMembersWithMidi
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to create level');
      }

      const level = await response.json();
      router.push(`/play/${level.id}`);
    } catch (err) {
      console.error('Error creating level:', err);
      setError(err instanceof Error ? err.message : 'Failed to create level');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Create New Level</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Level Info */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Level Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter level name"
              />
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                Author *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                required
                value={formData.author}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter author name"
              />
            </div>

            <div>
              <label htmlFor="music_theme" className="block text-sm font-medium text-gray-700 mb-1">
                Music Theme
              </label>
              <select
                id="music_theme"
                name="music_theme"
                value={formData.music_theme}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a theme</option>
                <option value="Classical">Classical</option>
                <option value="Jazz">Jazz</option>
                <option value="Pop">Pop</option>
                <option value="Rock">Rock</option>
                <option value="March">March</option>
              </select>
            </div>

            <div>
              <label htmlFor="song_title" className="block text-sm font-medium text-gray-700 mb-1">
                Song Title
              </label>
              <input
                type="text"
                id="song_title"
                name="song_title"
                value={formData.song_title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter song title"
              />
            </div>

            <div>
              <label htmlFor="tempo" className="block text-sm font-medium text-gray-700 mb-1">
                Tempo (BPM)
              </label>
              <input
                type="number"
                id="tempo"
                name="tempo"
                min="40"
                max="240"
                value={formData.tempo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="duration_seconds" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (seconds)
              </label>
              <input
                type="number"
                id="duration_seconds"
                name="duration_seconds"
                min="0"
                value={formData.duration_seconds}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Band Members Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Band Members</h2>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={handlePlayAllTogether}
                  disabled={bandMembers.length === 0}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  Play All Together
                </button>
                <button
                  type="button"
                  onClick={handleAddBandMember}
                  disabled={isGeneratingMusic}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                >
                  Add Member
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {bandMembers.map((member, index) => (
                <div key={index} className="p-4 border rounded-md bg-gray-50">
                  <div className="flex justify-between mb-4">
                    <h3 className="font-medium">Band Member {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveBandMember(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={member.name}
                        onChange={(e) => handleBandMemberChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Member name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        required
                        value={member.instrumentType}
                        onChange={(e) => {
                          handleBandMemberChange(index, 'instrumentType', e.target.value);
                          // Reset instrument when category changes
                          handleBandMemberChange(index, 'instrument', getInstrumentsForType(e.target.value)[0] || '');
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {Object.keys(INSTRUMENT_CATEGORIES).map(category => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instrument *
                      </label>
                      <select
                        required
                        value={member.instrument}
                        onChange={(e) => handleBandMemberChange(index, 'instrument', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select an instrument</option>
                        {getInstrumentsForType(member.instrumentType).map(instrument => (
                          <option key={instrument} value={instrument}>
                            {instrument.charAt(0).toUpperCase() + instrument.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start X *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          max="100"
                          step="0.5"
                          value={member.start_x}
                          onChange={(e) => handleBandMemberChange(index, 'start_x', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Y *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          max="54"
                          step="0.5"
                          value={member.start_y}
                          onChange={(e) => handleBandMemberChange(index, 'start_y', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End X *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          max="100"
                          step="0.5"
                          value={member.end_x}
                          onChange={(e) => handleBandMemberChange(index, 'end_x', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Y *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          max="54"
                          step="0.5"
                          value={member.end_y}
                          onChange={(e) => handleBandMemberChange(index, 'end_y', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Movement Speed
                      </label>
                      <input
                        type="number"
                        value={member.speed}
                        onChange={(e) => handleBandMemberChange(index, 'speed', parseFloat(e.target.value))}
                        min="0.1"
                        max="5"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Radius
                      </label>
                      <input
                        type="number"
                        value={member.radius}
                        onChange={(e) => handleBandMemberChange(index, 'radius', parseFloat(e.target.value))}
                        min="0.5"
                        max="5"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleGenerateMusicForMember(index)}
                          disabled={!member.instrument || isGeneratingMusic}
                          className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 disabled:opacity-50"
                        >
                          Generate Music
                        </button>
                        {member.customMidiTrack && (
                          <button
                            type="button"
                            onClick={() => handlePreviewMusic(member)}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                          >
                            Preview Pattern
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleStopPreview}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                        >
                          Stop
                        </button>
                      </div>
                      {member.customMidiTrack && (
                        <span className="text-sm text-green-600">✓ Music Generated</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Level'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 