'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect to the main level creation page
 */
export default function NewLevelRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/levels/new');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-gray-600">Taking you to the level creator</p>
      </div>
    </div>
  );
} 