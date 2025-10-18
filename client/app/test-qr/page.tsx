'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import GameUrlGenerator from '@/components/GameUrlGenerator';
import { ArrowLeft, Gamepad2, QrCode } from 'lucide-react';

export default function TestQRPage() {
  const router = useRouter();
  const [gameUrl, setGameUrl] = useState<string>('');

  const handleGameCreated = (url: string) => {
    setGameUrl(url);
    console.log('Game created with URL:', url);
  };

  const handleOpenGame = () => {
    if (gameUrl) {
      router.push(`/play/${gameUrl}`);
    }
  };

  const handleOpenController = () => {
    if (gameUrl) {
      router.push(`/play/${gameUrl}/controller`);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <QrCode className="w-8 h-8 text-white" />
            <h1 className="text-white text-3xl font-bold">Тест QR-кода</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Создайте игру и протестируйте подключение контроллеров
          </p>
        </div>

        {/* Game URL Generator */}
        <GameUrlGenerator onGameCreated={handleGameCreated} />

        {/* Game Info */}
        {gameUrl && (
          <div className="mt-8 bg-black/20 backdrop-blur-sm rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-4 text-center">Игра создана!</h3>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-300 mb-2">URL игры:</p>
                <div className="bg-gray-800 rounded p-3 font-mono text-sm break-all">
                  {gameUrl}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleOpenGame}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded transition-colors"
                >
                  <Gamepad2 className="w-5 h-5 inline mr-2" />
                  Открыть игру (Desktop)
                </button>
                <button
                  onClick={handleOpenController}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded transition-colors"
                >
                  <QrCode className="w-5 h-5 inline mr-2" />
                  Открыть контроллер (Mobile)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-900/20 backdrop-blur-sm rounded-lg p-6 text-white">
          <h4 className="text-lg font-semibold mb-3">Как тестировать:</h4>
          <ol className="space-y-2 text-sm text-gray-300">
            <li>1. Создайте игру - получите уникальный URL</li>
            <li>2. Откройте игру на десктопе - увидите Canvas с ожиданием</li>
            <li>3. Нажмите "Поделиться" - откроется QR-код</li>
            <li>4. Откройте контроллер на мобильном - имитируйте сканирование QR</li>
            <li>5. Контроллер подключится и QR-код обновится</li>
            <li>6. Игра запустится автоматически</li>
          </ol>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Вернуться на главную
          </button>
        </div>
      </div>
    </div>
  );
}
