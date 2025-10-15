'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
	Clock, 
	Users, 
	Gamepad2, 
	Star, 
	ArrowLeft, 
	Play, 
	Image as ImageIcon,
	Video,
	Trophy,
	Target,
	Zap,
	CheckCircle,
	Lightbulb,
	Award,
	TrendingUp,
	BarChart3,
	Crown,
	Medal
} from 'lucide-react';

interface GameAchievement {
	id: string;
	code: string;
	title: string;
	description: string;
	icon?: string;
	points: number;
	sortOrder?: number;
}

interface GameType {
	id: string;
	code: string;
	name: string;
	shortDescription: string;
	fullDescription: string;
	icon: string;
	images: string[];
	videos: string[];
	category: string[];
	gameType: string;
	minPlayers: number;
	maxPlayers: number;
	difficulty: string;
	estimatedDuration?: number;
	controls: string[];
	features?: any;
	howToPlay?: any;
	tips?: any;
	isFeatured: boolean;
	gameAchievements?: GameAchievement[];
}

interface GameDetailViewProps {
	gameCode: string;
}

export function GameDetailView({ gameCode }: GameDetailViewProps) {
	const [game, setGame] = useState<GameType | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeImageIndex, setActiveImageIndex] = useState(0);
	const [activeTab, setActiveTab] = useState('description');

	useEffect(() => {
		fetch(`/api/games/${gameCode}`)
			.then((res) => res.json())
			.then((data) => {
				console.log('Game data received:', data);
				setGame(data.game);
				setLoading(false);
			})
			.catch((error) => {
				console.error('Error fetching game:', error);
				setLoading(false);
			});
	}, [gameCode]);

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case 'easy':
				return 'bg-green-500/10 text-green-500 border-green-500/20';
			case 'medium':
				return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
			case 'hard':
				return 'bg-red-500/10 text-red-500 border-red-500/20';
			default:
				return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
		}
	};

	const getDifficultyText = (difficulty: string) => {
		switch (difficulty) {
			case 'easy': return 'Easy';
			case 'medium': return 'Medium';
			case 'hard': return 'Hard';
			default: return difficulty;
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto py-8">
				<div className="animate-pulse">
					<div className="h-8 bg-muted rounded mb-4 w-1/4" />
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<div className="h-96 bg-muted rounded" />
						<div className="space-y-4">
							<div className="h-8 bg-muted rounded w-3/4" />
							<div className="h-4 bg-muted rounded" />
							<div className="h-4 bg-muted rounded w-2/3" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!game) {
		return (
			<div className="container mx-auto py-8 text-center">
				<h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
				<Link href="/games">
					<Button>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Games
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8">
			{/* Breadcrumb */}
			<div className="mb-6">
				<Link 
					href="/games" 
					className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
				>
					<ArrowLeft className="w-4 h-4" />
					Back to Games
				</Link>
			</div>

			{/* Game Header */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
				{/* Image Gallery */}
				<div className="space-y-4">
					<Card className="overflow-hidden">
						<div className="relative h-96 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
							{game.images.length > 0 ? (
								<img
									src={game.images[activeImageIndex]}
									alt={game.name}
									className="w-full h-full object-cover"
									onError={(e) => {
										e.currentTarget.style.display = 'none';
									}}
								/>
							) : (
								<span className="text-8xl">{game.icon}</span>
							)}
							{game.isFeatured && (
								<Badge className="absolute top-4 right-4 bg-yellow-500/90 text-black">
									<Star className="w-3 h-3 mr-1" />
									Featured
								</Badge>
							)}
							<Badge
								variant={game.gameType === 'web3' ? 'default' : 'secondary'}
								className="absolute top-4 left-4"
							>
								{game.gameType.toUpperCase()}
							</Badge>
						</div>
					</Card>

					{/* Thumbnail Gallery */}
					{game.images.length > 1 && (
						<div className="flex gap-2 overflow-x-auto">
							{game.images.map((image, index) => (
								<button
									key={index}
									onClick={() => setActiveImageIndex(index)}
									className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
										index === activeImageIndex
											? 'border-primary'
											: 'border-border hover:border-muted-foreground'
									}`}
								>
									<img
										src={image}
										alt={`${game.name} ${index + 1}`}
										className="w-full h-full object-cover"
									/>
								</button>
							))}
						</div>
					)}
				</div>

				{/* Game Info */}
				<div className="space-y-6">
					<div>
						<h1 className="text-4xl font-bold mb-2">{game.name}</h1>
						<p className="text-xl text-muted-foreground mb-4">{game.shortDescription}</p>
						
						{/* Category Tags */}
						<div className="flex flex-wrap gap-2 mb-4">
							{game.category.map((cat) => (
								<Badge key={cat} variant="outline">
									{cat}
								</Badge>
							))}
						</div>
					</div>

					{/* Game Stats */}
					<div className="grid grid-cols-2 gap-4">
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center gap-2 mb-2">
									<Users className="w-4 h-4 text-muted-foreground" />
									<span className="text-sm font-medium">Players</span>
								</div>
								<p className="text-2xl font-bold">{game.minPlayers}-{game.maxPlayers}</p>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-4">
								<div className="flex items-center gap-2 mb-2">
									<Clock className="w-4 h-4 text-muted-foreground" />
									<span className="text-sm font-medium">Duration</span>
								</div>
								<p className="text-2xl font-bold">
									{game.estimatedDuration ? `${game.estimatedDuration} min` : 'Varies'}
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-4">
								<div className="flex items-center gap-2 mb-2">
									<Target className="w-4 h-4 text-muted-foreground" />
									<span className="text-sm font-medium">Difficulty</span>
								</div>
								<Badge className={getDifficultyColor(game.difficulty)}>
									{getDifficultyText(game.difficulty)}
								</Badge>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-4">
								<div className="flex items-center gap-2 mb-2">
									<Gamepad2 className="w-4 h-4 text-muted-foreground" />
									<span className="text-sm font-medium">Controls</span>
								</div>
								<p className="text-sm text-muted-foreground">
									{game.controls.slice(0, 2).join(', ')}
									{game.controls.length > 2 && `+${game.controls.length - 2}`}
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Play Button */}
					<div className="space-y-3">
						<Link href={`/game/${game.code}`}>
							<Button size="lg" className="w-full">
								<Play className="w-5 h-5 mr-2" />
								Play Now
							</Button>
						</Link>
						<Link href={`/test-game/${game.code}`}>
							<Button variant="outline" size="lg" className="w-full">
								<Zap className="w-5 h-5 mr-2" />
								Test Mode
							</Button>
						</Link>
					</div>
				</div>
			</div>

			{/* Game Details Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="description">Description</TabsTrigger>
					<TabsTrigger value="controls">How to Play</TabsTrigger>
					<TabsTrigger value="media">Media</TabsTrigger>
					<TabsTrigger value="stats">Achievements</TabsTrigger>
				</TabsList>

				{/* Description Tab */}
				<TabsContent value="description" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>About This Game</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground leading-relaxed text-lg mb-6">
								{game.fullDescription}
							</p>
						</CardContent>
					</Card>

					{/* Key Features */}
					{game.features && Array.isArray(game.features) && game.features.length > 0 ? (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Star className="w-5 h-5 text-yellow-500" />
									Key Features
								</CardTitle>
								<CardDescription>
									What makes this game special
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid md:grid-cols-2 gap-4">
									{game.features.map((feature: any, index: number) => (
										<div key={index} className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
											<div className="text-3xl flex-shrink-0">{feature.icon}</div>
											<div>
												<h4 className="font-semibold mb-1">{feature.title}</h4>
												<p className="text-sm text-muted-foreground">{feature.description}</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardContent className="p-6 text-center text-muted-foreground">
								<p>Game features information will be available soon.</p>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* How to Play Tab */}
				<TabsContent value="controls" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Gamepad2 className="w-5 h-5 text-primary" />
								Control Types
							</CardTitle>
							<CardDescription>
								Supported control methods in the game
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid md:grid-cols-2 gap-3">
								{game.controls.map((control) => (
									<div key={control} className="flex items-center gap-3 p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-transparent">
										<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
											<Gamepad2 className="w-5 h-5 text-primary" />
										</div>
										<span className="font-medium capitalize">{control}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* How to Play Steps */}
					{game.howToPlay && Array.isArray(game.howToPlay) && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Play className="w-5 h-5 text-green-500" />
									How to Play
								</CardTitle>
								<CardDescription>
									Step-by-step guide to get started
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{game.howToPlay.map((step: string, index: number) => (
										<div key={index} className="flex gap-4 items-start">
											<div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
												<span className="text-sm font-bold text-primary-foreground">{index + 1}</span>
											</div>
											<p className="text-muted-foreground pt-1">{step}</p>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Pro Tips */}
					{game.tips && Array.isArray(game.tips) && (
						<Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Lightbulb className="w-5 h-5 text-yellow-500" />
									Pro Tips
								</CardTitle>
								<CardDescription>
									Expert strategies to improve your gameplay
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-3">
									{game.tips.map((tip: string, index: number) => (
										<li key={index} className="flex gap-3 items-start">
											<CheckCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
											<span className="text-muted-foreground">{tip}</span>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Media Tab */}
				<TabsContent value="media">
					<div className="grid gap-6">
						{game.videos.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Video className="w-5 h-5" />
										Gameplay Videos
									</CardTitle>
									<CardDescription>
										Watch gameplay footage and trailers
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid gap-4">
										{game.videos.map((video, index) => (
											<video
												key={index}
												controls
												className="w-full rounded-lg border"
												poster={game.images[0]}
											>
												<source src={video} type="video/mp4" />
												Your browser does not support video.
											</video>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{game.images.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<ImageIcon className="w-5 h-5" />
										Screenshots
									</CardTitle>
									<CardDescription>
										View game screenshots and visual highlights
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
										{game.images.map((image, index) => (
											<button
												key={index}
												onClick={() => setActiveImageIndex(index)}
												className="aspect-video rounded-lg overflow-hidden border-2 hover:border-primary transition-all hover:scale-105"
											>
												<img
													src={image}
													alt={`${game.name} ${index + 1}`}
													className="w-full h-full object-cover"
												/>
											</button>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Game Info Card */}
						<Card className="bg-gradient-to-br from-primary/5 to-transparent">
							<CardHeader>
								<CardTitle>Ready to Experience?</CardTitle>
								<CardDescription>
									Join thousands of players enjoying this game
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-3 gap-4 text-center">
									<div className="p-4 rounded-lg bg-background/50">
										<Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
										<div className="text-2xl font-bold">1.2K+</div>
										<div className="text-xs text-muted-foreground">Active Players</div>
									</div>
									<div className="p-4 rounded-lg bg-background/50">
										<Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
										<div className="text-2xl font-bold">5K+</div>
										<div className="text-xs text-muted-foreground">Games Played</div>
									</div>
									<div className="p-4 rounded-lg bg-background/50">
										<Star className="w-6 h-6 mx-auto mb-2 text-purple-500" />
										<div className="text-2xl font-bold">4.8</div>
										<div className="text-xs text-muted-foreground">Rating</div>
									</div>
								</div>
								<Link href={`/game/${game.code}`}>
									<Button size="lg" className="w-full">
										<Play className="w-5 h-5 mr-2" />
										Start Playing Now
									</Button>
								</Link>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Achievements Tab */}
				<TabsContent value="stats" className="space-y-6">
					{game.gameAchievements && game.gameAchievements.length > 0 && (
						<>
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Trophy className="w-5 h-5 text-yellow-500" />
										Game Achievements
									</CardTitle>
									<CardDescription>
										Unlock exclusive rewards by mastering this game
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid gap-4">
										{game.gameAchievements.map((achievement) => (
											<div key={achievement.id} className="flex items-start gap-4 p-4 rounded-lg border bg-gradient-to-r from-yellow-500/5 to-transparent hover:from-yellow-500/10 transition-colors">
												<div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
													{achievement.icon ? (
														<span className="text-2xl">{achievement.icon}</span>
													) : (
														<Award className="w-6 h-6 text-yellow-500" />
													)}
												</div>
												<div className="flex-1">
													<div className="flex items-center justify-between mb-1">
														<h4 className="font-semibold">{achievement.title}</h4>
														<Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
															{achievement.points} pts
														</Badge>
													</div>
													<p className="text-sm text-muted-foreground">{achievement.description}</p>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>

							{/* Game Stats Overview */}
							<div className="grid md:grid-cols-3 gap-6">
								<Card className="text-center">
									<CardContent className="p-6">
										<div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
											<Users className="w-6 h-6 text-blue-500" />
										</div>
										<div className="text-3xl font-bold mb-1">1,247</div>
										<div className="text-sm text-muted-foreground">Total Players</div>
										<div className="flex items-center justify-center gap-1 mt-2 text-xs text-green-500">
											<TrendingUp className="w-3 h-3" />
											<span>+12% this week</span>
										</div>
									</CardContent>
								</Card>

								<Card className="text-center">
									<CardContent className="p-6">
										<div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
											<BarChart3 className="w-6 h-6 text-purple-500" />
										</div>
										<div className="text-3xl font-bold mb-1">4,832</div>
										<div className="text-sm text-muted-foreground">Matches Played</div>
										<div className="flex items-center justify-center gap-1 mt-2 text-xs text-green-500">
											<TrendingUp className="w-3 h-3" />
											<span>+23% this week</span>
										</div>
									</CardContent>
								</Card>

								<Card className="text-center">
									<CardContent className="p-6">
										<div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
											<Crown className="w-6 h-6 text-green-500" />
										</div>
										<div className="text-3xl font-bold mb-1">87</div>
										<div className="text-sm text-muted-foreground">Active Now</div>
										<div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
											<span>Peak: 156 players</span>
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Top Players Leaderboard Preview */}
							<Card>
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="flex items-center gap-2">
												<Medal className="w-5 h-5 text-orange-500" />
												Top Players
											</CardTitle>
											<CardDescription>
												Current leaderboard leaders
											</CardDescription>
										</div>
										<Link href="/leaderboard">
											<Button variant="outline" size="sm">View All</Button>
										</Link>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{[
											{ rank: 1, name: 'ProGamer_X', score: '12,450', icon: '🥇' },
											{ rank: 2, name: 'SpeedRunner', score: '11,820', icon: '🥈' },
											{ rank: 3, name: 'NightHawk', score: '10,995', icon: '🥉' },
										].map((player) => (
											<div key={player.rank} className="flex items-center gap-4 p-3 rounded-lg border">
												<span className="text-2xl">{player.icon}</span>
												<div className="flex-1">
													<div className="font-semibold">{player.name}</div>
													<div className="text-sm text-muted-foreground">Rank #{player.rank}</div>
												</div>
												<div className="text-right">
													<div className="font-bold text-primary">{player.score}</div>
													<div className="text-xs text-muted-foreground">points</div>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
