'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { ENV_CONFIG } from '../../../env.config';
import DemoShooterController from '@/components/DemoShooterController';
import { ArrowLeft, Users, Wifi, WifiOff, Share2 } from 'lucide-react';
import GameQRGenerator from '@/components/GameQRGenerator';

export default function GamePage() {
  const params = useParams();
  const gameUrl = params.gameUrl as string;
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [controllers, setControllers] = useState<any[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Generate room ID from game URL
    const id = `game-${gameUrl}-${Date.now()}`;
    setRoomId(id);

    // Generate initial QR code URL
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const controllerUrl = `${baseUrl}/play/${gameUrl}/controller`;
    setQrCodeUrl(controllerUrl);

    // Initialize socket connection
    const socket = io(ENV_CONFIG.SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[GamePage] Socket connected');
      setIsConnected(true);
      
      // Join game room using shooter game type
      socket.emit('game:create', {
        gameType: 'shooter',
        roomId: id,
        config: {
          name: `Game ${gameUrl}`,
          maxPlayers: 10,
          hostId: socket.id,
          hostName: 'Host'
        }
      });
    });

    socket.on('disconnect', () => {
      console.log('[GamePage] Socket disconnected');
      setIsConnected(false);
    });

    socket.on('player:joined', (player: any) => {
      console.log('[GamePage] Player joined:', player);
      setPlayers(prev => [...prev, player]);
      
      // Start game when first player joins
      if (players.length === 0) {
        setGameStarted(true);
      }
    });

    socket.on('player:left', (playerId: string) => {
      console.log('[GamePage] Player left:', playerId);
      setPlayers(prev => prev.filter(p => p.id !== playerId));
    });

    socket.on('controller:joined', (controller: any) => {
      console.log('[GamePage] Controller joined:', controller);
      setControllers(prev => [...prev, controller]);
      
      // Generate new QR code when controller joins
      const newControllerUrl = `${baseUrl}/play/${gameUrl}/controller?t=${Date.now()}`;
      setQrCodeUrl(newControllerUrl);
      
      // Start game when first controller joins
      if (controllers.length === 0) {
        setGameStarted(true);
      }
    });

    socket.on('controller:left', (controllerId: string) => {
      console.log('[GamePage] Controller left:', controllerId);
      setControllers(prev => prev.filter(c => c.id !== controllerId));
    });

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [gameUrl]);

  // Canvas animation for waiting screen
  useEffect(() => {
    if (gameStarted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 64;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let time = 0;

    const animate = () => {
      if (gameStarted) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw pulsing circle
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = 50 + Math.sin(time * 0.02) * 20;

      ctx.fillStyle = `rgba(59, 130, 246, ${0.3 + Math.sin(time * 0.03) * 0.2})`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Ожидание игроков...', centerX, centerY - 10);

      ctx.font = '16px Arial';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(`Игроков: ${players.length}`, centerX, centerY + 20);
      ctx.fillText(`Контроллеров: ${controllers.length}`, centerX, centerY + 40);

      time++;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [gameStarted, players.length, controllers.length]);

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const handleShareQR = () => {
    setShowQRGenerator(true);
  };

  if (gameStarted) {
    return (
      <div className="fixed inset-0 w-full h-full bg-gray-900">
        <DemoShooterController
          roomId={roomId}
          onBack={() => setGameStarted(false)}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-black">
      {/* Header */}
      <div className="absolute top-10 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm p-4">
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
          <div className="flex items-center gap-4">
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
            <button
              onClick={handleShareQR}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Поделиться
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Waiting Screen */}
      <div className="w-full h-full pt-16">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block' }}
        />
      </div>

      {/* Players List Overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Users className="w-6 h-6 text-blue-400" />
              <div>
                <p className="font-semibold">Подключенные игроки</p>
                <p className="text-sm text-gray-400">
                  {players.length === 0 && controllers.length === 0
                    ? 'Ожидание подключения...' 
                    : `${players.length} игрок(ов), ${controllers.length} контроллер(ов)`
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">URL игры:</p>
              <p className="font-mono text-xs">{gameUrl}</p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Generator Modal */}
      {showQRGenerator && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">QR-код для контроллера</h3>
              <button
                onClick={() => setShowQRGenerator(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="text-center">
              {/* QR Code Placeholder */}
              <div className="w-48 h-48 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-400 rounded mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">QR-код</p>
                  <p className="text-gray-500 text-xs">Контроллеры: {controllers.length}</p>
                </div>
              </div>

              {/* URL Display */}
              <div className="bg-gray-700 rounded p-3 mb-4">
                <p className="text-gray-300 text-sm break-all">{qrCodeUrl}</p>
              </div>

              {/* Copy Button */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(qrCodeUrl);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors mx-auto"
              >
                Скопировать ссылку
              </button>

              {/* Instructions */}
              <div className="mt-4 text-gray-400 text-sm">
                <p>Отсканируйте QR-код для подключения как контроллер</p>
                <p>QR-код обновляется при каждом подключении</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
