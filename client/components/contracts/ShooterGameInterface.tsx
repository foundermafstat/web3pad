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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
            Active
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-1"></div>
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
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
    <div className="bg-card rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Shooter Game</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Game session and results management
            </p>
          </div>
          {playerAddress && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Player:</p>
              <p className="text-sm font-mono text-foreground">
                {playerAddress.slice(0, 8)}...{playerAddress.slice(-6)}
              </p>
            </div>
          )}
        </div>
      </div>

      {!playerAddress && (
        <div className="p-6">
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-foreground">Player address required</h3>
            <p className="mt-1 text-sm text-muted-foreground">Connect your Stacks address to manage game sessions.</p>
          </div>
        </div>
      )}

      {playerAddress && (
        <>
          {/* Stats */}
          <div className="px-6 py-4 border-b border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-md p-4">
                <div className="text-2xl font-bold text-foreground">{sessions.length}</div>
                <div className="text-xs text-muted-foreground">Total Sessions</div>
              </div>
              <div className="bg-card border border-border rounded-md p-4">
                <div className="text-2xl font-bold text-green-500">
                  {sessions.filter(s => s.status === 'active').length}
                </div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div className="bg-card border border-border rounded-md p-4">
                <div className="text-2xl font-bold text-primary">
                  {sessions.filter(s => s.status === 'completed').length}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="bg-card border border-border rounded-md p-4">
                <div className="text-2xl font-bold text-purple-500">
                  {sessions.reduce((sum, s) => sum + (s.score || 0), 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Score</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* Start New Session */}
            <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h3 className="text-lg font-semibold text-primary mb-3">Start New Session</h3>
              <form onSubmit={handleStartSession} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      NFT Token ID (optional)
                    </label>
                    <input
                      type="number"
                      value={sessionForm.nftTokenId}
                      onChange={(e) => setSessionForm({...sessionForm, nftTokenId: e.target.value})}
                      placeholder="123"
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Game Type
                    </label>
                    <select
                      value={sessionForm.gameType}
                      onChange={(e) => setSessionForm({...sessionForm, gameType: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    >
                      <option value="shooter">Shooter</option>
                      <option value="tower-defense">Tower Defense</option>
                      <option value="racing">Racing</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Starting...' : 'Start Session'}
                </button>
              </form>
            </div>

            {/* Sessions List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Session History</h3>
              
              {loading && sessions.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Loading sessions...</span>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-foreground">No game sessions</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Start a new session to play.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedSession?.id === session.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-foreground">Session #{session.id}</h4>
                          {getStatusBadge(session.status)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatTime(session.startTime)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">NFT ID:</span>
                          <p className="font-medium text-foreground">
                            {session.nftTokenId || 'Not used'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Score:</span>
                          <p className="font-medium text-foreground">
                            {session.score || '—'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Experience:</span>
                          <p className="font-medium text-foreground">
                            {session.experience || '—'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">TX ID:</span>
                          <p className="font-mono text-xs text-foreground">
                            {session.txId ? `${session.txId.slice(0, 8)}...` : '—'}
                          </p>
                        </div>
                      </div>

                      {selectedSession?.id === session.id && session.status === 'active' && (
                        <div className="mt-3 pt-3 border-t border-border">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Submit Result</h2>
                <button
                  onClick={() => setShowResultForm(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Session #{selectedSession.id} • {formatTime(selectedSession.startTime)}
                </p>
              </div>

              <form onSubmit={handleSubmitResult} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Score
                  </label>
                  <input
                    type="number"
                    value={resultForm.score}
                    onChange={(e) => setResultForm({...resultForm, score: parseInt(e.target.value)})}
                    min="0"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Additional Data (JSON, optional)
                  </label>
                  <textarea
                    value={resultForm.metadata}
                    onChange={(e) => setResultForm({...resultForm, metadata: e.target.value})}
                    rows={3}
                    placeholder='{"level": 5, "difficulty": "hard"}'
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowResultForm(false)}
                    className="flex-1 px-4 py-2 text-secondary-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
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
