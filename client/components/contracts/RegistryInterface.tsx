'use client';

import React, { useState, useEffect } from 'react';
import { blockchainService } from '@/lib/blockchain';

interface GameModule {
  id: string;
  name: string;
  description: string;
  version: string;
  contractAddress: string;
  category: string;
  minStake: number;
  maxPlayers: number;
  isActive: boolean;
  createdAt: string;
}

interface RegistryInterfaceProps {
  onModuleSelect?: (module: GameModule) => void;
}

const RegistryInterface: React.FC<RegistryInterfaceProps> = ({ onModuleSelect }) => {
  const [modules, setModules] = useState<GameModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedModule, setSelectedModule] = useState<GameModule | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Form state for registering new module
  const [registerForm, setRegisterForm] = useState({
    name: '',
    description: '',
    version: '',
    contractAddress: '',
    category: 'shooter',
    minStake: 0,
    maxPlayers: 10
  });

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration - in real app this would come from blockchain
      const mockModules: GameModule[] = [
        {
          id: '1',
          name: 'Shooter Game',
          description: 'Classic shooter game with reward system',
          version: '1.0.0',
          contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.shooter-game',
          category: 'shooter',
          minStake: 0,
          maxPlayers: 10,
          isActive: true,
          createdAt: '2024-12-01'
        },
        {
          id: '2',
          name: 'Tower Defense',
          description: 'Strategic tower defense game',
          version: '1.0.0',
          contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.tower-defense',
          category: 'strategy',
          minStake: 100,
          maxPlayers: 4,
          isActive: true,
          createdAt: '2024-12-01'
        }
      ];
      setModules(mockModules);
      setError('');
    } catch (error) {
      console.error('Error loading modules:', error);
      setError('Error loading modules');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await blockchainService.registerModule({
        name: registerForm.name,
        description: registerForm.description,
        version: registerForm.version,
        contractAddress: registerForm.contractAddress,
        category: registerForm.category,
        minStake: registerForm.minStake,
        maxPlayers: registerForm.maxPlayers
      });

      if (result.success) {
        setShowRegisterForm(false);
        setRegisterForm({
          name: '',
          description: '',
          version: '',
          contractAddress: '',
          category: 'shooter',
          minStake: 0,
          maxPlayers: 10
        });
        loadModules(); // Reload modules
      } else {
        setError(result.error || 'Error registering module');
      }
    } catch (error) {
      setError('An error occurred while registering the module');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleSelect = (module: GameModule) => {
    setSelectedModule(module);
    onModuleSelect?.(module);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'shooter':
        return 'bg-red-100 text-red-800';
      case 'strategy':
        return 'bg-blue-100 text-blue-800';
      case 'puzzle':
        return 'bg-green-100 text-green-800';
      case 'racing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && modules.length === 0) {
    return (
      <div className="bg-background rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading modules...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Game Modules Registry</h2>
            <p className="text-sm text-gray-600 mt-1">
              Management and registration of game contracts
            </p>
          </div>
          <button
            onClick={() => setShowRegisterForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Register Module
          </button>
        </div>
      </div>

      {/* Registry Stats */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{modules.length}</div>
            <div className="text-sm text-gray-600">Total Modules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {modules.filter(m => m.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {new Set(modules.map(m => m.category)).size}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {modules.reduce((sum, m) => sum + m.maxPlayers, 0)}
            </div>
            <div className="text-sm text-gray-600">Max Players</div>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
            <div
              key={module.id}
              onClick={() => handleModuleSelect(module)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedModule?.id === module.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{module.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(module.category)}`}>
                    {module.category}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${module.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {module.description}
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Version:</span>
                  <span className="font-medium text-gray-700">{module.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Min. Stake:</span>
                  <span className="font-medium text-gray-700">{module.minStake} STX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Max Players:</span>
                  <span className="font-medium text-gray-700">{module.maxPlayers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contract:</span>
                  <span className="font-mono text-gray-700 text-xs">
                    {module.contractAddress.split('.')[1]}
                  </span>
                </div>
              </div>

              {selectedModule?.id === module.id && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
                      Use
                    </button>
                    <button className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors">
                      Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {modules.length === 0 && !loading && (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No registered modules</h3>
            <p className="mt-1 text-sm text-gray-500">Start by registering the first game module.</p>
          </div>
        )}
      </div>

      {/* Register Module Modal */}
      {showRegisterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Register Game Module</h2>
                <button
                  onClick={() => setShowRegisterForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleRegisterModule} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Module Name
                    </label>
                    <input
                      type="text"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Version
                    </label>
                    <input
                      type="text"
                      value={registerForm.version}
                      onChange={(e) => setRegisterForm({...registerForm, version: e.target.value})}
                      placeholder="1.0.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={registerForm.description}
                    onChange={(e) => setRegisterForm({...registerForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Address
                  </label>
                  <input
                    type="text"
                    value={registerForm.contractAddress}
                    onChange={(e) => setRegisterForm({...registerForm, contractAddress: e.target.value})}
                    placeholder="ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.game-contract"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={registerForm.category}
                      onChange={(e) => setRegisterForm({...registerForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="shooter">Shooter</option>
                      <option value="strategy">Strategy</option>
                      <option value="puzzle">Puzzle</option>
                      <option value="racing">Racing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min. Stake (STX)
                    </label>
                    <input
                      type="number"
                      value={registerForm.minStake}
                      onChange={(e) => setRegisterForm({...registerForm, minStake: parseInt(e.target.value)})}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Players
                    </label>
                    <input
                      type="number"
                      value={registerForm.maxPlayers}
                      onChange={(e) => setRegisterForm({...registerForm, maxPlayers: parseInt(e.target.value)})}
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRegisterForm(false)}
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
                    {loading ? 'Registering...' : 'Register'}
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

export default RegistryInterface;
