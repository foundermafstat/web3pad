'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Shield, Zap, Target, ArrowLeft } from 'lucide-react';

interface DemoShooterControllerProps {
  roomId: string;
  onBack: () => void;
}

export default function DemoShooterController({ roomId, onBack }: DemoShooterControllerProps) {
  const [playerStats, setPlayerStats] = useState({
    kills: 0,
    deaths: 0,
    botKills: 0,
    lives: 3
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number | null>(null);

  // Auto-connect on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Game timer
  useEffect(() => {
    if (isConnected && !isGameOver) {
      const interval = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isConnected, isGameOver]);

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width;
    const y = (touch.clientY - rect.top) / rect.height;
    
    // Simulate movement
    if (Math.random() > 0.7) {
      setPlayerStats(prev => ({
        ...prev,
        kills: prev.kills + 1
      }));
    }
  };

  const handleShoot = () => {
    if (Math.random() > 0.5) {
      setPlayerStats(prev => ({
        ...prev,
        kills: prev.kills + 1,
        botKills: prev.botKills + 1
      }));
    } else {
      setPlayerStats(prev => ({
        ...prev,
        deaths: prev.deaths + 1,
        lives: prev.lives - 1
      }));

      if (playerStats.lives <= 1) {
        setIsGameOver(true);
      }
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Gamepad2 className="w-6 h-6" />
              Подключение к игре...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-300">Подключение к комнате: {roomId}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-400">Игра завершена!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="space-y-2">
              <p className="text-lg">Финальный счет: <span className="text-yellow-400 font-bold">{playerStats.kills + playerStats.botKills}</span></p>
              <p>Убийства игроков: <span className="text-green-400 font-bold">{playerStats.kills}</span></p>
              <p>Убийства ботов: <span className="text-blue-400 font-bold">{playerStats.botKills}</span></p>
              <p>Смерти: <span className="text-red-400 font-bold">{playerStats.deaths}</span></p>
              <p>Время игры: <span className="text-gray-400 font-bold">{Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}</span></p>
            </div>
            <div className="mt-6">
              <Button
                onClick={onBack}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться к слайдеру
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
      {/* Game Stats Header */}
      <div className="bg-black/20 backdrop-blur-sm p-4">
        <div className="flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <span>Убийства: {playerStats.kills}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Жизни: {playerStats.lives}</span>
            </div>
            <div className="text-sm opacity-75">
              Время: {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <div className="text-sm opacity-75">
            Комната: {roomId}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative">
        <div
          ref={gameAreaRef}
          className="w-full h-full bg-gray-900 relative overflow-hidden"
          onTouchStart={handleTouchStart}
        >
          {/* Demo game objects */}
          <div className="absolute inset-0">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="absolute w-px h-full bg-white" style={{ left: `${i * 5}%` }} />
              ))}
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="absolute w-full h-px bg-white" style={{ top: `${i * 6.67}%` }} />
              ))}
            </div>

            {/* Demo enemies */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-8 h-8 bg-red-500 rounded-full animate-pulse"
                style={{
                  left: `${20 + i * 30}%`,
                  top: `${30 + i * 20}%`,
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}

            {/* Demo bullets */}
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                style={{
                  left: `${40 + i * 20}%`,
                  top: `${50 + i * 10}%`,
                  animationDelay: `${i * 0.3}s`
                }}
              />
            ))}

            {/* Center crosshair */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 border-2 border-white rounded-full opacity-50">
                <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Touch instruction */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center text-white/50 text-sm">
            Касайтесь экрана для движения
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="bg-black/20 backdrop-blur-sm p-4">
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleShoot}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg"
          >
            <Zap className="w-6 h-6 mr-2" />
            СТРЕЛЯТЬ
          </Button>
        </div>
      </div>
    </div>
  );
}
