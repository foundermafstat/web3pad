'use client';

import React, { useState, useEffect } from 'react';
import { blockchainService } from '@/lib/blockchain';

interface ContractInfo {
  name: string;
  address: string;
  cost: string;
  status: 'Live' | 'Pending' | 'Failed';
  description: string;
  category: 'registry' | 'game' | 'nft' | 'ft';
}

interface ContractManagerProps {
  onContractSelect?: (contract: ContractInfo) => void;
}

const ContractManager: React.FC<ContractManagerProps> = ({ onContractSelect }) => {
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedContract, setSelectedContract] = useState<ContractInfo | null>(null);
  const [blockchainStatus, setBlockchainStatus] = useState<any>(null);

  useEffect(() => {
    loadContractData();
  }, []);

  const loadContractData = async () => {
    setLoading(true);
    try {
      // Load blockchain status
      const status = await blockchainService.getStatus();
      setBlockchainStatus(status);

      // Load game modules
      const modulesResponse = await blockchainService.getGameModules();
      if (modulesResponse.success && modulesResponse.data) {
        const moduleContracts: ContractInfo[] = modulesResponse.data.map((module: any) => ({
          name: module.name,
          address: module.contractAddress,
          cost: '0.000000', // Would come from deployment data
          status: 'Live' as const,
          description: module.description,
          category: 'registry' as const
        }));
        setContracts(prev => [...prev, ...moduleContracts]);
      }

      // Load FT tokens
      const ftResponse = await blockchainService.getFTTokens();
      if (ftResponse.success && ftResponse.data) {
        const ftContracts: ContractInfo[] = ftResponse.data.map((token: any) => ({
          name: token.name,
          address: token.contractAddress,
          cost: '0.000000',
          status: 'Live' as const,
          description: `FT Token: ${token.symbol}`,
          category: 'ft' as const
        }));
        setContracts(prev => [...prev, ...ftContracts]);
      }

      // Add standard contracts if blockchain is enabled
      if (status?.enabled) {
        const standardContracts: ContractInfo[] = [
          {
            name: 'Registry',
            address: status.registryContract || 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.registry',
            cost: '0.188320 STX',
            status: 'Live',
            description: 'Game modules registry and system management',
            category: 'registry'
          },
          {
            name: 'Shooter Game',
            address: status.shooterContract || 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.shooter-game',
            cost: '0.178630 STX',
            status: 'Live',
            description: 'Main contract for Shooter game with reward system',
            category: 'game'
          },
          {
            name: 'NFT Trait',
            address: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.nft-trait',
            cost: '0.042250 STX',
            status: 'Live',
            description: 'NFT standard for game items and characters',
            category: 'nft'
          },
          {
            name: 'FT Trait',
            address: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.ft-trait',
            cost: '0.050830 STX',
            status: 'Live',
            description: 'FT token standard for game currency',
            category: 'ft'
          }
        ];
        setContracts(prev => [...prev, ...standardContracts]);
      }

    } catch (error) {
      console.error('Error loading contract data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContractSelect = (contract: ContractInfo) => {
    setSelectedContract(contract);
    onContractSelect?.(contract);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'registry':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'game':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        );
      case 'nft':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        );
      case 'ft':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Live':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
            Live
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1"></div>
            Pending
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></div>
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading contract status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Contract Management</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Interaction with deployed contracts in Stacks Testnet
            </p>
          </div>
          {blockchainStatus && (
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              blockchainStatus.enabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {blockchainStatus.enabled ? 'Connected' : 'Disconnected'}
            </div>
          )}
        </div>
      </div>

      {/* Network Info */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Network:</span>
            <span className="ml-2 text-gray-600">Stacks Testnet</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Deployment Address:</span>
            <span className="ml-2 text-gray-600 font-mono text-xs">
              ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Total Cost:</span>
            <span className="ml-2 text-gray-600">0.460030 STX</span>
          </div>
        </div>
      </div>

      {/* Contracts Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contracts.map((contract, index) => (
            <div
              key={index}
              onClick={() => handleContractSelect(contract)}
              className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedContract?.name === contract.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  {getCategoryIcon(contract.category)}
                  <h3 className="ml-2 font-semibold text-gray-900">{contract.name}</h3>
                </div>
                {getStatusBadge(contract.status)}
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {contract.description}
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Cost:</span>
                  <span className="font-medium text-gray-700">{contract.cost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Address:</span>
                  <span className="font-mono text-gray-700 truncate ml-2">
                    {contract.address.split('.')[1]}
                  </span>
                </div>
              </div>

              {selectedContract?.name === contract.name && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Selected Contract Details */}
        {selectedContract && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-blue-900">
                Contract Details: {selectedContract.name}
              </h4>
              <button
                onClick={() => setSelectedContract(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Full Address:</span>
                <p className="font-mono text-blue-700 break-all mt-1">
                  {selectedContract.address}
                </p>
              </div>
              <div>
                <span className="font-medium text-blue-800">Category:</span>
                <p className="text-blue-700 capitalize mt-1">{selectedContract.category}</p>
              </div>
              <div>
                <span className="font-medium text-blue-800">Status:</span>
                <div className="mt-1">{getStatusBadge(selectedContract.status)}</div>
              </div>
              <div>
                <span className="font-medium text-blue-800">Deployment Cost:</span>
                <p className="text-blue-700 mt-1">{selectedContract.cost}</p>
              </div>
            </div>

            <div className="mt-4">
              <span className="font-medium text-blue-800">Description:</span>
              <p className="text-blue-700 mt-1">{selectedContract.description}</p>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                Interact
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm">
                View Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractManager;
