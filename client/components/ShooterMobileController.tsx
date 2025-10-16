'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Gamepad2, Shield, Zap, Target } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface GameState {
  players: any[];
  bullets: any[];
  bots: any[];
  obstacles: any[];
  interactiveObjects: any[];
}

interface ShooterMobileControllerProps {
  roomId: string;
  onAuthSuccess: (walletAddress: string) => void;
  onGameEnd: (finalScore: number, kills: number, deaths: number) => void;
}

export default function ShooterMobileController({ 
  roomId, 
  onAuthSuccess, 
  onGameEnd 
}: ShooterMobileControllerProps) {
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerStats, setPlayerStats] = useState({
    kills: 0,
    deaths: 0,
    botKills: 0,
    lives: 3
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastInputRef = useRef({ x: 0, y: 0 });
  const lastAimRef = useRef({ x: 0, y: 0 });

  // Initialize WebSocket connection
  useEffect(() => {
    if (isAuthenticated && walletAddress) {
      connectToGame();
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isAuthenticated, walletAddress]);

  const connectToGame = () => {
    console.log('Connecting to shooter game with roomId:', roomId, 'walletAddress:', walletAddress);
    const ws = new WebSocket(`ws://localhost:3001`);
    
    ws.onopen = () => {
      console.log('Connected to shooter game');
      setIsConnected(true);
      
      // Send authentication for shooter game
      const authData = {
        type: 'shooter:auth',
        roomId: roomId,
        walletAddress: walletAddress,
        playerName: session?.user?.name || 'Player'
      };
      console.log('Sending auth data:', authData);
      ws.send(JSON.stringify(authData));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'shooter:auth:success':
          console.log('Authentication successful:', data);
          break;
        case 'shooter:auth:error':
          setError(data.message);
          break;
        case 'gameState':
          setGameState(data);
          updatePlayerStats(data);
          break;
        case 'shooter:player:joined':
          console.log('Player joined:', data);
          break;
        case 'playerHit':
          handlePlayerHit(data);
          break;
        case 'gameOver':
          handleGameOver(data);
          break;
        case 'error':
          setError(data.message);
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error');
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      console.log('Disconnected from game, code:', event.code, 'reason:', event.reason);
      if (event.code !== 1000) {
        setError('Connection lost. Please try again.');
      }
    };

    wsRef.current = ws;
  };

  const updatePlayerStats = (state: GameState) => {
    if (!walletAddress) return;
    
    const player = state.players.find(p => p.id === walletAddress);
    if (player) {
      setPlayerStats({
        kills: player.kills || 0,
        deaths: player.deaths || 0,
        botKills: player.botKills || 0,
        lives: 3 - (player.deaths || 0)
      });
    }
  };

  const handlePlayerHit = (data: any) => {
    if (data.playerId === walletAddress) {
      setPlayerStats(prev => ({
        ...prev,
        deaths: prev.deaths + 1,
        lives: prev.lives - 1
      }));
      
      if (playerStats.lives <= 1) {
        setIsGameOver(true);
        onGameEnd(playerStats.kills + playerStats.botKills, playerStats.kills, playerStats.deaths + 1);
      }
    }
  };

  const handleGameOver = (data: any) => {
    setIsGameOver(true);
    onGameEnd(data.finalScore, data.kills, data.deaths);
  };

  const handleWalletAuth = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if Leather wallet is available
      if (typeof window !== 'undefined' && (window as any).leather) {
        const response = await (window as any).leather.request('getAddresses', {});
        
        if (response.addresses && response.addresses.length > 0) {
          const address = response.addresses[0].address;
          setWalletAddress(address);
          setIsAuthenticated(true);
          onAuthSuccess(address);
        } else {
          setError('No wallet addresses found');
        }
      } else {
        setError('Leather wallet not found. Please install Leather wallet.');
      }
    } catch (error) {
      console.error('Wallet auth error:', error);
      setError('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const sendInput = (input: { x: number; y: number }) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'shooter:input',
        input: input
      }));
      lastInputRef.current = input;
    }
  };

  const sendAim = (direction: { x: number; y: number }) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'shooter:aim',
        direction: direction
      }));
      lastAimRef.current = direction;
    }
  };

  const sendShoot = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'shooter:shoot'
      }));
    }
  };

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width;
    const y = (touch.clientY - rect.top) / rect.height;
    
    // Convert to -1 to 1 range
    const inputX = (x - 0.5) * 2;
    const inputY = (y - 0.5) * 2;
    
    sendInput({ x: inputX, y: inputY });
    sendAim({ x: inputX, y: inputY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width;
    const y = (touch.clientY - rect.top) / rect.height;
    
    const inputX = (x - 0.5) * 2;
    const inputY = (y - 0.5) * 2;
    
    sendInput({ x: inputX, y: inputY });
    sendAim({ x: inputX, y: inputY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    sendInput({ x: 0, y: 0 });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Gamepad2 className="w-6 h-6" />
              Shooter Game Controller
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Connect wallet to play. Your address will be used to save results to blockchain.
              </AlertDescription>
            </Alert>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={handleWalletAuth} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Wallet'
              )}
            </Button>
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
            <CardTitle className="text-red-400">Game Over!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="space-y-2">
              <p className="text-lg">Final Score: {playerStats.kills + playerStats.botKills}</p>
              <p>Player Kills: {playerStats.kills}</p>
              <p>Bot Kills: {playerStats.botKills}</p>
              <p>Deaths: {playerStats.deaths}</p>
            </div>
            <Alert>
              <AlertDescription>
                Results saved to blockchain!
              </AlertDescription>
            </Alert>
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
              <span>Kills: {playerStats.kills}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Lives: {playerStats.lives}</span>
            </div>
          </div>
          <div className="text-sm opacity-75">
            {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative">
        <div
          className="w-full h-full bg-gray-900 relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Game objects would be rendered here */}
          {gameState && (
            <>
              {/* Players */}
              {gameState.players.map((player) => (
                <div
                  key={player.id}
                  className="absolute w-8 h-8 rounded-full border-2"
                  style={{
                    left: `${(player.x / 1920) * 100}%`,
                    top: `${(player.y / 1080) * 100}%`,
                    backgroundColor: player.color,
                    borderColor: player.alive ? '#fff' : '#666'
                  }}
                />
              ))}
              
              {/* Bots */}
              {gameState.bots.map((bot) => (
                <div
                  key={bot.id}
                  className="absolute rounded border-2 border-red-500"
                  style={{
                    left: `${(bot.x / 1920) * 100}%`,
                    top: `${(bot.y / 1080) * 100}%`,
                    width: `${(bot.size / 1920) * 100}%`,
                    height: `${(bot.size / 1080) * 100}%`,
                    backgroundColor: bot.alive ? '#ff4444' : '#666'
                  }}
                />
              ))}
              
              {/* Bullets */}
              {gameState.bullets.map((bullet) => (
                <div
                  key={bullet.id}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    left: `${(bullet.x / 1920) * 100}%`,
                    top: `${(bullet.y / 1080) * 100}%`
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="bg-black/20 backdrop-blur-sm p-4">
        <div className="flex justify-center gap-4">
          <Button
            onTouchStart={(e) => {
              e.preventDefault();
              sendShoot();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg"
          >
            <Zap className="w-6 h-6 mr-2" />
            SHOOT
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded">
          Disconnected
        </div>
      )}
    </div>
  );
}
