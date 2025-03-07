'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface BandMember {
  id: string;
  name: string;
  instrument: string;
  instrument_type: string;
  start_x: number;
  start_y: number;
  end_x: number;
  end_y: number;
  radius: number;
  speed: number;
  midi_track_notes: number[];
  midi_track_lengths: number[];
  midi_track_tempo: number;
  midi_track_instrument: number;
  midi_track_duration: number;
}

interface Level {
  id: string;
  name: string;
  author: string;
  music_theme?: string;
  song_title?: string;
  tempo: number;
  duration_seconds: number;
  plays: number;
  band_members: BandMember[];
  created_at: string;
  updated_at: string;
}

export default function LevelsPage() {
  const router = useRouter();
  const [levels, setLevels] = useState<Level[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await fetch('/api/levels');
        if (!response.ok) {
          throw new Error('Failed to fetch levels');
        }
        const data = await response.json();
        setLevels(data);
      } catch (err) {
        console.error('Error fetching levels:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch levels');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLevels();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div>Loading levels...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Marching Band Levels</h1>
          <button
            onClick={() => router.push('/levels/new')}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Create New Level
          </button>
        </div>

        {levels.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-500">No levels found. Create your first level!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {levels.map((level) => (
              <div key={level.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">{level.name}</h2>
                    <p className="text-gray-600">By {level.author}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/play/${level.id}`)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Play Level
                    </button>
                    <button
                      onClick={() => router.push(`/levels/${level.id}/edit`)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Music Theme</p>
                    <p>{level.music_theme || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Song Title</p>
                    <p>{level.song_title || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tempo</p>
                    <p>{level.tempo} BPM</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p>{level.duration_seconds} seconds</p>
                  </div>
                </div>

                <details className="bg-gray-50 rounded-lg">
                  <summary className="px-4 py-2 cursor-pointer font-semibold">
                    Band Members ({level.band_members?.length || 0})
                  </summary>
                  <div className="px-4 py-2 space-y-2">
                    {level.band_members?.map((member, index) => (
                      <div key={member.id || index} className="bg-white p-3 rounded-md shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-gray-500">
                              {member.instrument} ({member.instrument_type})
                            </p>
                          </div>
                          <div className="text-sm">
                            <p>Speed: {member.speed}</p>
                            <p>Radius: {member.radius}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>

                <div className="mt-4 text-sm text-gray-500">
                  <p>Created: {new Date(level.created_at).toLocaleDateString()}</p>
                  <p>Plays: {level.plays}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 