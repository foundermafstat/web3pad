'use client';

import React, { useState, useEffect } from 'react';
import { blockchainService } from '@/lib/blockchain';

interface NFT {
  id: string;
  tokenId: number;
  name: string;
  description: string;
  imageUrl?: string;
  owner: string;
  contractAddress: string;
  metadata?: any;
  createdAt: string;
  traits?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

interface NFTInterfaceProps {
  playerAddress?: string;
  onNFTSelect?: (nft: NFT) => void;
}

const NFTInterface: React.FC<NFTInterfaceProps> = ({
  playerAddress,
  onNFTSelect
}) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState<'owned' | 'all'>('owned');

  // Form state for creating new NFT
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    traits: ''
  });

  useEffect(() => {
    loadNFTs();
  }, [playerAddress, viewMode]);

  const loadNFTs = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration - in real app this would come from blockchain
      const mockNFTs: NFT[] = [
        {
          id: '1',
          tokenId: 123,
          name: 'Legendary Shooter Gun',
          description: 'Rare weapon for Shooter game with increased damage',
          imageUrl: '/images/nft-gun.jpg',
          owner: playerAddress || 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.nft-trait',
          metadata: {
            power: 150,
            rarity: 'legendary',
            game_type: 'shooter'
          },
          createdAt: '2024-12-01',
          traits: [
            { trait_type: 'Power', value: 150 },
            { trait_type: 'Rarity', value: 'Legendary' },
            { trait_type: 'Game Type', value: 'Shooter' }
          ]
        },
        {
          id: '2',
          tokenId: 124,
          name: 'Racing Car NFT',
          description: 'Sports car for racing',
          imageUrl: '/images/nft-car.jpg',
          owner: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.nft-trait',
          metadata: {
            speed: 200,
            rarity: 'epic',
            game_type: 'racing'
          },
          createdAt: '2024-12-01',
          traits: [
            { trait_type: 'Speed', value: 200 },
            { trait_type: 'Rarity', value: 'Epic' },
            { trait_type: 'Game Type', value: 'Racing' }
          ]
        },
        {
          id: '3',
          tokenId: 125,
          name: 'Tower Defense Base',
          description: 'Fortified base for defense against enemies',
          imageUrl: '/images/nft-base.jpg',
          owner: playerAddress || 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.nft-trait',
          metadata: {
            defense: 300,
            rarity: 'rare',
            game_type: 'tower-defense'
          },
          createdAt: '2024-12-01',
          traits: [
            { trait_type: 'Defense', value: 300 },
            { trait_type: 'Rarity', value: 'Rare' },
            { trait_type: 'Game Type', value: 'Tower Defense' }
          ]
        }
      ];

      // Filter by view mode
      const filteredNFTs = viewMode === 'owned' && playerAddress
        ? mockNFTs.filter(nft => nft.owner === playerAddress)
        : mockNFTs;

      setNfts(filteredNFTs);
      setError('');
    } catch (error) {
      console.error('Error loading NFTs:', error);
      setError('Error loading NFTs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // In real implementation, this would call the blockchain
      const newNFT: NFT = {
        id: Date.now().toString(),
        tokenId: Math.floor(Math.random() * 10000) + 1000,
        name: createForm.name,
        description: createForm.description,
        imageUrl: createForm.imageUrl || undefined,
        owner: playerAddress || '',
        contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.nft-trait',
        metadata: {
          created_by: 'player',
          timestamp: Date.now()
        },
        createdAt: new Date().toISOString().split('T')[0],
        traits: createForm.traits ? JSON.parse(createForm.traits) : []
      };

      setNfts(prev => [newNFT, ...prev]);
      setShowCreateForm(false);
      setCreateForm({ name: '', description: '', imageUrl: '', traits: '' });
    } catch (error) {
      setError('Error creating NFT');
    } finally {
      setLoading(false);
    }
  };

  const handleNFTSelect = (nft: NFT) => {
    setSelectedNFT(nft);
    onNFTSelect?.(nft);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'epic':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'rare':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'common':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  return (
    <div className="bg-background rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">NFT Collection</h2>
            <p className="text-sm text-gray-600 mt-1">
              Game NFT token management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('owned')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'owned'
                    ? 'bg-background text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My NFTs
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'all'
                    ? 'bg-background text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All NFTs
              </button>
            </div>
            {playerAddress && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Create NFT
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{nfts.length}</div>
            <div className="text-sm text-gray-600">
              {viewMode === 'owned' ? 'My NFTs' : 'Total NFTs'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {nfts.filter(nft => nft.metadata?.rarity === 'legendary').length}
            </div>
            <div className="text-sm text-gray-600">Legendary</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {nfts.filter(nft => nft.metadata?.rarity === 'epic').length}
            </div>
            <div className="text-sm text-gray-600">Epic</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {new Set(nfts.map(nft => nft.metadata?.game_type)).size}
            </div>
            <div className="text-sm text-gray-600">Game Types</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!playerAddress && viewMode === 'owned' && (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Player address required</h3>
            <p className="mt-1 text-sm text-gray-500">Connect your Stacks address to view your NFTs.</p>
          </div>
        )}

        {loading && nfts.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-2 text-gray-600">Loading NFTs...</span>
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No NFTs</h3>
            <p className="mt-1 text-sm text-gray-500">
              {viewMode === 'owned' ? 'You don\'t have any NFTs yet.' : 'No NFTs have been created yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft) => (
              <div
                key={nft.id}
                onClick={() => handleNFTSelect(nft)}
                className={`border-2 rounded-lg cursor-pointer transition-all duration-200 overflow-hidden ${
                  selectedNFT?.id === nft.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}
              >
                {/* NFT Image */}
                <div className="aspect-square bg-gray-100 relative">
                  {nft.imageUrl ? (
                    <img
                      src={nft.imageUrl}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Rarity Badge */}
                  {nft.metadata?.rarity && (
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium border ${getRarityColor(nft.metadata.rarity)}`}>
                      {nft.metadata.rarity}
                    </div>
                  )}

                  {/* Token ID */}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    #{nft.tokenId}
                  </div>
                </div>

                {/* NFT Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{nft.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{nft.description}</p>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Owner:</span>
                      <span className="font-mono text-gray-700">
                        {formatAddress(nft.owner)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Game:</span>
                      <span className="font-medium text-gray-700 capitalize">
                        {nft.metadata?.game_type?.replace('-', ' ') || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created:</span>
                      <span className="text-gray-700">{nft.createdAt}</span>
                    </div>
                  </div>

                  {/* Traits */}
                  {nft.traits && nft.traits.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">Traits:</p>
                      <div className="space-y-1">
                        {nft.traits.slice(0, 3).map((trait, index) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span className="text-gray-500">{trait.trait_type}:</span>
                            <span className="font-medium text-gray-700">{trait.value}</span>
                          </div>
                        ))}
                        {nft.traits.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{nft.traits.length - 3} more...
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedNFT?.id === nft.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex gap-2">
                        <button className="flex-1 px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors">
                          Use
                        </button>
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

      {/* Create NFT Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create NFT</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateNFT} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NFT Name
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    placeholder="Legendary Sword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                    rows={3}
                    placeholder="Description of the NFT and its features..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={createForm.imageUrl}
                    onChange={(e) => setCreateForm({...createForm, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Traits (JSON, optional)
                  </label>
                  <textarea
                    value={createForm.traits}
                    onChange={(e) => setCreateForm({...createForm, traits: e.target.value})}
                    rows={4}
                    placeholder='[{"trait_type": "Power", "value": 100}, {"trait_type": "Rarity", "value": "Rare"}]'
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter an array of objects with trait_type and value fields
                  </p>
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
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create NFT'}
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

export default NFTInterface;
