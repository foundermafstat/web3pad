'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ContractManager from '@/components/contracts/ContractManager';
import RegistryInterface from '@/components/contracts/RegistryInterface';
import ShooterGameInterface from '@/components/contracts/ShooterGameInterface';
import NFTInterface from '@/components/contracts/NFTInterface';
import FTInterface from '@/components/contracts/FTInterface';
import { blockchainService, BlockchainStatus } from '@/lib/blockchain';

interface ContractInfo {
  name: string;
  address: string;
  cost: string;
  status: 'Live' | 'Pending' | 'Failed';
  description: string;
  category: 'registry' | 'game' | 'nft' | 'ft';
}

const ContractsPage: React.FC = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'overview' | 'registry' | 'game' | 'nft' | 'ft'>('overview');
  const [blockchainStatus, setBlockchainStatus] = useState<BlockchainStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<ContractInfo | null>(null);

  useEffect(() => {
    loadBlockchainStatus();
  }, []);

  const loadBlockchainStatus = async () => {
    try {
      const status = await blockchainService.getStatus();
      setBlockchainStatus(status);
    } catch (error) {
      console.error('Error loading blockchain status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContractSelect = (contract: ContractInfo) => {
    setSelectedContract(contract);
    
    // Switch to appropriate tab based on contract category
    switch (contract.category) {
      case 'registry':
        setActiveTab('registry');
        break;
      case 'game':
        setActiveTab('game');
        break;
      case 'nft':
        setActiveTab('nft');
        break;
      case 'ft':
        setActiveTab('ft');
        break;
      default:
        setActiveTab('overview');
    }
  };

  const getPlayerAddress = () => {
    // In real implementation, this would get the player's Stacks address from session or wallet
    return session?.user?.email ? 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' : undefined;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка интерфейса контрактов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Управление контрактами</h1>
              {blockchainStatus && (
                <div className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${
                  blockchainStatus.enabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {blockchainStatus.enabled ? 'Блокчейн подключен' : 'Блокчейн отключен'}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {session && (
                <div className="text-sm text-gray-600">
                  Подключен как: <span className="font-medium">{session.user?.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Обзор', icon: '📋' },
              { id: 'registry', name: 'Registry', icon: '📚' },
              { id: 'game', name: 'Shooter Game', icon: '🎮' },
              { id: 'nft', name: 'NFT', icon: '🖼️' },
              { id: 'ft', name: 'FT Tokens', icon: '🪙' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Blockchain Status Banner */}
        {blockchainStatus && !blockchainStatus.enabled && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Блокчейн интеграция отключена
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Некоторые функции могут быть недоступны. Проверьте настройки сервера.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Network Information */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Информация о сети</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">Testnet</div>
                    <div className="text-sm text-gray-600">Сеть</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">4</div>
                    <div className="text-sm text-gray-600">Задеплоенных контрактов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">0.460030</div>
                    <div className="text-sm text-gray-600">Общая стоимость (STX)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">Live</div>
                    <div className="text-sm text-gray-600">Статус всех контрактов</div>
                  </div>
                </div>
              </div>

              {/* Contract Manager */}
              <ContractManager onContractSelect={handleContractSelect} />

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Быстрые действия</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('registry')}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">📚</div>
                    <h3 className="font-semibold text-gray-900">Registry</h3>
                    <p className="text-sm text-gray-600">Управление игровыми модулями</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('game')}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">🎮</div>
                    <h3 className="font-semibold text-gray-900">Shooter Game</h3>
                    <p className="text-sm text-gray-600">Игровые сессии и результаты</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('nft')}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">🖼️</div>
                    <h3 className="font-semibold text-gray-900">NFT</h3>
                    <p className="text-sm text-gray-600">Создание и управление NFT</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('ft')}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">🪙</div>
                    <h3 className="font-semibold text-gray-900">FT Tokens</h3>
                    <p className="text-sm text-gray-600">Токены и переводы</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'registry' && (
            <RegistryInterface />
          )}

          {activeTab === 'game' && (
            <ShooterGameInterface playerAddress={getPlayerAddress()} />
          )}

          {activeTab === 'nft' && (
            <NFTInterface playerAddress={getPlayerAddress()} />
          )}

          {activeTab === 'ft' && (
            <FTInterface playerAddress={getPlayerAddress()} />
          )}
        </div>

        {/* Selected Contract Info */}
        {selectedContract && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{selectedContract.name}</h4>
              <button
                onClick={() => setSelectedContract(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">{selectedContract.description}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Адрес:</span>
              <span className="font-mono text-gray-700">
                {selectedContract.address.split('.')[1]}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Стоимость:</span>
              <span className="text-gray-700">{selectedContract.cost}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractsPage;
