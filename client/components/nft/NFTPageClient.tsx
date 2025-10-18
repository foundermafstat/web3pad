'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Trophy, Package, Plus, ExternalLink, Upload } from 'lucide-react';
import { useWalletCheck } from '@/hooks/useWalletCheck';

// Dynamic imports to avoid SSR issues
const NFTCollection = React.lazy(() => import('./NFTCollection'));
const GameAchievementNFT = React.lazy(() => import('./GameAchievementNFT'));
const NFTTestComponent = React.lazy(() => import('./NFTTestComponent'));

export default function NFTPageClient() {
  const { isConnected, userAddress, privateKey } = useWalletCheck();
  const [activeTab, setActiveTab] = useState('collection');

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <CardTitle>Подключите кошелек</CardTitle>
            <CardDescription>
              Для работы с NFT необходимо подключить кошелек Stacks
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/auth'}>
              Подключить кошелек
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">NFT Коллекция</h1>
          <p className="text-gray-600">
            Создавайте и управляйте своими игровыми NFT
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline">
              {userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Не подключен'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`https://explorer.stacks.co/address/${userAddress}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="collection" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Коллекция
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Достижения
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Создать
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Тест IPFS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collection" className="space-y-4">
            <React.Suspense fallback={<div>Загрузка коллекции...</div>}>
              <NFTCollection
                userAddress={userAddress!}
                privateKey={privateKey!}
                onMintSuccess={(nft) => {
                  console.log('NFT minted successfully:', nft);
                }}
              />
            </React.Suspense>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <React.Suspense fallback={<div>Загрузка достижений...</div>}>
                {/* Shooter Achievement */}
                <GameAchievementNFT
                  gameType="shooter"
                  score={1250}
                  level={5}
                  sessionData={{ kills: 15, deaths: 3, accuracy: 0.75 }}
                  userAddress={userAddress!}
                  privateKey={privateKey!}
                  onMintSuccess={(result) => {
                    console.log('Achievement NFT minted:', result);
                  }}
                />

                {/* Race Achievement */}
                <GameAchievementNFT
                  gameType="race"
                  score={850}
                  level={3}
                  sessionData={{ time: 45.2, position: 1, laps: 3 }}
                  userAddress={userAddress!}
                  privateKey={privateKey!}
                  onMintSuccess={(result) => {
                    console.log('Achievement NFT minted:', result);
                  }}
                />

                {/* Tower Defence Achievement */}
                <GameAchievementNFT
                  gameType="towerdefence"
                  score={2000}
                  level={8}
                  sessionData={{ waves: 10, towers: 15, enemies: 150 }}
                  userAddress={userAddress!}
                  privateKey={privateKey!}
                  onMintSuccess={(result) => {
                    console.log('Achievement NFT minted:', result);
                  }}
                />
              </React.Suspense>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Создать NFT</CardTitle>
                <CardDescription>
                  Создайте уникальный NFT на основе ваших игровых достижений
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-gray-500">
                    <Package className="h-16 w-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Создание NFT</h3>
                    <p className="text-sm">
                      Используйте вкладку "Коллекция" для создания новых NFT
                    </p>
                  </div>
                  <Button onClick={() => setActiveTab('collection')}>
                    Перейти к коллекции
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <React.Suspense fallback={<div>Загрузка теста IPFS...</div>}>
              <NFTTestComponent />
            </React.Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

