import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Starting database seed...');

	// Create game types
	console.log('Creating game types...');
	
	const shooter = await prisma.gameType.upsert({
		where: { code: 'shooter' },
		update: {},
		create: {
			code: 'shooter',
			name: 'Battle Arena',
			description: 'Multiplayer top-down shooter with bots and power-ups',
			icon: '🎯',
			minPlayers: 1,
			maxPlayers: 10,
			difficulty: 'medium',
		},
	});

	const race = await prisma.gameType.upsert({
		where: { code: 'race' },
		update: {},
		create: {
			code: 'race',
			name: 'Race Track',
			description: 'Competitive racing game with checkpoints and obstacles',
			icon: '🏎️',
			minPlayers: 1,
			maxPlayers: 8,
			difficulty: 'easy',
		},
	});

	const towerDefence = await prisma.gameType.upsert({
		where: { code: 'towerdefence' },
		update: {},
		create: {
			code: 'towerdefence',
			name: 'Tower Defence',
			description: 'Defend your castle from waves of enemies with strategic tower placement',
			icon: '🏰',
			minPlayers: 1,
			maxPlayers: 4,
			difficulty: 'hard',
		},
	});

	const quiz = await prisma.gameType.upsert({
		where: { code: 'quiz' },
		update: {},
		create: {
			code: 'quiz',
			name: 'Quiz Battle',
			description: 'Test your knowledge in a multiplayer quiz game with time pressure',
			icon: '🧠',
			minPlayers: 2,
			maxPlayers: 8,
			difficulty: 'medium',
		},
	});

	const gyroTest = await prisma.gameType.upsert({
		where: { code: 'gyrotest' },
		update: {},
		create: {
			code: 'gyrotest',
			name: 'Gyro Test',
			description: 'Test gyroscope and vibration features with mobile device',
			icon: '📱',
			minPlayers: 1,
			maxPlayers: 6,
			difficulty: 'easy',
		},
	});

	console.log('✅ Game types created');

	// Create sample quiz questions
	console.log('Creating quiz content...');
	
	const quizQuestions = [
		{
			category: 'general',
			difficulty: 'easy',
			data: {
				question: 'What is the capital of France?',
				answers: ['London', 'Berlin', 'Paris', 'Madrid'],
				correctIndex: 2,
				timeLimit: 10,
			},
		},
		{
			category: 'general',
			difficulty: 'easy',
			data: {
				question: 'How many continents are there?',
				answers: ['5', '6', '7', '8'],
				correctIndex: 2,
				timeLimit: 10,
			},
		},
		{
			category: 'science',
			difficulty: 'medium',
			data: {
				question: 'What is the chemical symbol for gold?',
				answers: ['Go', 'Gd', 'Au', 'Ag'],
				correctIndex: 2,
				timeLimit: 15,
			},
		},
		{
			category: 'science',
			difficulty: 'medium',
			data: {
				question: 'What planet is known as the Red Planet?',
				answers: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
				correctIndex: 1,
				timeLimit: 10,
			},
		},
		{
			category: 'history',
			difficulty: 'hard',
			data: {
				question: 'In what year did World War II end?',
				answers: ['1943', '1944', '1945', '1946'],
				correctIndex: 2,
				timeLimit: 15,
			},
		},
		{
			category: 'math',
			difficulty: 'easy',
			data: {
				question: 'What is 7 x 8?',
				answers: ['54', '56', '58', '60'],
				correctIndex: 1,
				timeLimit: 10,
			},
		},
		{
			category: 'geography',
			difficulty: 'medium',
			data: {
				question: 'Which is the longest river in the world?',
				answers: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
				correctIndex: 1,
				timeLimit: 15,
			},
		},
		{
			category: 'technology',
			difficulty: 'hard',
			data: {
				question: 'Who is considered the father of modern computing?',
				answers: ['Steve Jobs', 'Bill Gates', 'Alan Turing', 'Tim Berners-Lee'],
				correctIndex: 2,
				timeLimit: 20,
			},
		},
	];

	for (const question of quizQuestions) {
		await prisma.gameContent.create({
			data: {
				gameTypeId: quiz.id,
				type: 'question',
				category: question.category,
				difficulty: question.difficulty,
				data: question.data,
			},
		});
	}

	console.log('✅ Quiz content created');

	// Create achievements
	console.log('Creating achievements...');
	
	const achievements = [
		{
			code: 'first_win',
			name: 'First Victory',
			description: 'Win your first game',
			category: 'gameplay',
			points: 10,
			criteria: { wins: 1 },
		},
		{
			code: 'perfectionist',
			name: 'Perfectionist',
			description: 'Get a perfect score in Quiz',
			category: 'gameplay',
			points: 25,
			criteria: { correctAnswers: '100%' },
		},
		{
			code: 'speed_demon',
			name: 'Speed Demon',
			description: 'Complete a race in under 60 seconds',
			category: 'gameplay',
			points: 20,
			criteria: { lapTime: { less: 60000 } },
		},
		{
			code: 'social_butterfly',
			name: 'Social Butterfly',
			description: 'Play with 10 different players',
			category: 'social',
			points: 15,
			criteria: { uniquePlayers: 10 },
		},
		{
			code: 'marathon_runner',
			name: 'Marathon Runner',
			description: 'Play 100 games',
			category: 'gameplay',
			points: 50,
			criteria: { gamesPlayed: 100 },
		},
		{
			code: 'sharp_shooter',
			name: 'Sharp Shooter',
			description: 'Get 50 kills in shooter games',
			category: 'gameplay',
			points: 30,
			criteria: { totalKills: 50 },
		},
	];

	for (const achievement of achievements) {
		await prisma.achievement.upsert({
			where: { code: achievement.code },
			update: {},
			create: achievement,
		});
	}

	console.log('✅ Achievements created');

	// Get all existing users
	console.log('Fetching existing users...');
	const users = await prisma.user.findMany();
	console.log(`Found ${users.length} users in database`);

	if (users.length === 0) {
		console.log('No users found, skipping game sessions creation');
		console.log('🎉 Database seeding completed!');
		return;
	}

	console.log('Creating test game sessions and results...');

	// Create test sessions for each game type
	const gameTypes = [shooter, race, quiz, towerDefence];
	const sessionIds = [];

	for (let gameTypeIndex = 0; gameTypeIndex < gameTypes.length; gameTypeIndex++) {
		const gameType = gameTypes[gameTypeIndex];
		
		// Create 2-3 sessions per game type
		const sessionsToCreate = Math.floor(Math.random() * 2) + 2;
		
		for (let i = 0; i < sessionsToCreate; i++) {
			// Pick random host
			const host = users[Math.floor(Math.random() * users.length)];
			
			// Create game room
			const roomId = `test-${gameType.code}-${i}-${Date.now()}`;
			const gameRoom = await prisma.gameRoom.create({
				data: {
					roomId,
					name: `Test ${gameType.name} Room ${i + 1}`,
					gameTypeId: gameType.id,
					hostId: host.id,
					maxPlayers: gameType.maxPlayers,
					currentPlayers: Math.min(users.length, gameType.maxPlayers),
					hasPassword: false,
					status: 'finished',
					config: {},
					closedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
				},
			});

			// Create game session
			const sessionDuration = Math.floor(Math.random() * 600) + 180; // 3-13 minutes
			const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
			const endTime = new Date(startTime.getTime() + sessionDuration * 1000);

			const session = await prisma.gameSession.create({
				data: {
					gameRoomId: gameRoom.id,
					gameTypeId: gameType.id,
					hostId: host.id,
					status: 'completed',
					startedAt: startTime,
					endedAt: endTime,
					duration: sessionDuration,
					gameData: {
						rounds: gameType.code === 'quiz' ? 5 : null,
						difficulty: gameType.difficulty,
					},
				},
			});

			sessionIds.push(session.id);

			// Select random players for this session (2-maxPlayers)
			const playersCount = Math.min(
				Math.floor(Math.random() * (gameType.maxPlayers - 1)) + 2,
				users.length
			);
			const sessionPlayers = [...users]
				.sort(() => Math.random() - 0.5)
				.slice(0, playersCount);

			// Create results for each player
			for (let j = 0; j < sessionPlayers.length; j++) {
				const player = sessionPlayers[j];
				const rank = j + 1;
				
				// Generate game-specific stats
				let gameResult = {
					sessionId: session.id,
					playerId: player.id,
					playerName: player.displayName,
					rank,
				};

				switch (gameType.code) {
					case 'quiz':
						const totalQuestions = 5;
						const correctAnswers = Math.max(0, totalQuestions - rank);
						gameResult.questionsTotal = totalQuestions;
						gameResult.questionsRight = correctAnswers;
						gameResult.score = correctAnswers * 100 + Math.floor(Math.random() * 50);
						gameResult.performance = {
							accuracy: (correctAnswers / totalQuestions) * 100,
							avgResponseTime: Math.random() * 5 + 2,
						};
						break;

					case 'shooter':
						const kills = Math.max(1, 20 - rank * 3 + Math.floor(Math.random() * 5));
						const deaths = rank + Math.floor(Math.random() * 5);
						gameResult.kills = kills;
						gameResult.deaths = deaths;
						gameResult.score = kills * 100 - deaths * 10;
						gameResult.performance = {
							kd: kills / Math.max(1, deaths),
							accuracy: Math.random() * 0.4 + 0.3,
						};
						break;

					case 'race':
						const lapTime = 30000 + rank * 5000 + Math.floor(Math.random() * 3000);
						gameResult.lapTime = lapTime;
						gameResult.score = Math.floor(100000 / lapTime);
						gameResult.performance = {
							topSpeed: Math.random() * 100 + 150,
							avgSpeed: Math.random() * 50 + 100,
						};
						break;

					case 'towerdefence':
						const wavesCompleted = Math.max(1, 10 - rank + Math.floor(Math.random() * 3));
						gameResult.score = wavesCompleted * 500 + Math.floor(Math.random() * 200);
						gameResult.performance = {
							wavesCompleted,
							towersBuilt: Math.floor(Math.random() * 20) + 10,
							enemiesKilled: wavesCompleted * 15,
						};
						break;
				}

				// Create game result
				await prisma.gameResult.create({
					data: gameResult,
				});
			}

			console.log(`✅ Created session for ${gameType.name} with ${sessionPlayers.length} players`);
		}
	}

	console.log('Creating/updating player statistics...');

	// Calculate and create player stats for each user and game type
	for (const user of users) {
		for (const gameType of gameTypes) {
			// Get all results for this user and game type
			const userResults = await prisma.gameResult.findMany({
				where: {
					playerId: user.id,
					session: {
						gameTypeId: gameType.id,
					},
				},
				include: {
					session: true,
				},
			});

			if (userResults.length === 0) continue;

			// Calculate stats
			const gamesPlayed = userResults.length;
			const gamesWon = userResults.filter((r) => r.rank === 1).length;
			const gamesLost = gamesPlayed - gamesWon;
			const totalScore = userResults.reduce((sum, r) => sum + (r.score || 0), 0);
			const highestScore = Math.max(...userResults.map((r) => r.score || 0));
			const averageScore = totalScore / gamesPlayed;
			const winRate = (gamesWon / gamesPlayed) * 100;

			// Game-specific stats
			const totalKills = userResults.reduce((sum, r) => sum + (r.kills || 0), 0);
			const totalDeaths = userResults.reduce((sum, r) => sum + (r.deaths || 0), 0);
			const lapTimes = userResults.filter((r) => r.lapTime).map((r) => r.lapTime);
			const bestLapTime = lapTimes.length > 0 ? Math.min(...lapTimes) : null;
			const totalRaceTime = lapTimes.reduce((sum, t) => sum + t, 0);
			const questionsAnswered = userResults.reduce((sum, r) => sum + (r.questionsTotal || 0), 0);
			const questionsCorrect = userResults.reduce((sum, r) => sum + (r.questionsRight || 0), 0);
			const averageRank = userResults.reduce((sum, r) => sum + (r.rank || 0), 0) / gamesPlayed;

			// Create or update player stats
			await prisma.playerStats.upsert({
				where: {
					userId_gameTypeId: {
						userId: user.id,
						gameTypeId: gameType.id,
					},
				},
				update: {
					gamesPlayed,
					gamesWon,
					gamesLost,
					totalScore,
					highestScore,
					averageScore,
					totalKills,
					totalDeaths,
					bestLapTime,
					totalRaceTime,
					questionsAnswered,
					questionsCorrect,
					winRate,
					averageRank,
					lastPlayedAt: new Date(),
				},
				create: {
					userId: user.id,
					gameTypeId: gameType.id,
					gamesPlayed,
					gamesWon,
					gamesLost,
					totalScore,
					highestScore,
					averageScore,
					totalKills,
					totalDeaths,
					bestLapTime,
					totalRaceTime,
					questionsAnswered,
					questionsCorrect,
					winRate,
					averageRank,
					lastPlayedAt: new Date(),
				},
			});

			console.log(`✅ Stats created for ${user.username} in ${gameType.name}`);
		}

		// Update user level and experience based on total score
		const allUserStats = await prisma.playerStats.findMany({
			where: { userId: user.id },
		});

		const totalScore = allUserStats.reduce((sum, s) => sum + s.totalScore, 0);
		const experience = Math.floor(totalScore / 10);
		const level = Math.floor(experience / 1000) + 1;

		await prisma.user.update({
			where: { id: user.id },
			data: {
				experience,
				level,
				coins: Math.floor(totalScore / 50),
			},
		});

		console.log(`✅ Updated ${user.username}: Level ${level}, ${experience} XP`);
	}

	console.log('Creating user achievements...');

	// Award achievements based on stats
	for (const user of users) {
		const userStats = await prisma.playerStats.findMany({
			where: { userId: user.id },
		});

		const totalWins = userStats.reduce((sum, s) => sum + s.gamesWon, 0);
		const totalGames = userStats.reduce((sum, s) => sum + s.gamesPlayed, 0);
		const totalKills = userStats.reduce((sum, s) => sum + (s.totalKills || 0), 0);

		// Award "First Victory" if user has any wins
		if (totalWins > 0) {
			const firstWinAchievement = achievements.find((a) => a.code === 'first_win');
			await prisma.userAchievement.upsert({
				where: {
					userId_achievementId: {
						userId: user.id,
						achievementId: (await prisma.achievement.findUnique({ where: { code: 'first_win' } })).id,
					},
				},
				update: {},
				create: {
					userId: user.id,
					achievementId: (await prisma.achievement.findUnique({ where: { code: 'first_win' } })).id,
					unlockedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
				},
			});
		}

		// Award "Sharp Shooter" if user has 50+ kills
		if (totalKills >= 50) {
			await prisma.userAchievement.upsert({
				where: {
					userId_achievementId: {
						userId: user.id,
						achievementId: (await prisma.achievement.findUnique({ where: { code: 'sharp_shooter' } })).id,
					},
				},
				update: {},
				create: {
					userId: user.id,
					achievementId: (await prisma.achievement.findUnique({ where: { code: 'sharp_shooter' } })).id,
					unlockedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
				},
			});
		}

		// Award "Marathon Runner" if user has 100+ games
		if (totalGames >= 100) {
			await prisma.userAchievement.upsert({
				where: {
					userId_achievementId: {
						userId: user.id,
						achievementId: (await prisma.achievement.findUnique({ where: { code: 'marathon_runner' } })).id,
					},
				},
				update: {},
				create: {
					userId: user.id,
					achievementId: (await prisma.achievement.findUnique({ where: { code: 'marathon_runner' } })).id,
					unlockedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
				},
			});
		}

		console.log(`✅ Achievements awarded to ${user.username}`);
	}

	console.log('🎉 Database seeding completed with test data!');
	console.log(`📊 Summary:`);
	console.log(`   - ${users.length} users`);
	console.log(`   - ${gameTypes.length} game types`);
	console.log(`   - ${sessionIds.length} game sessions`);
	console.log(`   - Multiple player stats and achievements created`);
}

main()
	.catch((e) => {
		console.error('❌ Error seeding database:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

