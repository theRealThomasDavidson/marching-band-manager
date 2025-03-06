'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestLevel() {
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        
        // Try the simplest possible query
        const { data, error } = await supabase
          .from('levels')
          .select('*')
          .limit(1);
        
        console.log('Query result:', { data, error });
        
        if (error) {
          throw error;
        }
        
        setData(data);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Supabase Test</h1>
      {error && (
        <div className="text-red-600">
          Error: {error}
        </div>
      )}
      {data && (
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
} 