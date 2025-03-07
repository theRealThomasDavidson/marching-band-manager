'use client';

import React, { useState, useEffect } from 'react';
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
    return (
      <div className="min-h-screen bg-green-800 flex items-center justify-center">
        <div className="text-xl font-semibold text-white">Loading formations...</div>
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

  return (
    <div className="min-h-screen bg-green-800 bg-[linear-gradient(45deg,_#166534_25%,_#15803d_25%,_#15803d_50%,_#166534_50%,_#166534_75%,_#15803d_75%,_#15803d_100%)] bg-[length:50px_50px]">
      {/* Hero Section */}
      <div className="bg-green-900/80 text-white py-16 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Marching Band Game</h1>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Lead your virtual marching band to perfection! Create formations, choreograph movements, 
            and conduct AI-generated music in this unique musical strategy game.
          </p>
          <div className="space-x-4">
            <Link 
              href="/editor/level/new" 
              className="inline-block px-8 py-4 bg-yellow-500 text-green-900 rounded-lg hover:bg-yellow-400 font-semibold text-lg transition-colors"
            >
              Create Formation
            </Link>
            <Link 
              href="/tutorial" 
              className="inline-block px-8 py-4 bg-green-700 text-white rounded-lg hover:bg-green-600 font-semibold text-lg transition-colors border-2 border-green-600"
            >
              How to Play
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Formations Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Your Formations</h2>
            <Link 
              href="/editor/level/new" 
              className="px-4 py-2 bg-yellow-500 text-green-900 rounded-md hover:bg-yellow-400 transition-colors"
            >
              New Formation
            </Link>
          </div>

          {levels.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-lg text-center">
              <p className="text-xl text-green-900 mb-4">Ready to create your first formation?</p>
              <p className="text-green-800 mb-6">Start by creating a formation and adding band members!</p>
              <Link 
                href="/editor/level/new" 
                className="inline-block px-6 py-3 bg-yellow-500 text-green-900 rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Create First Formation
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {levels.map(level => (
                <div key={level.id} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-green-900 mb-2">{level.name}</h3>
                    <div className="flex items-center text-sm text-green-700 mb-4">
                      <div>
                        <span className="font-medium">Theme:</span> {level.music_theme}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link 
                        href={`/play/${level.id}`}
                        className="flex-1 px-4 py-2 bg-yellow-500 text-green-900 text-center rounded-md hover:bg-yellow-400 transition-colors"
                      >
                        Play
                      </Link>
                      <Link 
                        href={`/editor/level/${level.id}`}
                        className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600 transition-colors"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDeleteLevel(level.id)}
                        className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
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
      </div>
    </div>
  );
} 