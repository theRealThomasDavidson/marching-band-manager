'use client';

import BandPatternGenerator from '@/components/BandPatternGenerator';

export default function MidiGeneratorPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">MIDI Pattern Generator</h1>
          <BandPatternGenerator />
        </div>
      </div>
    </div>
  );
} 