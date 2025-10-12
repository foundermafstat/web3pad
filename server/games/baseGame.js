import GameSessionManager from '../lib/game-session-manager.js';

// Базовый класс игры
export class BaseGame {
	constructor(gameId, config = {}) {
		this.gameId = gameId;
		this.gameType = 'base';
		this.players = new Map();
		this.config = config;
		this.state = {};
		this.lastUpdate = Date.now();
		
		// Session tracking
		this.sessionId = null;
		this.hostId = config.hostId || config.userId || null;
		this.sessionStarted = false;
		this.sessionCompleted = false;
	}

	// Добавить игрока
	addPlayer(playerId, playerName) {
		throw new Error('Method addPlayer must be implemented');
	}

	// Удалить игрока
	removePlayer(playerId) {
		this.players.delete(playerId);
		return true;
	}

	// Обработать входящие данные от игрока
	handlePlayerInput(playerId, input) {
		throw new Error('Method handlePlayerInput must be implemented');
	}

	// Обновить игровое состояние
	update(deltaTime) {
		throw new Error('Method update must be implemented');
	}

	// Получить игровое состояние для отправки клиенту
	getGameState() {
		throw new Error('Method getGameState must be implemented');
	}

	// Получить информацию об игре
	getGameInfo() {
		return {
			gameId: this.gameId,
			gameType: this.gameType,
			playerCount: this.players.size,
			config: this.config,
			sessionId: this.sessionId,
		};
	}

	// Start database session tracking
	async startSession() {
		if (this.sessionStarted || !this.hostId) return;

		try {
			const session = await GameSessionManager.startGameSession(
				this.gameId,
				this.gameType,
				this.hostId
			);

			if (session) {
				this.sessionId = session.id;
				this.sessionStarted = true;
				console.log(`[BaseGame] Session started: ${this.sessionId} for game ${this.gameId}`);
			}
		} catch (error) {
			console.error('[BaseGame] Error starting session:', error);
		}
	}

	// Complete session and save results
	async completeSession(results) {
		if (this.sessionCompleted || !this.sessionId) return;

		try {
			await GameSessionManager.completeGameSession(
				this.sessionId,
				results,
				this.getGameData()
			);

			this.sessionCompleted = true;
			console.log(`[BaseGame] Session completed: ${this.sessionId}`);
		} catch (error) {
			console.error('[BaseGame] Error completing session:', error);
		}
	}

	// Get game-specific data to save
	getGameData() {
		return {
			gameType: this.gameType,
			config: this.config,
			finalState: this.getGameState(),
		};
	}

	// Prepare results for database
	prepareResults() {
		const playersArray = Array.from(this.players.values());
		const sortedPlayers = [...playersArray].sort((a, b) => (b.score || 0) - (a.score || 0));

		return sortedPlayers.map((player, index) => ({
			userId: player.userId || player.id,
			playerId: player.id,
			playerName: player.name,
			username: player.username || player.name,
			score: player.score || 0,
			rank: index + 1,
			kills: player.kills,
			deaths: player.deaths,
			lapTime: player.lapTime,
			questionsRight: player.correctAnswers,
			questionsTotal: player.correctAnswers + player.wrongAnswers,
			performance: {
				accuracy: player.correctAnswers 
					? (player.correctAnswers / (player.correctAnswers + player.wrongAnswers)) * 100 
					: 0,
			},
			achievements: [],
		}));
	}
}
