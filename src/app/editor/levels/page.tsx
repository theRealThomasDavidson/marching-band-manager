'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Level } from '@/models/Level';

/**
 * Level listing page component
 */
export default function LevelsPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/levels');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch levels: ${response.statusText}`);
        }
        
        const data = await response.json();
        setLevels(data);
      } catch (err) {
        console.error('Error fetching levels:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, []);

  const handleDeleteLevel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this level?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/levels/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete level: ${response.statusText}`);
      }
      
      // Remove the level from the state
      setLevels(levels.filter(level => level.id !== id));
    } catch (err) {
      console.error('Error deleting level:', err);
      alert(err instanceof Error ? err.message : 'An error occurred while deleting the level');
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading levels...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Marching Band Levels</h1>
        <Link 
          href="/editor/level/new" 
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Create New Level
        </Link>
      </div>

      {levels.length === 0 ? (
        <div className="bg-gray-100 p-8 text-center rounded">
          <p className="text-lg mb-4">No levels found</p>
          <p>Create your first level to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map(level => (
            <div key={level.id} className="border rounded shadow-sm overflow-hidden">
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{level.name}</h2>
                <p className="text-gray-600 mb-2">By {level.author}</p>
                <p className="mb-1">
                  <span className="font-medium">Song:</span> {level.song_title || 'Not set'}
                </p>
                <p className="mb-1">
                  <span className="font-medium">Tempo:</span> {level.tempo || 'Not set'} BPM
                </p>
                <p className="mb-1">
                  <span className="font-medium">Band Members:</span> {level.bandMembers?.length || 0}
                </p>
                <div className="flex gap-2">
                  <Link 
                    href={`/editor/level/${level.id}`}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDeleteLevel(level.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 