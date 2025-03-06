'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BandMember } from '@/models/BandMember';
import { Level } from '@/models/Level';

/**
 * Edit Band Member page component
 */
export default function EditBandMemberPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<BandMember>>({
    name: '',
    instrument: '',
    instrumentType: undefined,
    radius: 1,
    speed: 1,
    start_x: undefined,
    start_y: undefined,
    end_x: undefined,
    end_y: undefined,
  });
  
  // Fetch band member and levels
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch band member data
        const memberResponse = await fetch(`/api/band-members/${id}`);
        if (!memberResponse.ok) {
          throw new Error(`Failed to fetch band member: ${memberResponse.statusText}`);
        }
        
        const memberData = await memberResponse.json();
        setFormData(memberData);
        
        // Fetch levels for the dropdown
        const levelsResponse = await fetch('/api/levels');
        if (!levelsResponse.ok) {
          throw new Error(`Failed to fetch levels: ${levelsResponse.statusText}`);
        }
        
        const levelsData = await levelsResponse.json();
        setLevels(levelsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Convert numeric inputs to numbers
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? undefined : parseFloat(value)
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
      
      const response = await fetch(`/api/band-members/${id}`, {
        method: 'PUT',
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
      console.error('Error updating band member:', err);
      alert(err instanceof Error ? err.message : 'Failed to update band member');
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
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Band Member: {formData.name}</h1>
      
      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Level Information (read-only) */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Level</label>
            <div className="px-3 py-2 border rounded bg-gray-50">
              {levels.find(level => level.id === formData.level_id)?.name || 'Unknown Level'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              To move this band member to another level, delete it and create a new one.
            </p>
          </div>
          
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
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
              value={formData.instrument || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="E.g., Trumpet"
              required
            />
          </div>
          
          {/* Instrument Type */}
          <div>
            <label htmlFor="instrumentType" className="block text-sm font-medium mb-1">Instrument Type</label>
            <select
              id="instrumentType"
              name="instrumentType"
              value={formData.instrumentType || ''}
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
              value={formData.radius || ''}
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
              value={formData.speed || ''}
              onChange={handleChange}
              min="0.5"
              max="2"
              step="0.1"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          
          {/* Position Section */}
          <div className="col-span-2 mt-4">
            <h2 className="text-lg font-semibold mb-2">Position Data</h2>
            <p className="text-sm text-gray-600 mb-4">
              You can set initial positions here or use the level editor for visual positioning.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded p-4 bg-blue-50">
                <h3 className="text-md font-medium mb-2">Start Position</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="start_x" className="block text-sm font-medium mb-1">X Coordinate</label>
                    <input
                      type="number"
                      id="start_x"
                      name="start_x"
                      value={formData.start_x === undefined ? '' : formData.start_x}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="e.g., 100"
                    />
                  </div>
                  <div>
                    <label htmlFor="start_y" className="block text-sm font-medium mb-1">Y Coordinate</label>
                    <input
                      type="number"
                      id="start_y"
                      name="start_y"
                      value={formData.start_y === undefined ? '' : formData.start_y}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="e.g., 100"
                    />
                  </div>
                </div>
              </div>
              
              <div className="border rounded p-4 bg-green-50">
                <h3 className="text-md font-medium mb-2">End Position</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="end_x" className="block text-sm font-medium mb-1">X Coordinate</label>
                    <input
                      type="number"
                      id="end_x"
                      name="end_x"
                      value={formData.end_x === undefined ? '' : formData.end_x}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="e.g., 300"
                    />
                  </div>
                  <div>
                    <label htmlFor="end_y" className="block text-sm font-medium mb-1">Y Coordinate</label>
                    <input
                      type="number"
                      id="end_y"
                      name="end_y"
                      value={formData.end_y === undefined ? '' : formData.end_y}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="e.g., 300"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label htmlFor="movement_type" className="block text-sm font-medium mb-1">Movement Type</label>
              <select
                id="movement_type"
                name="movement_type"
                value={formData.movement_type || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select a movement type</option>
                <option value="linear">Linear (Straight line)</option>
                <option value="curved">Curved (Arc)</option>
                <option value="bezier">Bezier (Complex curve)</option>
              </select>
            </div>
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
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 