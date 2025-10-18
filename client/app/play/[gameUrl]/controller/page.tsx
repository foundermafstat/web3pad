'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { ENV_CONFIG } from '../../../../env.config';
import DemoShooterController from '@/components/DemoShooterController';
import { ArrowLeft, Wifi, WifiOff } from 'lucide-react';

export default function ControllerPage() {
  const params = useParams();
  const gameUrl = params.gameUrl as string;
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Generate room ID from game URL
    const id = `game-${gameUrl}-${Date.now()}`;
    setRoomId(id);
    const player = 'player-' + Math.random().toString(36).substring(7);
    setPlayerId(player);

    // Initialize socket connection
    const socket = io(ENV_CONFIG.SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[ControllerPage] Socket connected');
      setIsConnected(true);
      
      // Join as controller
      socket.emit('controller:join', {
        roomId: id,
        gameType: 'shooter',
        playerId: player,
        controllerType: 'mobile'
      });
    });

    socket.on('disconnect', () => {
      console.log('[ControllerPage] Socket disconnected');
      setIsConnected(false);
    });

    socket.on('controller:joined', (data: any) => {
      console.log('[ControllerPage] Controller joined:', data);
    });

    socket.on('error', (error: any) => {
      console.error('[ControllerPage] Socket error:', error);
    });

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [gameUrl]);

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
              <span className="text-gray-400">Игра: </span>
              <span className="font-mono text-sm">{gameUrl}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white">
            {isConnected ? (
              <>
                <Wifi className="w-5 h-5 text-green-400" />
                <span className="text-green-400">Подключено</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-400" />
                <span className="text-red-400">Отключено</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Controller */}
      <div className="w-full h-full">
        <DemoShooterController
          roomId={roomId}
          onBack={handleBackToHome}
        />
      </div>
    </div>
  );
}
