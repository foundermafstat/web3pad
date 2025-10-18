'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DemoShooterController from '@/components/DemoShooterController';
import { ArrowLeft, Wifi, WifiOff } from 'lucide-react';

export default function ShooterControllerPage() {
  const searchParams = useSearchParams();
  const [roomId, setRoomId] = useState('');
  useEffect(() => {
    const id = searchParams.get('roomId') || 'test-shooter-' + Math.random().toString(36).substring(7);
    setRoomId(id);
  }, [searchParams]);

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Главная
            </button>
            <div className="text-white">
              <span className="text-gray-400">Комната: </span>
              <span className="font-mono text-sm">{roomId}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white">
            <Wifi className="w-5 h-5 text-green-400" />
            <span className="text-green-400">Демо режим</span>
          </div>
        </div>
      </div>

      {/* Game Controller */}
      <div className="w-full h-full">
        <DemoShooterController
          roomId={roomId}
          onBack={handleBackToHome}
        />
      </div>

    </div>
  );
}
