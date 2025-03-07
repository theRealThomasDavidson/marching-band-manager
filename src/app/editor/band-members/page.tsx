'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BandMember } from '@/models/BandMember';
import { Level } from '@/models/Level';

/**
 * Band Members management page component
 */
export default function BandMembersPage() {
  const [bandMembers, setBandMembers] = useState<(BandMember & { levelName?: string })[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<string>('all');
  
  // Fetch band members and levels
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch levels first
        const levelsResponse = await fetch('/api/levels');
        if (!levelsResponse.ok) {
          throw new Error(`Failed to fetch levels: ${levelsResponse.statusText}`);
        }
        
        const levelsData = await levelsResponse.json();
        setLevels(levelsData);
        
        // Build a map of level IDs to names for quick lookup
        const levelMap = new Map<string, string>();
        levelsData.forEach((level: Level) => {
          levelMap.set(level.id, level.name);
        });
        
        // Then fetch band members
        let url = '/api/band-members';
        if (selectedLevelId !== 'all') {
          url += `?level_id=${selectedLevelId}`;
        }
        
        const membersResponse = await fetch(url);
        if (!membersResponse.ok) {
          throw new Error(`Failed to fetch band members: ${membersResponse.statusText}`);
        }
        
        const membersData = await membersResponse.json();
        
        // Add level names to band members
        const membersWithLevelNames = membersData.map((member: BandMember) => ({
          ...member,
          levelName: levelMap.get(member.level_id) || 'Unknown'
        }));
        
        setBandMembers(membersWithLevelNames);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedLevelId]);
  
  // Handle level filter change
  const handleLevelFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLevelId(e.target.value);
  };
  
  // Handle delete band member
  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this band member?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/band-members/${memberId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete band member: ${response.statusText}`);
      }
      
      // Remove the deleted member from the state
      setBandMembers(bandMembers.filter(member => member.id !== memberId));
    } catch (err) {
      console.error('Error deleting band member:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete band member');
    }
  };
  
  // Get color for instrument type
  const getInstrumentColor = (type: string): string => {
    switch (type) {
      case 'brass':
        return 'bg-amber-200 border-amber-400';
      case 'woodwind':
        return 'bg-green-200 border-green-400';
      case 'percussion':
        return 'bg-red-200 border-red-400';
      default:
        return 'bg-gray-200 border-gray-400';
    }
  };
  
  if (loading) {
    return <div className="container mx-auto p-4">Loading band members...</div>;
  }
  
  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Band Members</h1>
      
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div className="mb-4">
          <label htmlFor="levelFilter" className="mr-2">Filter by Level:</label>
          <select
            id="levelFilter"
            value={selectedLevelId}
            onChange={handleLevelFilterChange}
            className="px-3 py-2 border rounded"
          >
            <option value="all">All Levels</option>
            {levels.map(level => (
              <option key={level.id} value={level.id}>{level.name}</option>
            ))}
          </select>
        </div>
        
        <Link
          href="/editor/band-members/new"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add New Band Member
        </Link>
      </div>
      
      {bandMembers.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded text-center">
          <p className="text-lg">No band members found</p>
          <p className="mt-2 text-gray-600">
            {selectedLevelId !== 'all' 
              ? 'Try selecting a different level or create a new band member'
              : 'Create your first band member to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bandMembers.map(member => (
            <div 
              key={member.id} 
              className={`border-2 p-4 rounded shadow ${getInstrumentColor(member.instrument_type)}`}
            >
              <h2 className="text-xl font-semibold">{member.name}</h2>
              <p className="text-sm text-gray-600">Level: {member.levelName}</p>
              
              <div className="mt-2">
                <p><span className="font-medium">Instrument:</span> {member.instrument}</p>
                <p><span className="font-medium">Type:</span> {member.instrument_type}</p>
                <p><span className="font-medium">Radius:</span> {member.radius}</p>
                <p><span className="font-medium">Speed:</span> {member.speed}</p>
                
                {member.start_x !== null && member.start_y !== null && (
                  <p><span className="font-medium">Start Position:</span> ({member.start_x}, {member.start_y})</p>
                )}
                
                {member.end_x !== null && member.end_y !== null && (
                  <p><span className="font-medium">End Position:</span> ({member.end_x}, {member.end_y})</p>
                )}
              </div>
              
              <div className="mt-4 flex justify-end space-x-2">
                <Link
                  href={`/editor/band-members/${member.id}`}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 