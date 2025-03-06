'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FormationDisplay from '@/app/components/FormationDisplay';
import { BandMember } from '@/models/BandMember';

interface Level {
  id: string;
  name: string;
  author: string;
  music_theme?: string;
  song_title?: string;
  tempo: number;
  duration_seconds: number;
  band_members: BandMember[];
}

export default function LevelPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [level, setLevel] = useState<Level | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const response = await fetch(`/api/levels/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch level');
        }
        const data = await response.json();
        setLevel(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch level');
      }
    };

    fetchLevel();
  }, [params.id]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{level.name}</h1>
          <div className="space-x-2">
            <button
              onClick={() => router.push(`/levels/${level.id}/edit`)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Edit Level
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Go Back
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Created by</h2>
              <p className="mt-1">{level.author}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Music Theme</h2>
              <p className="mt-1">{level.music_theme || 'None'}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Song Title</h2>
              <p className="mt-1">{level.song_title || 'None'}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Tempo</h2>
              <p className="mt-1">{level.tempo} BPM</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Duration</h2>
              <p className="mt-1">{level.duration_seconds} seconds</p>
            </div>
          </div>
        </div>

        <FormationDisplay members={level.band_members} />

        <div className="mt-8">
          <details className="bg-gray-50 rounded-lg">
            <summary className="px-4 py-2 cursor-pointer font-semibold">
              Band Members ({level.band_members.length})
            </summary>
            <div className="px-4 py-2 space-y-4">
              {level.band_members.map((member, index) => (
                <div key={member.id || index} className="bg-white p-4 rounded-md shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-sm text-gray-500">
                        {member.instrument} ({member.instrumentType})
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">
                        Speed: {member.speed}, Radius: {member.radius}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
} 