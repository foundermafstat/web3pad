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

	console.log('🎉 Database seeding completed!');
}

main()
	.catch((e) => {
		console.error('❌ Error seeding database:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

