'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
}

const INSTRUMENT_CATEGORIES = {
  brass: ['trumpet', 'trombone', 'tuba'],
  woodwind: ['saxophone', 'flute', 'clarinet'],
  percussion: ['percussion'],
  other: ['color_guard']
} as const;

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

  const handleAddBandMember = () => {
    setBandMembers(prev => [...prev, {
      name: `Member ${prev.length + 1}`,
      instrument: '',
      instrumentType: 'brass',
      start_x: 0,
      start_y: 0,
      end_x: 100,
      end_y: 100,
      radius: 3,
      speed: 5
    }]);
  };

  const handleBandMemberChange = (index: number, field: keyof BandMember, value: string | number) => {
    setBandMembers(prev => prev.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    ));
  };

  const handleRemoveBandMember = (index: number) => {
    setBandMembers(prev => prev.filter((_, i) => i !== index));
  };

  const getInstrumentsForType = (type: string) => {
    return INSTRUMENT_CATEGORIES[type as keyof typeof INSTRUMENT_CATEGORIES] || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/levels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          bandMembers: bandMembers.length > 0 ? bandMembers.map(member => ({
            ...member,
            instrument_type: member.instrumentType // Map to match database column name
          })) : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to create level');
      }

      const level = await response.json();
      router.push(`/levels/${level.id}`);
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
              <button
                type="button"
                onClick={handleAddBandMember}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Add Member
              </button>
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