'use client';

import React, { useState, useEffect } from 'react';
import { blockchainService } from '@/lib/blockchain';

interface GameSession {
  id: string;
  playerAddress: string;
  nftTokenId?: number;
  startTime: string;
  status: 'active' | 'completed' | 'cancelled';
  score?: number;
  experience?: number;
  txId?: string;
}

interface GameResult {
  sessionId: string;
  playerAddress: string;
  score: number;
  gameType: string;
  metadata?: any;
}

interface ShooterGameInterfaceProps {
  playerAddress?: string;
  onSessionStart?: (session: GameSession) => void;
  onResultSubmit?: (result: GameResult) => void;
}

const ShooterGameInterface: React.FC<ShooterGameInterfaceProps> = ({
  playerAddress,
  onSessionStart,
  onResultSubmit
}) => {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);
  const [showResultForm, setShowResultForm] = useState(false);

  // Form state for submitting results
  const [resultForm, setResultForm] = useState({
    score: 0,
    gameType: 'shooter',
    metadata: ''
  });

  // Form state for starting new session
  const [sessionForm, setSessionForm] = useState({
    nftTokenId: '',
    gameType: 'shooter'
  });

  useEffect(() => {
    if (playerAddress) {
      loadSessions();
    }
  }, [playerAddress]);

  const loadSessions = async () => {
    if (!playerAddress) return;
    
    setLoading(true);
    try {
      // Mock data for demonstration - in real app this would come from blockchain
      const mockSessions: GameSession[] = [
        {
          id: '1',
          playerAddress: playerAddress,
          nftTokenId: 123,
          startTime: '2024-12-01T10:00:00Z',
          status: 'completed',
          score: 1250,
          experience: 125,
          txId: '0x1234567890abcdef'
        },
        {
          id: '2',
          playerAddress: playerAddress,
          startTime: '2024-12-01T11:30:00Z',
          status: 'active'
        }
      ];
      setSessions(mockSessions);
      setError('');
    } catch (error) {
      console.error('Error loading sessions:', error);
      setError('Error loading sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerAddress) {
      setError('Player address not specified');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In real implementation, this would call the blockchain
      const newSession: GameSession = {
        id: Date.now().toString(),
        playerAddress,
        nftTokenId: sessionForm.nftTokenId ? parseInt(sessionForm.nftTokenId) : undefined,
        startTime: new Date().toISOString(),
        status: 'active'
      };

      setSessions(prev => [newSession, ...prev]);
      setSelectedSession(newSession);
      onSessionStart?.(newSession);
      
      setSessionForm({ nftTokenId: '', gameType: 'shooter' });
    } catch (error) {
      setError('Error starting session');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession || !playerAddress) {
      setError('Select an active session');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result: GameResult = {
        sessionId: selectedSession.id,
        playerAddress,
        score: resultForm.score,
        gameType: resultForm.gameType,
        metadata: resultForm.metadata ? JSON.parse(resultForm.metadata) : undefined
      };

      // Submit result via blockchain service
      const response = await blockchainService.submitResult(
        playerAddress,
        result.score,
        result.gameType,
        result.metadata
      );

      if (response.success) {
        // Update session with result
        const updatedSessions = sessions.map(session =>
          session.id === selectedSession.id
            ? {
                ...session,
                status: 'completed' as const,
                score: result.score,
                experience: Math.floor(result.score / 10) + 1,
                txId: response.data?.txId
              }
            : session
        );
        setSessions(updatedSessions);
        setSelectedSession(null);
        setShowResultForm(false);
        onResultSubmit?.(result);
        
        setResultForm({ score: 0, gameType: 'shooter', metadata: '' });
      } else {
        setError(response.error || 'Error submitting result');
      }
    } catch (error) {
      setError('Error submitting result');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
            Active
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></div>
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></div>
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('ru-RU');
  };

  return (
    <div className="bg-background rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Shooter Game</h2>
            <p className="text-sm text-gray-600 mt-1">
              Game session and results management
            </p>
          </div>
          {playerAddress && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Player:</p>
              <p className="text-sm font-mono text-gray-900">
                {playerAddress.slice(0, 8)}...{playerAddress.slice(-6)}
              </p>
            </div>
          )}
        </div>
      </div>

      {!playerAddress && (
        <div className="p-6">
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Player address required</h3>
            <p className="mt-1 text-sm text-gray-500">Connect your Stacks address to manage game sessions.</p>
          </div>
        </div>
      )}

      {playerAddress && (
        <>
          {/* Stats */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{sessions.length}</div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {sessions.filter(s => s.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {sessions.filter(s => s.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {sessions.reduce((sum, s) => sum + (s.score || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Score</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Start New Session */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Start New Session</h3>
              <form onSubmit={handleStartSession} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-2">
                      NFT Token ID (optional)
                    </label>
                    <input
                      type="number"
                      value={sessionForm.nftTokenId}
                      onChange={(e) => setSessionForm({...sessionForm, nftTokenId: e.target.value})}
                      placeholder="123"
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-2">
                      Game Type
                    </label>
                    <select
                      value={sessionForm.gameType}
                      onChange={(e) => setSessionForm({...sessionForm, gameType: e.target.value})}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="shooter">Shooter</option>
                      <option value="tower-defense">Tower Defense</option>
                      <option value="racing">Racing</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Starting...' : 'Start Session'}
                </button>
              </form>
            </div>

            {/* Sessions List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Session History</h3>
              
              {loading && sessions.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading sessions...</span>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No game sessions</h3>
                  <p className="mt-1 text-sm text-gray-500">Start a new session to play.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedSession?.id === session.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-gray-900">Session #{session.id}</h4>
                          {getStatusBadge(session.status)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatTime(session.startTime)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">NFT ID:</span>
                          <p className="font-medium text-gray-900">
                            {session.nftTokenId || 'Not used'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Score:</span>
                          <p className="font-medium text-gray-900">
                            {session.score || '—'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Experience:</span>
                          <p className="font-medium text-gray-900">
                            {session.experience || '—'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">TX ID:</span>
                          <p className="font-mono text-xs text-gray-900">
                            {session.txId ? `${session.txId.slice(0, 8)}...` : '—'}
                          </p>
                        </div>
                      </div>

                      {selectedSession?.id === session.id && session.status === 'active' && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => setShowResultForm(true)}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Submit Result
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Submit Result Modal */}
      {showResultForm && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Submit Result</h2>
                <button
                  onClick={() => setShowResultForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Session #{selectedSession.id} • {formatTime(selectedSession.startTime)}
                </p>
              </div>

              <form onSubmit={handleSubmitResult} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score
                  </label>
                  <input
                    type="number"
                    value={resultForm.score}
                    onChange={(e) => setResultForm({...resultForm, score: parseInt(e.target.value)})}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Data (JSON, optional)
                  </label>
                  <textarea
                    value={resultForm.metadata}
                    onChange={(e) => setResultForm({...resultForm, metadata: e.target.value})}
                    rows={3}
                    placeholder='{"level": 5, "difficulty": "hard"}'
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowResultForm(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit'}
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

export default ShooterGameInterface;
