import express from 'express';
import crypto from 'crypto';
import { stacksIntegration } from '../lib/stacks-integration.js';

const router = express.Router();

// Save game result to blockchain
router.post('/save-game-result', async (req, res) => {
  try {
    const { playerAddress, finalScore, kills, deaths, botKills, gameType, roomId, timestamp } = req.body;

    if (!playerAddress || finalScore === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate result hash for replay protection
    const resultData = {
      playerAddress,
      finalScore,
      kills,
      deaths,
      botKills,
      gameType,
      roomId,
      timestamp
    };

    const resultHash = crypto.createHash('sha256')
      .update(JSON.stringify(resultData))
      .digest();

    // Prepare data for blockchain contract
    const contractData = {
      sessionId: Date.now(), // Simple session ID based on timestamp
      resultHash: resultHash.toString('hex'),
      canonicalScore: finalScore,
      expGained: Math.floor(finalScore / 10), // 1 exp per 10 points
      playerAddress: playerAddress
    };

    // For now, just log the data (in production, this would call the actual contract)
    console.log('Game result to be saved to blockchain:', contractData);

    // Simulate blockchain transaction
    const mockTransaction = {
      txId: `0x${crypto.randomBytes(32).toString('hex')}`,
      blockHeight: Math.floor(Math.random() * 1000000) + 1000000,
      status: 'pending'
    };

    // In production, you would call the actual Stacks contract here
    // const txResult = await stacksIntegration.callContract('shooter-game', 'report-result', contractData);

    res.json({
      success: true,
      transaction: mockTransaction,
      contractData: contractData,
      message: 'Game result queued for blockchain submission'
    });

  } catch (error) {
    console.error('Error saving game result to blockchain:', error);
    res.status(500).json({ error: 'Failed to save game result' });
  }
});

// Get player's game history from blockchain
router.get('/player-history/:address', async (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({ error: 'Player address required' });
    }

    // In production, this would query the actual blockchain
    // For now, return mock data
    const mockHistory = [
      {
        sessionId: 1,
        gameType: 'shooter',
        finalScore: 1500,
        kills: 5,
        deaths: 2,
        botKills: 3,
        timestamp: Date.now() - 86400000, // 1 day ago
        blockHeight: 1000001
      },
      {
        sessionId: 2,
        gameType: 'shooter',
        finalScore: 2300,
        kills: 8,
        deaths: 1,
        botKills: 7,
        timestamp: Date.now() - 172800000, // 2 days ago
        blockHeight: 999999
      }
    ];

    res.json({
      success: true,
      playerAddress: address,
      gameHistory: mockHistory,
      totalGames: mockHistory.length,
      bestScore: Math.max(...mockHistory.map(g => g.finalScore))
    });

  } catch (error) {
    console.error('Error fetching player history:', error);
    res.status(500).json({ error: 'Failed to fetch player history' });
  }
});

// Get game statistics from blockchain
router.get('/game-stats', async (req, res) => {
  try {
    // In production, this would query the actual blockchain contract
    const mockStats = {
      totalGamesPlayed: 1250,
      totalPlayers: 89,
      totalRewardsDistributed: 50000,
      averageScore: 1200,
      topScore: 5000,
      lastUpdated: Date.now()
    };

    res.json({
      success: true,
      stats: mockStats
    });

  } catch (error) {
    console.error('Error fetching game stats:', error);
    res.status(500).json({ error: 'Failed to fetch game statistics' });
  }
});

// Verify game result signature (for off-chain verification)
router.post('/verify-result', async (req, res) => {
  try {
    const { resultHash, signature, serverPubkey } = req.body;

    if (!resultHash || !signature || !serverPubkey) {
      return res.status(400).json({ error: 'Missing verification data' });
    }

    // In production, this would use secp256k1 verification
    // For now, simulate verification
    const isValid = true; // Mock verification

    res.json({
      success: true,
      valid: isValid,
      message: isValid ? 'Result signature verified' : 'Invalid signature'
    });

  } catch (error) {
    console.error('Error verifying result:', error);
    res.status(500).json({ error: 'Failed to verify result' });
  }
});

export default router;
