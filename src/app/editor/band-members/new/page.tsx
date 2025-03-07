'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Level } from '@/models/Level';
import { BandMember } from '@/models/BandMember';

/**
 * New Band Member page component
 */
export default function NewBandMemberPage() {
  const router = useRouter();
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<BandMember>>({
    name: '',
    instrument: '',
    instrument_type: 'brass', // Default value
    radius: 1,
    speed: 1,
    start_x: undefined,
    start_y: undefined,
    end_x: undefined,
    end_y: undefined,
  });
  
  // Fetch levels for dropdown
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
        
        // Set default level if available
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, level_id: data[0].id }));
        }
      } catch (err) {
        console.error('Error fetching levels:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLevels();
  }, []);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Convert numeric inputs to numbers
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.level_id) {
      alert('Please select a level');
      return;
    }
    
    if (!formData.name?.trim()) {
      alert('Please enter a name for the band member');
      return;
    }
    
    if (!formData.instrument?.trim()) {
      alert('Please enter an instrument');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await fetch('/api/band-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`);
      }
      
      // Redirect to band members page on success
      router.push('/editor/band-members');
    } catch (err) {
      console.error('Error creating band member:', err);
      alert(err instanceof Error ? err.message : 'Failed to create band member');
      setSubmitting(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    router.push('/editor/band-members');
  };
  
  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }
  
  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }
  
  if (levels.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Add New Band Member</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded mb-4">
          <p>No levels found. You need to create a level before adding band members.</p>
        </div>
        <button
          onClick={() => router.push('/editor/level/new')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create a Level
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Band Member</h1>
      
      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Level Selection */}
          <div className="col-span-2">
            <label htmlFor="level_id" className="block text-sm font-medium mb-1">Level</label>
            <select
              id="level_id"
              name="level_id"
              value={formData.level_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="" disabled>Select a level</option>
              {levels.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>
          
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="E.g., Trumpet Player 1"
              required
            />
          </div>
          
          {/* Instrument */}
          <div>
            <label htmlFor="instrument" className="block text-sm font-medium mb-1">Instrument</label>
            <input
              type="text"
              id="instrument"
              name="instrument"
              value={formData.instrument}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="E.g., Trumpet"
              required
            />
          </div>
          
          {/* Instrument Type */}
          <div>
            <label htmlFor="instrument_type" className="block text-sm font-medium mb-1">Instrument Type</label>
            <select
              id="instrument_type"
              name="instrument_type"
              value={formData.instrument_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="brass">Brass</option>
              <option value="woodwind">Woodwind</option>
              <option value="percussion">Percussion</option>
            </select>
          </div>
          
          {/* Radius */}
          <div>
            <label htmlFor="radius" className="block text-sm font-medium mb-1">
              Radius
              <span className="text-gray-500 text-xs ml-1">(Size of the player on field)</span>
            </label>
            <input
              type="number"
              id="radius"
              name="radius"
              value={formData.radius}
              onChange={handleChange}
              min="0.5"
              max="2"
              step="0.1"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          
          {/* Speed */}
          <div>
            <label htmlFor="speed" className="block text-sm font-medium mb-1">
              Speed
              <span className="text-gray-500 text-xs ml-1">(Movement speed multiplier)</span>
            </label>
            <input
              type="number"
              id="speed"
              name="speed"
              value={formData.speed}
              onChange={handleChange}
              min="0.5"
              max="2"
              step="0.1"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          
          {/* Form buttons */}
          <div className="col-span-2 flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Band Member'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 