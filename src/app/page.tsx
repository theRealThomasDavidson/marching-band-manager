import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">Marching Band Manager</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Create, edit, and play marching band formations with synchronized music.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-3">Level Editor</h2>
            <p className="mb-4">
              Create and edit levels, design formations, and compose music for your marching band.
            </p>
            <Link 
              href="/editor/levels" 
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Editor
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-3">Play Mode</h2>
            <p className="mb-4">
              Select a level and play through the marching band formations with synchronized music.
            </p>
            <Link 
              href="/play" 
              className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Start Playing
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-20 text-center text-gray-600">
        <p>
          Built with Next.js, TypeScript, Supabase, PIXI.js, and Tone.js
        </p>
      </div>
    </div>
  );
} 