'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Star, Zap, Crown } from 'lucide-react';
import { nftService } from '@/lib/nft-service';

interface GameAchievementNFTProps {
  gameType: string;
  score: number;
  level: number;
  sessionData: any;
  userAddress: string;
  privateKey: string;
  onMintSuccess?: (result: any) => void;
}

export default function GameAchievementNFT({
  gameType,
  score,
  level,
  sessionData,
  userAddress,
  privateKey,
  onMintSuccess,
}: GameAchievementNFTProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [achievement, setAchievement] = useState<any>(null);
  const [mintResult, setMintResult] = useState<any>(null);

  const generateAchievement = async () => {
    setIsGenerating(true);
    try {
      const achievementData = nftService.generateAchievementFromSession(
        gameType,
        score,
        level,
        sessionData
      );
      setAchievement(achievementData);
    } catch (error) {
      console.error('Error generating achievement:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const mintAchievement = async () => {
    if (!achievement) return;

    setIsMinting(true);
    try {
      // Set private key for this session
      nftService.setUserPrivateKey(privateKey);
      
      const result = await nftService.mintAchievementNFT(achievement, userAddress);
      setMintResult(result);
      onMintSuccess?.(result);
    } catch (error) {
      console.error('Error minting achievement:', error);
    } finally {
      setIsMinting(false);
    }
  };

  const getAchievementIcon = (name: string) => {
    if (name.includes('Legendary')) return <Crown className="h-8 w-8 text-yellow-500" />;
    if (name.includes('Master')) return <Star className="h-8 w-8 text-purple-500" />;
    if (name.includes('Rising')) return <Zap className="h-8 w-8 text-blue-500" />;
    return <Trophy className="h-8 w-8 text-green-500" />;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const rarity = achievement?.score > 2000 ? 'legendary' : 
                 achievement?.score > 1000 ? 'epic' : 
                 achievement?.score > 500 ? 'rare' : 'common';

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Игровое достижение
        </CardTitle>
        <CardDescription>
          Создайте NFT на основе ваших игровых достижений
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Game Stats */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Игра</p>
            <p className="font-medium capitalize">{gameType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Счет</p>
            <p className="font-medium">{score}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Уровень</p>
            <p className="font-medium">{level}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Редкость</p>
            <Badge className={getRarityColor(rarity)}>
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Achievement Preview */}
        {achievement && (
          <div className="space-y-3">
            <h4 className="font-medium">Предварительный просмотр NFT</h4>
            <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-3 mb-3">
                {getAchievementIcon(achievement.name)}
                <div>
                  <h5 className="font-semibold">{achievement.name}</h5>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Тип игры:</span>
                  <span className="font-medium capitalize">{achievement.gameType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Счет:</span>
                  <span className="font-medium">{achievement.score}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Уровень:</span>
                  <span className="font-medium">{achievement.level}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Дата:</span>
                  <span className="font-medium">
                    {new Date(achievement.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {!achievement ? (
            <Button
              onClick={generateAchievement}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Генерация достижения...
                </>
              ) : (
                'Сгенерировать достижение'
              )}
            </Button>
          ) : !mintResult ? (
            <Button
              onClick={mintAchievement}
              disabled={isMinting}
              className="w-full"
            >
              {isMinting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Создание NFT...
                </>
              ) : (
                'Создать NFT'
              )}
            </Button>
          ) : (
            <div className="text-center space-y-2">
              <div className="text-green-600 font-medium">
                NFT успешно создан!
              </div>
              <div className="text-sm text-gray-600">
                Token ID: {mintResult.tokenId}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(mintResult.metadataUrl, '_blank')}
              >
                Посмотреть метаданные
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
