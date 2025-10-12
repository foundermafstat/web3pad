import { Trophy, Star, Target, TrendingUp } from 'lucide-react';

interface ProfileHeaderProps {
	user: {
		username: string;
		displayName: string;
		avatar?: string;
		level: number;
		experience: number;
		coins: number;
		createdAt: string;
	};
	stats: {
		totalGamesPlayed: number;
		totalGamesWon: number;
		totalScore: number;
		winRate: number;
	};
}

export function ProfileHeader({ user, stats }: ProfileHeaderProps) {
	// Calculate experience progress to next level (example: 1000 XP per level)
	const xpPerLevel = 1000;
	const currentLevelXP = user.experience % xpPerLevel;
	const xpProgress = (currentLevelXP / xpPerLevel) * 100;

	return (
		<div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
			{/* Banner Background */}
			<div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />

			<div className="px-6 pb-6">
				{/* Avatar and Basic Info */}
				<div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
					{/* Avatar */}
					<div className="relative">
						{user.avatar ? (
							<img
								src={user.avatar}
								alt={user.displayName}
								className="w-32 h-32 rounded-lg border-4 border-background object-cover"
								crossOrigin="anonymous"
								referrerPolicy="no-referrer"
								onError={(e) => {
									const target = e.target as HTMLImageElement;
									target.style.display = 'none';
									target.nextElementSibling?.classList.remove('hidden');
								}}
							/>
						) : null}
						<div className={`w-32 h-32 rounded-lg border-4 border-background bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold ${user.avatar ? 'hidden' : ''}`}>
							{user.displayName[0].toUpperCase()}
						</div>
						<div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold border-2 border-background">
							{user.level}
						</div>
					</div>

					{/* Name and Stats */}
					<div className="flex-1">
						<h1 className="text-3xl font-bold text-foreground">{user.displayName}</h1>
						<p className="text-muted-foreground">@{user.username}</p>

						{/* XP Progress Bar */}
						<div className="mt-3 max-w-md">
							<div className="flex justify-between text-sm text-muted-foreground mb-1">
								<span>Level {user.level}</span>
								<span>
									{currentLevelXP} / {xpPerLevel} XP
								</span>
							</div>
							<div className="h-2 bg-muted rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
									style={{ width: `${xpProgress}%` }}
								/>
							</div>
						</div>
					</div>

					{/* Quick Stats */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<StatCard
							icon={<Target className="w-5 h-5" />}
							label="Games Played"
							value={stats.totalGamesPlayed}
							color="blue"
						/>
						<StatCard
							icon={<Trophy className="w-5 h-5" />}
							label="Games Won"
							value={stats.totalGamesWon}
							color="yellow"
						/>
						<StatCard
							icon={<Star className="w-5 h-5" />}
							label="Total Score"
							value={stats.totalScore.toLocaleString()}
							color="purple"
						/>
						<StatCard
							icon={<TrendingUp className="w-5 h-5" />}
							label="Win Rate"
							value={`${stats.winRate}%`}
							color="green"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

function StatCard({ icon, label, value, color }: any) {
	const colorClasses = {
		blue: 'text-blue-500 bg-blue-500/10',
		yellow: 'text-yellow-500 bg-yellow-500/10',
		purple: 'text-purple-500 bg-purple-500/10',
		green: 'text-green-500 bg-green-500/10',
	};

	return (
		<div className="bg-muted/50 rounded-lg p-3 text-center">
			<div className={`inline-flex p-2 rounded-lg mb-2 ${colorClasses[color]}`}>
				{icon}
			</div>
			<div className="text-2xl font-bold text-foreground">{value}</div>
			<div className="text-xs text-muted-foreground">{label}</div>
		</div>
	);
}

