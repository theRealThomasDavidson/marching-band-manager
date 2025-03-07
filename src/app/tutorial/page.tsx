'use client';

import React from 'react';
import Link from 'next/link';

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-green-800 bg-[linear-gradient(45deg,_#166534_25%,_#15803d_25%,_#15803d_50%,_#166534_50%,_#166534_75%,_#15803d_75%,_#15803d_100%)] bg-[length:50px_50px]">
      <div className="bg-green-900/80 text-white py-16 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">How to Be a Band Director</h1>
          <p className="text-xl text-green-100 mb-4">
            Welcome to your first day as a virtual marching band director!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <div className="space-y-8">
            {/* Basic Movement */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-green-900">🎵 Basic Movement</h2>
              <p className="text-green-800">
                Your band members are enthusiastic - maybe a little too enthusiastic! Once they start marching, 
                they'll keep going until they reach their destination or... bump into each other.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-800">
                  <strong>Director's Note:</strong> Band members will only move in straight lines. They're great musicians, 
                  but they haven't mastered diagonal walking yet!
                </p>
              </div>
            </section>

            {/* Collision Warning */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-green-900">⚠️ Collision Prevention</h2>
              <p className="text-green-800">
                Remember: Band members carrying instruments need their personal space! If they collide:
              </p>
              <ul className="list-disc list-inside space-y-2 text-green-800 ml-4">
                <li>Their music will stop playing</li>
                <li>They might drop their instruments</li>
                <li>The formation will be ruined</li>
                <li>The band director (that's you!) will need to reset the formation</li>
              </ul>
            </section>

            {/* Formation Management */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-green-900">🎼 Formation Management</h2>
              <p className="text-green-800">
                To successfully lead your band:
              </p>
              <ul className="list-disc list-inside space-y-2 text-green-800 ml-4">
                <li>Plan your movements carefully - think several steps ahead</li>
                <li>Use the pause button when you need time to think</li>
                <li>Watch for crossing paths - timing is everything!</li>
                <li>Remember: Each band member plays their own unique part in the music</li>
              </ul>
            </section>

            {/* Success Tips */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-green-900">🌟 Keys to Success</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-green-900 mb-2">DO:</h3>
                  <ul className="list-disc list-inside space-y-1 text-green-800">
                    <li>Plan your routes carefully</li>
                    <li>Use the pause button liberally</li>
                    <li>Move one section at a time</li>
                    <li>Listen to the music for timing</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-bold text-red-900 mb-2">DON'T:</h3>
                  <ul className="list-disc list-inside space-y-1 text-red-800">
                    <li>Let members crash into each other</li>
                    <li>Move everyone at once</li>
                    <li>Forget about return paths</li>
                    <li>Rush your decisions</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Ready to Start */}
            <section className="mt-8 text-center">
              <p className="text-green-800 mb-4">Ready to lead your band to musical victory?</p>
              <div className="space-x-4">
                <Link 
                  href="/play/e3abc1f8-5502-4aeb-ba3e-002ddbc5185b" 
                  className="inline-block px-6 py-3 bg-yellow-500 text-green-900 rounded-lg hover:bg-yellow-400 transition-colors font-semibold"
                >
                  Start First Level
                </Link>
                <Link 
                  href="/"
                  className="inline-block px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                >
                  Back to Home
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 