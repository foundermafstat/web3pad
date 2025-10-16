import express from 'express';
import { stacksIntegration } from '../lib/stacks-integration.js';
import GameRoomManager from '../gameRoomManager.js';

const router = express.Router();

// Get blockchain integration status
router.get('/status', async (req, res) => {
	try {
		const status = {
			enabled: stacksIntegration.enabled,
			network: stacksIntegration.network.coreApiUrl,
			registryContract: stacksIntegration.registryContractAddress,
			shooterContract: stacksIntegration.shooterGameContractAddress
		};
		
		res.json({ success: true, data: status });
	} catch (error) {
		console.error('[Blockchain API] Error getting status:', error);
		res.status(500).json({ success: false, error: error.message });
	}
});

// Set player blockchain address
router.post('/set-address', async (req, res) => {
	try {
		const { roomId, playerId, address, nftTokenId } = req.body;
		
		if (!roomId || !playerId || !address) {
			return res.status(400).json({ 
				success: false, 
				error: 'Missing required fields: roomId, playerId, address' 
			});
		}

		const room = GameRoomManager.getRoom(roomId);
		if (!room) {
			return res.status(404).json({ 
				success: false, 
				error: 'Room not found' 
			});
		}

		// Set player address in game
		room.game.setPlayerAddress(playerId, address);

		// Start blockchain session if game is active
		if (room.game.sessionStarted && !room.game.sessionCompleted) {
			const blockchainResult = await room.game.startBlockchainSession(playerId, address, nftTokenId);
			
			if (blockchainResult) {
				res.json({ 
					success: true, 
					data: {
						blockchainSessionId: blockchainResult.sessionId,
						txId: blockchainResult.txId
					}
				});
			} else {
				res.json({ 
					success: false, 
					error: 'Failed to start blockchain session' 
				});
			}
		} else {
			res.json({ 
				success: true, 
				data: { message: 'Address set, blockchain session will start when game begins' }
			});
		}

	} catch (error) {
		console.error('[Blockchain API] Error setting address:', error);
		res.status(500).json({ success: false, error: error.message });
	}
});

// Get transaction status
router.get('/tx/:txId/status', async (req, res) => {
	try {
		const { txId } = req.params;
		
		if (!txId) {
			return res.status(400).json({ 
				success: false, 
				error: 'Transaction ID required' 
			});
		}

		const status = await stacksIntegration.getTransactionStatus(txId);
		res.json(status);

	} catch (error) {
		console.error('[Blockchain API] Error getting transaction status:', error);
		res.status(500).json({ success: false, error: error.message });
	}
});

// Register game module (admin only)
router.post('/register-module', async (req, res) => {
	try {
		const { 
			name, 
			description, 
			version, 
			contractAddress, 
			category, 
			minStake, 
			maxPlayers 
		} = req.body;

		if (!name || !description || !version || !contractAddress || !category) {
			return res.status(400).json({ 
				success: false, 
				error: 'Missing required fields for module registration' 
			});
		}

		const moduleData = {
			name,
			description,
			version,
			contractAddress,
			category,
			minStake: minStake || 0,
			maxPlayers: maxPlayers || 8
		};

		const result = await stacksIntegration.registerGameModule(moduleData);
		res.json(result);

	} catch (error) {
		console.error('[Blockchain API] Error registering module:', error);
		res.status(500).json({ success: false, error: error.message });
	}
});

// Setup reward for session (admin only)
router.post('/setup-reward', async (req, res) => {
	try {
		const { sessionId, playerAddress, amount, ftContract } = req.body;

		if (!sessionId || !playerAddress || !amount) {
			return res.status(400).json({ 
				success: false, 
				error: 'Missing required fields: sessionId, playerAddress, amount' 
			});
		}

		const result = await stacksIntegration.setupReward(sessionId, playerAddress, amount, ftContract);
		res.json(result);

	} catch (error) {
		console.error('[Blockchain API] Error setting up reward:', error);
		res.status(500).json({ success: false, error: error.message });
	}
});

// Get game session blockchain data
router.get('/room/:roomId/session-data', async (req, res) => {
	try {
		const { roomId } = req.params;
		
		const room = GameRoomManager.getRoom(roomId);
		if (!room) {
			return res.status(404).json({ 
				success: false, 
				error: 'Room not found' 
			});
		}

		const sessionData = {
			blockchainEnabled: room.game.blockchainEnabled,
			blockchainSessionId: room.game.blockchainSessionId,
			playerAddresses: Object.fromEntries(room.game.playerAddresses),
			blockchainResults: room.game.blockchainResults || []
		};

		res.json({ success: true, data: sessionData });

	} catch (error) {
		console.error('[Blockchain API] Error getting session data:', error);
		res.status(500).json({ success: false, error: error.message });
	}
});

// Manual game result submission (for testing)
router.post('/submit-result', async (req, res) => {
	try {
		const { playerAddress, score, gameType, metadata } = req.body;

		if (!playerAddress || score === undefined || !gameType) {
			return res.status(400).json({ 
				success: false, 
				error: 'Missing required fields: playerAddress, score, gameType' 
			});
		}

		const gameResult = {
			playerAddress,
			score,
			gameType,
			metadata: metadata || {}
		};

		const result = await stacksIntegration.sendGameResult(gameResult);
		res.json(result);

	} catch (error) {
		console.error('[Blockchain API] Error submitting result:', error);
		res.status(500).json({ success: false, error: error.message });
	}
});

export default router;
