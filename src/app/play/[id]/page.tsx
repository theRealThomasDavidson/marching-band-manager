'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Level } from '@/models/Level';
import { BandMember } from '@/models/BandMember';
import FormationBoard from '@/app/components/FormationBoard';

/**
 * Gameplay page - plays a marching band formation with animations and music
 */
export default function PlayLevel() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch level data
  useEffect(() => {
    const fetchLevel = async () => {
      try {
        setLoading(true);
        console.log('Fetching level with ID:', id);
        const response = await fetch(`/api/levels/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch level: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Raw API response:', data);
        
        // Just pass the data through with type assertion since we know the structure
        const levelData = {
          ...data,
          bandMembers: data.band_members as BandMember[]
        };
        
        console.log('Level data:', levelData);
        console.log('Band members before passing to FormationBoard:', levelData.bandMembers);
        
        setLevel(levelData);
      } catch (err) {
        console.error('Error fetching level:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLevel();
    }
  }, [id]);

  const handleGoHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-800 bg-[linear-gradient(45deg,_#166534_25%,_#15803d_25%,_#15803d_50%,_#166534_50%,_#166534_75%,_#15803d_75%,_#15803d_100%)] bg-[length:50px_50px]">
        <div className="w-[1391px] h-[1218px] mx-auto p-8">
          <div className="bg-green-900/90 backdrop-blur-sm rounded-lg shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-white">{level?.name || 'Loading...'}</h1>
              <button
                onClick={handleGoHome}
                className="px-4 py-2 bg-white text-green-800 rounded-md hover:bg-gray-100 transition-colors"
              >
                Go Home
              </button>
            </div>
            <div className="flex items-center justify-center h-96">
              <div className="text-xl text-white">Loading formation...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-green-800 flex items-center justify-center">
        <div className="text-xl font-semibold text-red-300">Error: {error}</div>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="min-h-screen bg-green-800 flex items-center justify-center">
        <div className="text-xl font-semibold text-white">Level not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-800 bg-[linear-gradient(45deg,_#166534_25%,_#15803d_25%,_#15803d_50%,_#166534_50%,_#166534_75%,_#15803d_75%,_#15803d_100%)] bg-[length:50px_50px]">
      <div className="w-[1391px] h-[1218px] mx-auto p-8">
        <div className="bg-green-900/90 backdrop-blur-sm rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">{level.name}</h1>
            <button
              onClick={handleGoHome}
              className="px-4 py-2 bg-white text-green-800 rounded-md hover:bg-gray-100 transition-colors"
            >
              Go Home
            </button>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <FormationBoard
              members={level.bandMembers || []}
              width={800}
              height={432}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 