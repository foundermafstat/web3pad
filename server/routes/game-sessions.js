import express from 'express';
import prisma from '../lib/prisma.js';
import GameSessionManager from '../lib/game-session-manager.js';

const router = express.Router();

// Start a game session
router.post('/sessions/start', async (req, res) => {
	try {
		const { roomId, gameType, hostId } = req.body;

		if (!roomId || !gameType || !hostId) {
			return res.status(400).json({ error: 'Missing required fields' });
		}

		const session = await GameSessionManager.startGameSession(roomId, gameType, hostId);

		if (!session) {
			return res.status(500).json({ error: 'Failed to start session' });
		}

		res.json({ sessionId: session.id, startedAt: session.startedAt });
	} catch (error) {
		console.error('Error starting session:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Complete a game session
router.post('/sessions/complete', async (req, res) => {
	try {
		const { sessionId, results, gameData } = req.body;

		if (!sessionId || !results || !Array.isArray(results)) {
			return res.status(400).json({ error: 'Missing required fields' });
		}

		const result = await GameSessionManager.completeGameSession(
			sessionId,
			results,
			gameData
		);

		if (!result) {
			return res.status(500).json({ error: 'Failed to complete session' });
		}

		res.json({
			success: true,
			sessionId: result.session.id,
			resultsCount: result.results.length,
		});
	} catch (error) {
		console.error('Error completing session:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Get session details
router.get('/sessions/:sessionId', async (req, res) => {
	try {
		const { sessionId } = req.params;

		const session = await prisma.gameSession.findUnique({
			where: { id: sessionId },
			include: {
				gameType: true,
				results: true,
				gameRoom: true,
			},
		});

		if (!session) {
			return res.status(404).json({ error: 'Session not found' });
		}

		res.json(session);
	} catch (error) {
		console.error('Error fetching session:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

export default router;

