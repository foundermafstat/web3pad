'use client';

import React, { useState, useEffect } from 'react';
import { blockchainService } from '@/lib/blockchain';

interface FTToken {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  contractAddress: string;
  owner: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
}

interface FTBalance {
  tokenId: string;
  token: FTToken;
  balance: number;
  owner: string;
}

interface FTInterfaceProps {
  playerAddress?: string;
  onTokenSelect?: (token: FTToken) => void;
}

const FTInterface: React.FC<FTInterfaceProps> = ({
  playerAddress,
  onTokenSelect
}) => {
  const [tokens, setTokens] = useState<FTToken[]>([]);
  const [balances, setBalances] = useState<FTBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedToken, setSelectedToken] = useState<FTToken | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [viewMode, setViewMode] = useState<'tokens' | 'balances'>('balances');

  // Form state for creating new FT token
  const [createForm, setCreateForm] = useState({
    name: '',
    symbol: '',
    decimals: 6,
    totalSupply: 1000000,
    description: '',
    imageUrl: ''
  });

  // Form state for transferring tokens
  const [transferForm, setTransferForm] = useState({
    recipient: '',
    amount: 0,
    tokenId: ''
  });

  useEffect(() => {
    loadTokens();
    if (playerAddress) {
      loadBalances();
    }
  }, [playerAddress]);

  const loadTokens = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration - in real app this would come from blockchain
      const mockTokens: FTToken[] = [
        {
          id: '1',
          name: 'Game Gold',
          symbol: 'GGOLD',
          decimals: 6,
          totalSupply: 1000000000,
          contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.ft-trait',
          owner: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          description: 'Main game currency for purchasing items and upgrades',
          imageUrl: '/images/gold-token.png',
          createdAt: '2024-12-01'
        },
        {
          id: '2',
          name: 'Experience Points',
          symbol: 'XP',
          decimals: 2,
          totalSupply: 50000000,
          contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.ft-trait',
          owner: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          description: 'Experience tokens for character leveling',
          imageUrl: '/images/xp-token.png',
          createdAt: '2024-12-01'
        },
        {
          id: '3',
          name: 'Premium Credits',
          symbol: 'PCRED',
          decimals: 0,
          totalSupply: 1000000,
          contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.ft-trait',
          owner: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          description: 'Premium currency for exclusive items',
          imageUrl: '/images/premium-token.png',
          createdAt: '2024-12-01'
        }
      ];
      setTokens(mockTokens);
      setError('');
    } catch (error) {
      console.error('Error loading tokens:', error);
      setError('Error loading tokens');
    } finally {
      setLoading(false);
    }
  };

  const loadBalances = async () => {
    if (!playerAddress) return;

    try {
      // Mock data for demonstration - in real app this would come from blockchain
      const mockBalances: FTBalance[] = [
        {
          tokenId: '1',
          token: tokens.find(t => t.id === '1')!,
          balance: 50000,
          owner: playerAddress
        },
        {
          tokenId: '2',
          token: tokens.find(t => t.id === '2')!,
          balance: 1250,
          owner: playerAddress
        },
        {
          tokenId: '3',
          token: tokens.find(t => t.id === '3')!,
          balance: 100,
          owner: playerAddress
        }
      ];
      setBalances(mockBalances);
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // In real implementation, this would call the blockchain
      const newToken: FTToken = {
        id: Date.now().toString(),
        name: createForm.name,
        symbol: createForm.symbol.toUpperCase(),
        decimals: createForm.decimals,
        totalSupply: createForm.totalSupply,
        contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.ft-trait',
        owner: playerAddress || '',
        description: createForm.description,
        imageUrl: createForm.imageUrl || undefined,
        createdAt: new Date().toISOString().split('T')[0]
      };

      setTokens(prev => [newToken, ...prev]);
      setShowCreateForm(false);
      setCreateForm({
        name: '',
        symbol: '',
        decimals: 6,
        totalSupply: 1000000,
        description: '',
        imageUrl: ''
      });
    } catch (error) {
      setError('Error creating token');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // In real implementation, this would call the blockchain
      const token = tokens.find(t => t.id === transferForm.tokenId);
      if (!token) {
        setError('Token not found');
        return;
      }

      // Update balance locally (in real app this would be handled by blockchain)
      setBalances(prev => prev.map(balance =>
        balance.tokenId === transferForm.tokenId
          ? { ...balance, balance: balance.balance - transferForm.amount }
          : balance
      ));

      setShowTransferForm(false);
      setTransferForm({ recipient: '', amount: 0, tokenId: '' });
    } catch (error) {
      setError('Error transferring tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSelect = (token: FTToken) => {
    setSelectedToken(token);
    onTokenSelect?.(token);
  };

  const formatBalance = (balance: number, decimals: number) => {
    return (balance / Math.pow(10, decimals)).toFixed(decimals > 0 ? 2 : 0);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const totalValue = balances.reduce((sum, balance) => {
    // Mock calculation - in real app this would use actual token values
    const tokenValue = balance.token.symbol === 'GGOLD' ? 0.01 : 
                      balance.token.symbol === 'XP' ? 0.005 : 0.1;
    return sum + (balance.balance / Math.pow(10, balance.token.decimals)) * tokenValue;
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">FT Tokens</h2>
            <p className="text-sm text-gray-600 mt-1">
              Game token and balance management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('balances')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'balances'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Tokens
              </button>
              <button
                onClick={() => setViewMode('tokens')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'tokens'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Tokens
              </button>
            </div>
            {playerAddress && (
              <>
                <button
                  onClick={() => setShowTransferForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Transfer
                </button>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Create Token
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {viewMode === 'balances' ? balances.length : tokens.length}
            </div>
            <div className="text-sm text-gray-600">
              {viewMode === 'balances' ? 'Token Types' : 'Total Tokens'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              ${totalValue.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {balances.reduce((sum, b) => sum + b.balance / Math.pow(10, b.token.decimals), 0).toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">Total Balance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {tokens.reduce((sum, t) => sum + t.totalSupply / Math.pow(10, t.decimals), 0).toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">Total Supply</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!playerAddress && viewMode === 'balances' && (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Player address required</h3>
            <p className="mt-1 text-sm text-gray-500">Connect your Stacks address to view token balances.</p>
          </div>
        )}

        {loading && (viewMode === 'tokens' ? tokens.length === 0 : balances.length === 0) ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            <span className="ml-2 text-gray-600">Loading tokens...</span>
          </div>
        ) : (viewMode === 'tokens' ? tokens.length === 0 : balances.length === 0) ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tokens</h3>
            <p className="mt-1 text-sm text-gray-500">
              {viewMode === 'balances' ? 'You don\'t have any tokens yet.' : 'No tokens have been created yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(viewMode === 'balances' ? balances : tokens.map(token => ({
              tokenId: token.id,
              token,
              balance: 0,
              owner: token.owner
            }))).map((item) => (
              <div
                key={item.tokenId}
                onClick={() => handleTokenSelect(item.token)}
                className={`border-2 rounded-lg cursor-pointer transition-all duration-200 overflow-hidden ${
                  selectedToken?.id === item.tokenId
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}
              >
                {/* Token Image */}
                <div className="aspect-square bg-gray-100 relative">
                  {item.token.imageUrl ? (
                    <img
                      src={item.token.imageUrl}
                      alt={item.token.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Symbol Badge */}
                  <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium border border-yellow-200">
                    {item.token.symbol}
                  </div>

                  {/* Balance Badge */}
                  {viewMode === 'balances' && (
                    <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium border border-green-200">
                      {formatBalance(item.balance, item.token.decimals)}
                    </div>
                  )}
                </div>

                {/* Token Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.token.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.token.description}</p>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Symbol:</span>
                      <span className="font-medium text-gray-700">{item.token.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Decimals:</span>
                      <span className="text-gray-700">{item.token.decimals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Supply:</span>
                      <span className="text-gray-700">
                        {formatBalance(item.token.totalSupply, item.token.decimals)}
                      </span>
                    </div>
                    {viewMode === 'balances' && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">My Balance:</span>
                        <span className="font-medium text-green-600">
                          {formatBalance(item.balance, item.token.decimals)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Owner:</span>
                      <span className="font-mono text-gray-700">
                        {formatAddress(item.token.owner)}
                      </span>
                    </div>
                  </div>

                  {selectedToken?.id === item.tokenId && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex gap-2">
                        {viewMode === 'balances' && (
                          <button className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
                            Transfer
                          </button>
                        )}
                        <button className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors">
                          Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Token Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create FT Token</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateToken} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Token Name
                    </label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                      placeholder="Game Gold"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Token Symbol
                    </label>
                    <input
                      type="text"
                      value={createForm.symbol}
                      onChange={(e) => setCreateForm({...createForm, symbol: e.target.value.toUpperCase()})}
                      placeholder="GGOLD"
                      maxLength={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                    rows={3}
                    placeholder="Description of the token and its usage..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Decimals
                    </label>
                    <input
                      type="number"
                      value={createForm.decimals}
                      onChange={(e) => setCreateForm({...createForm, decimals: parseInt(e.target.value)})}
                      min="0"
                      max="18"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Supply
                    </label>
                    <input
                      type="number"
                      value={createForm.totalSupply}
                      onChange={(e) => setCreateForm({...createForm, totalSupply: parseInt(e.target.value)})}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={createForm.imageUrl}
                    onChange={(e) => setCreateForm({...createForm, imageUrl: e.target.value})}
                    placeholder="https://example.com/token-image.png"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Token'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Transfer Tokens</h2>
                <button
                  onClick={() => setShowTransferForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Token
                  </label>
                  <select
                    value={transferForm.tokenId}
                    onChange={(e) => setTransferForm({...transferForm, tokenId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select token</option>
                    {balances.map((balance) => (
                      <option key={balance.tokenId} value={balance.tokenId}>
                        {balance.token.name} ({balance.token.symbol}) - {formatBalance(balance.balance, balance.token.decimals)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={transferForm.recipient}
                    onChange={(e) => setTransferForm({...transferForm, recipient: e.target.value})}
                    placeholder="SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({...transferForm, amount: parseInt(e.target.value)})}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTransferForm(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Transferring...' : 'Transfer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FTInterface;
