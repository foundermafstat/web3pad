'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ClipboardList, BookOpen, Gamepad2, Image, Coins } from 'lucide-react';
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
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [networkInfo, setNetworkInfo] = useState({
    network: 'Testnet',
    deployedContracts: 0,
    totalCost: '0.000000',
    status: 'Unknown'
  });

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    try {
      // Load blockchain status
      const status = await blockchainService.getStatus();
      setBlockchainStatus(status);

      // Load game modules (contracts)
      const modulesResponse = await blockchainService.getGameModules();
      if (modulesResponse.success && modulesResponse.data) {
        const contractList: ContractInfo[] = modulesResponse.data.map((module: any) => ({
          name: module.name,
          address: module.contractAddress,
          cost: '0.000000', // This would come from deployment cost
          status: 'Live' as const,
          description: module.description,
          category: 'registry' as const
        }));
        setContracts(contractList);
        setNetworkInfo(prev => ({
          ...prev,
          deployedContracts: contractList.length,
          status: contractList.length > 0 ? 'Live' : 'No Contracts'
        }));
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

      // Update network info based on blockchain status
      if (status) {
        setNetworkInfo(prev => ({
          ...prev,
          network: status.network,
          status: status.enabled ? 'Connected' : 'Disconnected'
        }));
      }

    } catch (error) {
      console.error('Error loading blockchain data:', error);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading contracts interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border border-border rounded-md mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-6 lg:pt-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-foreground">Contract Management</h1>
              {blockchainStatus && (
                <div className={`ml-4 px-3 py-1 rounded-full text-xs font-medium border ${
                  blockchainStatus.enabled 
                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  {blockchainStatus.enabled ? 'Blockchain Connected' : 'Blockchain Disconnected'}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {session && (
                <div className="text-sm text-muted-foreground">
                  Connected as: <span className="font-medium text-foreground">{session.user?.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-card border border-border rounded-md mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: <ClipboardList className="w-4 h-4" /> },
              { id: 'registry', name: 'Registry', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'game', name: 'Shooter Game', icon: <Gamepad2 className="w-4 h-4" /> },
              { id: 'nft', name: 'NFT', icon: <Image className="w-4 h-4" /> },
              { id: 'ft', name: 'FT Tokens', icon: <Coins className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <span className={`mr-2 inline-flex items-center justify-center w-6 h-6 rounded-md ${
                  activeTab === tab.id
                    ? 'bg-primary/50 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {tab.icon}
                </span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Blockchain Status Banner */}
        {blockchainStatus && !blockchainStatus.enabled && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-600">
                  Blockchain integration disabled
                </h3>
                <p className="text-sm text-yellow-500 mt-1">
                  Some features may be unavailable. Check server settings.
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
              <div className="bg-card border border-border rounded-md p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Network Information</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-card border border-border rounded-md p-4">
                    <div className="text-2xl font-bold text-primary">{networkInfo.network}</div>
                    <div className="text-xs text-muted-foreground">Network</div>
                  </div>
                  <div className="bg-card border border-border rounded-md p-4">
                    <div className="text-2xl font-bold text-green-500">{networkInfo.deployedContracts}</div>
                    <div className="text-xs text-muted-foreground">Deployed Contracts</div>
                  </div>
                  <div className="bg-card border border-border rounded-md p-4">
                    <div className="text-2xl font-bold text-purple-500">{networkInfo.totalCost}</div>
                    <div className="text-xs text-muted-foreground">Total Cost (STX)</div>
                  </div>
                  <div className="bg-card border border-border rounded-md p-4">
                    <div className={`text-2xl font-bold ${
                      networkInfo.status === 'Live' || networkInfo.status === 'Connected' 
                        ? 'text-green-500' 
                        : networkInfo.status === 'Disconnected' 
                        ? 'text-red-500' 
                        : 'text-yellow-500'
                    }`}>
                      {networkInfo.status}
                    </div>
                    <div className="text-xs text-muted-foreground">All Contracts Status</div>
                  </div>
                </div>
              </div>

              {/* Contract Manager */}
              <ContractManager onContractSelect={handleContractSelect} />

              {/* Quick Actions */}
              <div className="bg-card border border-border rounded-md p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('registry')}
                    className="p-4 border border-border rounded-md hover:border-primary hover:bg-accent transition-colors text-left"
                  >
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary/50 text-primary mb-2">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-foreground">Registry</h3>
                    <p className="text-sm text-muted-foreground">Manage game modules</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('game')}
                    className="p-4 border border-border rounded-md hover:border-primary hover:bg-accent transition-colors text-left"
                  >
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary/50 text-primary mb-2">
                      <Gamepad2 className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-foreground">Shooter Game</h3>
                    <p className="text-sm text-muted-foreground">Game sessions and results</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('nft')}
                    className="p-4 border border-border rounded-md hover:border-primary hover:bg-accent transition-colors text-left"
                  >
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary/50 text-primary mb-2">
                      <Image className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-foreground">NFT</h3>
                    <p className="text-sm text-muted-foreground">Create and manage NFTs</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('ft')}
                    className="p-4 border border-border rounded-md hover:border-primary hover:bg-accent transition-colors text-left"
                  >
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary/50 text-primary mb-2">
                      <Coins className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-foreground">FT Tokens</h3>
                    <p className="text-sm text-muted-foreground">Tokens and transfers</p>
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
          <div className="fixed bottom-4 right-4 bg-card rounded-lg shadow-lg border border-border p-4 max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-foreground">{selectedContract.name}</h4>
              <button
                onClick={() => setSelectedContract(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{selectedContract.description}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Address:</span>
              <span className="font-mono text-foreground">
                {selectedContract.address.split('.')[1]}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Cost:</span>
              <span className="text-foreground">{selectedContract.cost}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractsPage;
