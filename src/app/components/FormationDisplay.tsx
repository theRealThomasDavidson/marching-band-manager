import { useState } from 'react';
import FormationBoard from './FormationBoard';
import { BandMember } from '@/models/BandMember';

interface FormationDisplayProps {
  members: BandMember[];
}

export default function FormationDisplay({ members }: FormationDisplayProps) {
  const [showStarting, setShowStarting] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {showStarting ? 'Starting' : 'Ending'} Positions
        </h2>
        <button
          onClick={() => setShowStarting(!showStarting)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Show {showStarting ? 'Ending' : 'Starting'} Positions
        </button>
      </div>

      <div className="w-full aspect-[100/54] relative">
        <FormationBoard
          members={members}
          type={showStarting ? 'start' : 'end'}
          width={1000}
          height={540}
        />
      </div>
    </div>
  );
} 