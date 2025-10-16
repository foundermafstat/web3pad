'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ShooterMobileController from '@/components/ShooterMobileController';

export default function ShooterControllerPage() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleAuthSuccess = (address: string) => {
    setWalletAddress(address);
    console.log('Wallet authenticated:', address);
  };

  const handleGameEnd = async (finalScore: number, kills: number, deaths: number) => {
    console.log('Game ended:', { finalScore, kills, deaths });
    
    // Here you could show a summary or redirect
    // The blockchain saving is handled by the server
  };

  if (!roomId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>Room ID not specified</p>
        </div>
      </div>
    );
  }

  return (
    <ShooterMobileController
      roomId={roomId}
      onAuthSuccess={handleAuthSuccess}
      onGameEnd={handleGameEnd}
    />
  );
}
